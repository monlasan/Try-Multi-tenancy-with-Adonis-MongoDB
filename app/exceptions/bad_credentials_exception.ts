import { Exception } from '@adonisjs/core/exceptions'

export default class BadCredentialsException extends Exception {
  static status = 500
}