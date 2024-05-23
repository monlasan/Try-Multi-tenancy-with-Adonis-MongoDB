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
// 🟠 TODO: Send email to user
// 🟢 Verify organization super admin creation
// 🟢 Send back response with basic infos and access token

import { getModelByTenant } from '#database/index'
import { OrganizationSchema } from '#database/schemas/organization_schema'
import { TenantSchema } from '#database/schemas/tenant_schema'
import { UserSchema } from '#database/schemas/user_schema'
import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'
import { generateTemporaryToken } from '../utils/helpers.js'

const createTenant = async (org: any) => {
  // TODO: Validate and sanitize tenant name
  const Tenant = getModelByTenant('landlord', 'tenant', TenantSchema)
  try {
    const existingTenant = await Tenant.findOne({ name: org.name })
    if (existingTenant) {
      throw new Error('Tenant already exists')
    }
    const tenant = await Tenant.create({
      name: org.name,
      database_name: org.name,
    })
    return tenant
  } catch (error) {
    console.error('Error creating organization:', error)
    throw error
  }
}
const createOrganization = async (tenantName: string) => {
  const Organization = getModelByTenant(tenantName, 'organization', OrganizationSchema)
  try {
    const organization = new Organization({ name: tenantName })
    await organization.save()
    return organization
  } catch (error) {
    console.error('Error creating organization:', error)
    throw error
  }
}
const createSuperAdminUser = async (tenant: string, infos: any, organizationId: any) => {
  try {
    const User = getModelByTenant(tenant, 'user', UserSchema)

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
      organization: '',
      role: 'ADMIN',
    }

    /**
     * unHashedToken: unHashed token is something we will send to the user's mail
     * hashedToken: we will keep record of hashedToken to validate the unHashedToken in verify email controller
     * tokenExpiry: Expiry to be checked before validating the incoming token
     */
    const { unHashedToken, hashedToken, tokenExpiry } = generateTemporaryToken()

    SUPER_ADMIN.email_verification_token = hashedToken
    SUPER_ADMIN.email_verification_expiry = tokenExpiry
    SUPER_ADMIN.organization = organizationId

    const user = new User(SUPER_ADMIN)
    await user.save()

    // TODO: 🟠 Send email to user here

    if (!user) {
      throw new Error('User not created')
    }

    return user
  } catch (error) {
    console.error('Error creating super admin user:', error)
    throw error
  }
}
const assignSuperAdminToOrganization = async (
  tenantName: string,
  organizationId: string,
  superAdminUserId: string
) => {
  const Organization = getModelByTenant(tenantName, 'organization', OrganizationSchema)

  try {
    const organization = await Organization.findById(organizationId)
    if (!organization) {
      throw new Error('Organization not found')
    }
    // We add the super admin to the organization members
    organization.members.push(superAdminUserId)
    await organization.save()
    return organization
  } catch (error) {
    console.error('Error assigning super admin to organization:', error)
    throw error
  }
}

export default class TenantsController {
  async store({ request }: HttpContext) {
    const { org, admin } = request.body()

    const tenant = await createTenant(org)
    const organization = await createOrganization(tenant.name)
    const superAdminUser = await createSuperAdminUser(tenant.name, admin, organization._id)
    await assignSuperAdminToOrganization(tenant.name, organization._id, superAdminUser._id)

    return {
      message:
        'Successfully created organization. Users registered successfully and verification email has been sent on your email.',
      organization,
      superAdminUser,
    }
  }
  async index({}: HttpContext) {
    const Tenant = getModelByTenant('landlord', 'tenant', TenantSchema)
    const tenants = await Tenant.find({})
    return tenants
  }
  // async show({ params }: HttpContext) {
  //   const tenant = await Tenant.findById(params.id)
  //   return { tenant }
  // }
}
