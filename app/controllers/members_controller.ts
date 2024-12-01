import mail from '@adonisjs/mail/services/main'
import { getModelByTenant } from '#database/index'
import { MemberSchema } from '#database/schemas/member_schema'
import type { HttpContext } from '@adonisjs/core/http'
import { currentTenant, excludeFrom } from '../../lib/utils.js'
import { TenantSchema } from '#database/schemas/tenant_schema'

export default class MembersController {
  async index({ request, response }: HttpContext) {
    const tenant = currentTenant(request)
    const Member = getModelByTenant(tenant, 'member', MemberSchema)
    const members = await Member.find({})
    response.status(200).send({
      data: members,
    })
  }
  async show({ params, request, response }: HttpContext) {
    const tenant = currentTenant(request)
    const Member = getModelByTenant(tenant, 'member', MemberSchema)
    const member = await Member.findById(params.id)
    response.status(200).send({
      data: member,
    })
  }
  async store({ request, response }: HttpContext) {
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

    response.status(200).send({
      data: member,
    })
  }
  async search({ request, response }: HttpContext) {
    const limit = request.body().limit
    const page = request.body().page
    const offset = (page - 1) * limit

    const tenant = currentTenant(request)
    const Member = getModelByTenant(tenant, 'member', MemberSchema)
    const members = await Member.find({}).skip(offset).limit(limit)
    const total = await Member.countDocuments()

    const members_dto = members.map((member) =>
      excludeFrom(member, ['password', 'login_type', 'is_email_verified'])
    )

    response.status(200).send({
      data: members_dto,
      meta: {
        page: page,
        limit: limit,
        totalDocuments: members.length,
        total,
      },
    })
  }
  async login({ params, request, response }: HttpContext) {
    const tenant = currentTenant(request)
    const Member = getModelByTenant(tenant, 'member', MemberSchema)
    const member = await Member.findById(params.id)
    response.status(200).send({
      data: member,
    })
  }
  async invites({ request, response }: HttpContext) {
    const collaborators = request.body()
    // TODO: MORE VERIFICATIONS TO BE ADDED, LIKE VALIDATING INVITE.
    // const tenant = currentTenant(request)
    // const Tenant = getModelByTenant('landlord', 'tenant', TenantSchema)
    // const Member = getModelByTenant(tenant, 'member', MemberSchema)
    // const { organizationId, member_data } = request.body()

    // const organization = await Tenant.findById(organizationId)
    // if (!organization) {
    //   throw new Error('Organization not found')
    // }
    // const member = await Member.create({ ...member_data })
    // organization.members.push(member._id)
    // await organization.save()

    console.log('object', request.body())
    await mail.send((message) => {
      message
        .to('khaledsannyaml@gmail.com')
        .from('contact@zemow.com')
        .subject('Invite to Zemow')
        .html(collaborators[0].html)
    })

    response.status(200).send({
      data: 'THEY ADDED',
    })
  }
}
