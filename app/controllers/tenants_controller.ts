// 🟠 TODO: Validate data
// 🟠 TODO: handle errors properly
// 🟠 TODO: Wrap operations in a transaction with mongoose
// 🟢 Check if tenant already exist
// 🟢 Create tenant
// 🟢 Create organization
// 🟢 Hash password
// 🟢 Charge organization super admin object
// 🟢 Generate temporary token
// 🟢 Assign generated token to super admin
// 🟢 Create organization super admin
// 🟠 TODO: Send email to member
// 🟢 Verify organization super admin creation
// 🟢 Send back response with basic infos and access token

import { getModelByTenant } from '#database/index'
import { TenantSchema } from '#database/schemas/tenant_schema'
import { MemberSchema } from '#database/schemas/member_schema'
import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'
import { generateTemporaryToken } from '../utils/helpers.js'
import { PROGRAMS } from '../utils/constants.js'

const createTenant = async (org_name: string, tenant_id: string) => {
  // TODO: Validate and sanitize tenant name
  const Tenant = getModelByTenant('landlord', 'tenant', TenantSchema)
  try {
    const existingTenant = await Tenant.findOne({ database_name: tenant_id })
    if (existingTenant) {
      throw new Error('Tenant already exists')
    }
    const date = new Date()
    const tenant = await Tenant.create({
      name: org_name,
      database_name: tenant_id,
      programs: {
        basic_program: {
          active: true,
          added_points: 10,
        },
        specific_program: {
          active: false,
          added_points: 0,
          dates: [],
        },
        referral_program: {
          active: false,
          added_points: 0,
        },
        batch_program: {
          active: false,
          added_points: 0,
          amount: 0,
        },
        weekend_program: {
          active: false,
          added_points: 0,
        },
        periodic_program: {
          active: false,
          added_points: 0,
          from: date,
          to: date,
        },
      },
    })
    return tenant
  } catch (error) {
    console.error('Error creating tenant', error)
    throw error
  }
}
// const createOrganization = async (tenantName: string) => {
//   const Organization = getModelByTenant(tenantName, 'organization', OrganizationSchema)
//   try {
//     const organization = new Organization({
//       name: tenantName,
//       programs: [
//         {
//           name: 'BASE_PROGRAM',
//           active: true,
//           basic_program: {
//             added_points: 10,
//           },
//         },
//       ],
//     })
//     await organization.save()
//     return organization
//   } catch (error) {
//     console.error('Error creating organization:', error)
//     throw error
//   }
// }
const createSuperAdminMember = async (tenant: string, infos: any, tenant_id: string) => {
  try {
    const Member = getModelByTenant(tenant, 'member', MemberSchema)

    // Generate password hash
    const passwordHash = await hash.make(infos.password)

    // Set up super admin object
    let SUPER_ADMIN = {
      full_name: infos.last_name + ' ' + infos.first_name,
      email: infos.email,
      phone_number: infos.phone_number,
      password: passwordHash,
      is_email_verified: false,
      email_verification_token: '',
      email_verification_expiry: 0,
      organization_name: infos.organization_name,
      tenant_id: tenant_id,
      role: 'ADMIN',
    }

    /**
     * unHashedToken: unHashed token is something we will send to the member's mail
     * hashedToken: we will keep record of hashedToken to validate the unHashedToken in verify email controller
     * tokenExpiry: Expiry to be checked before validating the incoming token
     */
    const { unHashedToken, hashedToken, tokenExpiry } = generateTemporaryToken()

    SUPER_ADMIN.email_verification_token = hashedToken
    SUPER_ADMIN.email_verification_expiry = tokenExpiry

    const member = new Member(SUPER_ADMIN)
    await member.save()

    // TODO: 🟠 Send email to member here

    if (!member) {
      throw new Error('Member not created')
    }

    return member
  } catch (error) {
    console.error('Error creating super admin member:', error)
    throw error
  }
}
const assignSuperAdminToTenant = async (tenantData: any, superAdminMemberId: string) => {
  const Tenant = getModelByTenant('landlord', 'tenant', TenantSchema)

  try {
    const tenant = await Tenant.findById(tenantData._id)
    if (!tenant) {
      throw new Error('Tenant not found')
    }
    // We add the super admin to the tenant organization members
    tenant.members.push(superAdminMemberId)
    await tenant.save()
    return tenant
  } catch (error) {
    console.error('Error assigning super admin to tenant:', error)
    throw error
  }
}

export default class TenantsController {
  async store({ request }: HttpContext) {
    const { organization_name, tenant_id, first_name, last_name, phone_number, email, password } =
      request.body()
    const admin = {
      organization_name,
      first_name,
      last_name,
      phone_number,
      email,
      password,
    }
    const tenant = await createTenant(organization_name, tenant_id)
    const superAdminMember = await createSuperAdminMember(tenant.name, admin, tenant_id)
    const organization = await assignSuperAdminToTenant(tenant, superAdminMember._id)

    return {
      message:
        'Successfully created organization. Members registered successfully and verification email has been sent on your email.',
      organizationId: organization._id,
      adminId: superAdminMember._id,
    }
  }
  async index({}: HttpContext) {
    const Tenant = getModelByTenant('landlord', 'tenant', TenantSchema)
    const tenants = await Tenant.find({})
    return tenants
  }
  async show({ params, response }: HttpContext) {
    const Tenant = getModelByTenant('landlord', 'tenant', TenantSchema)
    const tenant = await Tenant.findOne({ database_name: params.tenant }).select(
      '-database_name -members -customers -transactions -programs'
    )
    return response.status(200).send({ tenant })
  }
}
