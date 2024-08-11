import jwt from 'jsonwebtoken'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import env from '#start/env'
import { getModelByTenant } from '#database/index'
import { MemberSchema } from '#database/schemas/member_schema'
import UnAuthorizedException from '#exceptions/un_authorized_exception'
import { currentTenant } from '../../lib/utils.js'

export default class AuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const tenant = currentTenant(ctx.request)
    const Member = getModelByTenant(tenant, 'member', MemberSchema)
    const token =
      ctx.request.cookie('accessToken') ||
      ctx.request.header('authorization')?.replace('Bearer ', '')
    // const token = null

    if (!token) {
      throw new UnAuthorizedException('You are not authorized')
    }

    try {
      const decodedToken: any = jwt.verify(token, String(env.get('ACCESS_TOKEN_SECRET')))
      const member = await Member.findById(decodedToken.id)

      if (!member) {
        throw new UnAuthorizedException('You are not authorized')
      }
      ctx.request.request.headers['member'] = member
    } catch (err) {
      throw new UnAuthorizedException('You are not authorized')
    }

    /**
     * Call next method in the pipeline and return its output
     */
    const output = await next()
    return output
  }
}
