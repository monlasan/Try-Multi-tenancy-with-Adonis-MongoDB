import { getModelByTenant } from '#database/index'
import { OrganizationSchema } from '#database/schemas/organization_schema'
import { TenantSchema } from '#database/schemas/tenant_schema'
import { UserSchema } from '#database/schemas/user_schema'
import type { HttpContext } from '@adonisjs/core/http'

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
  const User = getModelByTenant(tenant, 'user', UserSchema)
  try {
    const user = new User({ name: infos.name, email: infos.email, organization: organizationId })
    await user.save()
    return user
  } catch (error) {
    console.error('Error creating super admin user:', error)
    throw error
  }
}
const assignSuperAdminToOrganization = async (
  tenantName: string,
  organizationId: any,
  superAdminUserId: any
) => {
  const Organization = getModelByTenant(tenantName, 'organization', OrganizationSchema)

  try {
    const organization = await Organization.findById(organizationId)
    if (!organization) {
      throw new Error('Organization not found')
    }

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
    // TODO: Switch database connection to the new tenant
    const organization = await createOrganization(tenant.name)
    const superAdminUser = await createSuperAdminUser(tenant.name, admin, organization._id)
    await assignSuperAdminToOrganization(tenant.name, organization._id, superAdminUser._id)

    return {
      message: 'Successfully created organization',
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
