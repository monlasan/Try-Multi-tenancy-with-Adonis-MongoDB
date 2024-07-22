import { Exception } from '@adonisjs/core/exceptions'

export default class UnAuthorizedException extends Exception {
  static status = 500
  static code = 'E_UNAUTHORIZED'
}
