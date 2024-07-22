import { getModelByTenant } from '#database/index'
import { TenantSchema } from '#database/schemas/tenant_schema'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { currentTenant } from '../../lib/utils.js'

export default class TenancyMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const tenantId = currentTenant(ctx.request)

    const Tenant = getModelByTenant('landlord', 'tenant', TenantSchema)
    // const tenant = await Tenant.exists({ name: ctx.subdomains.tenant })
    const tenant = await Tenant.exists({ database_name: tenantId })
    if (!tenant) throw new Error('Tenant not found')

    // console.log('🟣 TENANCY MIDDLEWARE : ', ctx.subdomains.tenant)
    /**
     * Call next method in the pipeline and return its output
     */
    const output = await next()
    return output
  }
}
