import { constants, utils } from './index.mjs'

const result = utils.validateContactInfo({
  firstName: 'tj',
  lastName: 'miller',
  street1: '229 Peachtree Hills Ave Northeast',
  state: 'al',
  city: 'montgomery',
  zip: '36111',
})

console.log(result)
