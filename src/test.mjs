import { constants, utils } from './index.mjs'

const result = utils.validateContactInfo({
  firstName: 'jack mcKittreck',
  lastName: 'terry-Gables shaw',
  street1: '3338 SE thomas Avenue northwest',
  street2: '',
  company: 'Google',
  state: 'alabama',
  city: 'Montgomery',
  zip: '10006',
})

console.log(result)
