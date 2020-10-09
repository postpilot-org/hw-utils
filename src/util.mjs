import {
  VALID_MERGE_VARS,
  INVALID_CHARACTERS,
  US_STATES,
  TWO_LETTER_NAMES,
  INVALID_CHARS_ASCII,
} from './constants.mjs'
import uniq from 'lodash/uniq'

// function toTitleCase(str = '') {
//   return str.replace(/\w\S*/g, function(txt) {
//     return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
//   })
// }

function toTitleCase(str) {
  str = str ? str : ''
  return str.replace(/(^|\s)([a-z])/g, function(m, p1, p2) {
    return p1 + p2.toUpperCase()
  })
}

export const usesInvalidCharacters = message => {
  return new RegExp(INVALID_CHARACTERS, 'g').test(message)
}

export const stateAbbr = stateName => {
  const stateObj =
    US_STATES.find(state => state.name.toLowerCase() === stateName.toLowerCase()) ||
    US_STATES.find(state => state.abbr.toLowerCase() === stateName.toLowerCase())

  return !stateObj ? '' : stateObj.abbr.toUpperCase()
}

export const validateMergeVars = message => {
  const vars = message.match(/(\{.+?\})/gm)
  let illegals = []

  if (!vars) {
    return illegals
  }

  vars.forEach(mv => {
    if (!VALID_MERGE_VARS.includes(mv)) {
      illegals.push(mv)
    }
  })

  return illegals
}

export const validateContactInfo = (contact = {}) => {
  let errors = []
  const fields = [
    'firstName',
    'lastName',
    'street1',
    'street2',
    'city',
    'state',
    'zip',
    'company',
  ]
  const shouldBeCapped = ['firstName', 'lastName', 'street1', 'street2', 'city', 'state']
  const requiredFields = ['street1', 'city', 'state', 'zip']
  const charLimits = [
    ['street1', 27],
    ['firstName', 17],
    ['lastName', 17],
    ['company', 26],
  ]
  const abbreviatables = ['street1', 'street2']

  if (!contact.street1 && !contact.firstName) {
    errors.push({
      identifier: 'Contact',
      errorMsg: 'does not contain a street address',
    })
  }

  // check for required fields
  requiredFields.forEach(f => {
    if (!contact[f]) {
      errors.push({
        identifier: f,
        errorMsg: `is required for creating a contact`,
      })
    }
  })

  // check for illegal characters
  fields.forEach(f => {
    if (contact[f] && usesInvalidCharacters(contact[f])) {
      errors.push({
        identifier: f,
        errorMsg: `uses one of the following invalid characters ${INVALID_CHARACTERS}`,
      })
    }
  })

  // capitalize certain fields
  shouldBeCapped.forEach(field => {
    if (
      field === 'firstName' &&
      contact[field].length === 2 &&
      !TWO_LETTER_NAMES.includes(contact[field].toLowerCase())
    ) {
      contact[field] = contact[field].toUpperCase()
    } else {
      contact[field] = toTitleCase(contact[field])
    }
  })

  // convert state name to initials and capitalize
  if (contact.state) {
    if (contact.state.length === 2) {
      const stateObj = US_STATES.find(
        state => state.abbr.toLowerCase() === contact.state.toLowerCase()
      )
      if (!stateObj) {
        errors.push({
          identifier: contact.state,
          errorMsg: `is not a valid state abbreviation`,
        })
      } else {
        contact.state = stateObj.abbr
      }
    } else {
      const stateName = stateAbbr(contact.state)
      if (!stateName) {
        errors.push({
          identifier: contact.state,
          errorMsg: `is not a valid state name`,
        })
      } else {
        contact.state = stateName
      }
    }
  }

  // shorten address where possible http://www.gis.co.clay.mn.us/usps.htm
  abbreviatables.forEach(a => {
    if (contact[a]) {
      contact[a] = (contact[a] || '')
        .replace(/ [Nn]orthwest/g, ' NW')
        .replace(/ [Ss]outhwest/g, ' SW')
        .replace(/ [Ss]outheast/g, ' SE')
        .replace(/ [Nn]ortheast/g, ' NE')
        .replace(/ [Nn][Ee] /g, ' NE ')
        .replace(/ [Nn][Ww] /g, ' NW ')
        .replace(/ [Ss][Ww] /g, ' SW ')
        .replace(/ [SS][Ee] /g, ' SE ')
        .replace(/ [Aa]venue/g, ' Ave')
        .replace(/ [Bb]oulevard/g, ' Blvd')
        .replace(/ [Cs]auseway/g, ' CSWY')
        .replace(/ [Cc]ircle/g, ' Cir')
        .replace(/ [Ee]xpressway/g, ' EXPY')
        .replace(/ [Ff]reeway/g, ' Fwy')
        .replace(/ [Gg]ateway/g, ' GTWY')
        .replace(/ [Hh]ighway/g, ' Hwy')
        .replace(/ [Tt]urnpike/g, ' TPKE')
        .replace(/ [Uu]nderpass/g, ' UPAS')
        .replace(/ [Rr]oute/g, ' RTE')
    }
  })

  // limit max characters
  charLimits.forEach(f => {
    const fieldLength = (contact[f[0]] || '').length || 0
    const maxLength = f[1]
    if (fieldLength > maxLength) {
      errors.push({
        identifier: f[0],
        errorMsg: `cannot be more than ${maxLength} characters`,
      })
    }
  })

  // zip code must be five characters
  if (contact.zip && contact.zip.length !== 5) {
    errors.push({
      identifier: 'Zip code',
      errorMsg: 'must be exactly 5 digits',
    })
  }

  return {
    contact,
    errors,
  }
}

export const interpolate = (str = '', obj) => {
  if (!str) return ''
  return str.replace(/{([^{}]*)}/g, (textWithBrackets, textBetweenBrackets) => {
    var result = obj[textBetweenBrackets]
    if (typeof result === 'string' || typeof result === 'number') {
      // replace curly single and double quotes with straight ones
      result = result.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"')
      return result
    } else {
      return textWithBrackets
    }
  })
}

export const getCreditPrice = numberNeeded => {
  if (numberNeeded <= 99) {
    return 2.99
  } else if (numberNeeded > 99 && numberNeeded <= 249) {
    return 2.75
  } else if (numberNeeded > 249 && numberNeeded <= 499) {
    return 2.6
  } else if (numberNeeded > 499 && numberNeeded <= 999) {
    return 2.45
  } else if (numberNeeded > 999 && numberNeeded <= 2500) {
    return 2.3
  } else {
    return 2.99
  }
}

// returns an array of invalid chars used otherwise null
export const invalidCharsUsed = text => {
  var invChars = []

  Object.entries(text).forEach(([index, val]) => {
    var charCode = val.charCodeAt(0)
    // if the current letter or symbol exists in the
    if (
      charCode > 126 ||
      INVALID_CHARS_ASCII.find(([asciiCode]) => asciiCode === charCode)
    ) {
      // check that the invalid character doesnt already exist in the list of invalid characters
      invChars.push(val)
    }
  })

  return uniq(invChars)
}
