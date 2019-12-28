import {
  VALID_MERGE_VARS,
  INVALID_CHARACTERS,
  US_STATES,
  TWO_LETTER_NAMES,
} from './constants.mjs'

function toTitleCase(str = '') {
  return str.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  })
}

export const usesInvalidCharacters = message => {
  return new RegExp(INVALID_CHARACTERS, 'g').test(message)
}

export const stateAbbr = stateName => {
  const stateObj = US_STATES.find(state => state.name === stateName)
  if (!stateObj) {
    return ''
  }
  return stateObj.abbr.toUpperCase()
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
  const charLimits = [['firstName', 17], ['lastName', 17], ['company', 26]]
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

  // shorten address where possible
  abbreviatables.forEach(a => {
    if (contact[a]) {
      contact[a] = contact[a]
        .replace(/ [Nn]orthwest/g, ' NW')
        .replace(/ [Ss]outhwest/g, ' SW')
        .replace(/ [Ss]outheast/g, ' SE')
        .replace(/ [Nn]ortheast/g, ' NE')
        .replace(/ [Ss]treet/g, ' St')
        .replace(/ [Aa]venue/g, ' Ave')
        .replace(/ [Bb]oulevard/g, ' Blvd')
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

export const interpolate = (str, obj) => {
  return str.replace(/{([^{}]*)}/g, (textWithBrackets, textBetweenBrackets) => {
    var result = obj[textBetweenBrackets]

    if (typeof result === 'string' || typeof result === 'number') {
      return result
    } else {
      return textWithBrackets
    }
  })
}
