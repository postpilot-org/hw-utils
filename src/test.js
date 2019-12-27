import { constants, utils } from './index.js'

const result = utils.validateContactInfo({
  firstName: 'jack',
  lastName: 'beau',
  street1: '123 test boulevard',
  state: 'al',
  city: 'montgomery',
  zip: '36111',
})

console.log(result)
