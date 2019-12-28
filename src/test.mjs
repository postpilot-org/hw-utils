import { constants, utils } from './index.mjs'

const result = utils.validateContactInfo({
  firstName: 'tj',
  lastName: 'miller',
  street1: '123 test boulevard',
  state: 'al',
  city: 'montgomery',
  zip: '36111',
})

console.log(result)
