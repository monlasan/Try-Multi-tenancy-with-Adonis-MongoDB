import { getModelByTenant } from '#database/index'
import { UserSchema } from '#database/schemas/user_schema'
import type { HttpContext } from '@adonisjs/core/http'

export default class UsersController {
  async index({ subdomains }: HttpContext) {
    const User = getModelByTenant(subdomains.tenant, 'user', UserSchema)
    const user = await User.find()
    return user
  }
  async show({ params, subdomains }: HttpContext) {
    const User = getModelByTenant(subdomains.tenant, 'user', UserSchema)
    const user = await User.findById(params.id)
    return { user }
  }
  async store({ request, subdomains }: HttpContext) {
    const User = getModelByTenant(subdomains.tenant, 'user', UserSchema)
    const user = await User.create({ ...request.body() })
    return user
  }
}
