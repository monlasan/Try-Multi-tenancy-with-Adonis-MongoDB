import { getModelByTenant } from '#database/index'
import { CustomerSchema } from '#database/schemas/customer_schema'
import type { HttpContext } from '@adonisjs/core/http'
import { currentTenant } from '../../lib/utils.js'

export default class CustomersController {
  async index({}: HttpContext) {
    const Customer = getModelByTenant('landlord', 'customer', CustomerSchema)
    const customers = await Customer.find({})
    return { customers }
  }
  async show({ params }: HttpContext) {
    const Customer = getModelByTenant('landlord', 'customer', CustomerSchema)
    const customer = await Customer.findById(params.id)
    return { customer }
  }
  async store({ request }: HttpContext) {
    const { name } = request.body()
    const Customer = getModelByTenant('landlord', 'customer', CustomerSchema)
    const customer = await Customer.create({ name })
    return customer
  }
  async bulk({ request }: HttpContext) {
    const { name } = request.body()
    const Customer = getModelByTenant('landlord', 'customer', CustomerSchema)
    const customer = await Customer.create({ name })
    return customer
  }
  // TENANT SPECIFIC
  async index_tenant({ request }: HttpContext) {
    const tenant = currentTenant(request)
    const Customer = getModelByTenant(tenant, 'customer', CustomerSchema)
    const customers = await Customer.find({})
    return { customers }
  }
  async show_tenant({ params, request }: HttpContext) {
    const tenant = currentTenant(request)
    const Customer = getModelByTenant(tenant, 'customer', CustomerSchema)
    const customer = await Customer.findById(params.id)
    return { customer }
  }
}
