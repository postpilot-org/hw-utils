import { constants, utils } from './index.mjs'

const result = utils.validateContactInfo({
  firstName: 'jack',
  lastName: 'black',
  street1: '3338 thomas Avenue Northwest',
  street2: '',
  company: 'Google',
  state: 'alabama',
  city: 'Montgomery',
  zip: '10006',
})

console.log(result)
