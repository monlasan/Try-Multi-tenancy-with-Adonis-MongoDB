import jwt from 'jsonwebtoken'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import env from '#start/env'
import { getModelByTenant } from '#database/index'
import { UserSchema } from '#database/schemas/user_schema'

export default class AuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const User = getModelByTenant(ctx.subdomains.tenant, 'user', UserSchema)
    const token =
      ctx.request.cookie('accessToken') ||
      ctx.request.header('authorization')?.replace('Bearer ', '')

    if (!token) {
      throw new Error('No token, Unauthorized request')
    }

    try {
      const decodedToken: any = jwt.verify(token, String(env.get('ACCESS_TOKEN_SECRET')))
      const user = await User.findById(decodedToken.id)

      if (!user) {
        throw new Error('Unauthorized request 000 user not found')
      }
      ctx.request.request.headers['user'] = user
    } catch (err) {
      throw new Error(err || 'Unauthorized request')
    }

    /**
     * Call next method in the pipeline and return its output
     */
    const output = await next()
    return output
  }
}
