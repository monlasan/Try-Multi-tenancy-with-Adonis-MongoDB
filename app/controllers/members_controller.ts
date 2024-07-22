import { getModelByTenant } from '#database/index'
import { MemberSchema } from '#database/schemas/member_schema'
import type { HttpContext } from '@adonisjs/core/http'
import { currentTenant } from '../../lib/utils.js'
import { TenantSchema } from '#database/schemas/tenant_schema'

export default class MembersController {
  async index({ request }: HttpContext) {
    const tenant = currentTenant(request)
    const Member = getModelByTenant(tenant, 'member', MemberSchema)
    const member = await Member.find({})
    return member
  }
  async show({ params, request }: HttpContext) {
    const tenant = currentTenant(request)
    const Member = getModelByTenant(tenant, 'member', MemberSchema)
    const member = await Member.findById(params.id)
    return { member }
  }
  async store({ request }: HttpContext) {
    // TODO: MORE VERIFICATIONS TO BE ADDED, LIKE VALIDATING INVITE.
    const tenant = currentTenant(request)
    const Tenant = getModelByTenant('landlord', 'tenant', TenantSchema)
    const Member = getModelByTenant(tenant, 'member', MemberSchema)
    const { organizationId, member_data } = request.body()

    const organization = await Tenant.findById(organizationId)
    if (!organization) {
      throw new Error('Organization not found')
    }
    const member = await Member.create({ ...member_data })
    organization.members.push(member._id)
    await organization.save()

    return member
  }
  async login({ params, request }: HttpContext) {
    const tenant = currentTenant(request)
    const Member = getModelByTenant(tenant, 'member', MemberSchema)
    const member = await Member.findById(params.id)
    return { member }
  }
}
