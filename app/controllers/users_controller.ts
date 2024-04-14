import { User } from '#database/models/user_model'
import type { HttpContext } from '@adonisjs/core/http'

export default class UsersController {
  async index({}: HttpContext) {
    const user = await User.find()
    return user
  }
  async show({ params }: HttpContext) {
    const user = await User.findById(params.id)
    return { user }
  }
  async store({}: HttpContext) {
    return '⚙ CREATE A USER'
  }
}
