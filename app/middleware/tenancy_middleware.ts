import { Tenant } from '#database/models/tenant_model'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class TenancyMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const tenant = await Tenant.exists({ name: ctx.subdomains.tenant })
    if (!tenant) throw new Error('Tenant not found')

    console.log('🟣 TENANCY MIDDLEWARE : ', ctx.subdomains.tenant)
    /**
     * Call next method in the pipeline and return its output
     */
    const output = await next()
    return output
  }
}
