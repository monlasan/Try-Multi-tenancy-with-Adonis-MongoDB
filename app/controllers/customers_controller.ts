import { Customer } from '#database/models/customer_model'
import type { HttpContext } from '@adonisjs/core/http'

export default class CustomersController {
  async index({ subdomains }: HttpContext) {
    const customers = await Customer.find({})
    return { customers, customerName: subdomains.tenant }
  }
  async show({ params }: HttpContext) {
    const customer = await Customer.findById(params.id)
    return { customer }
  }
  async store({ request }: HttpContext) {
    const { name } = request.body()
    const customer = await Customer.create({ name })
    return customer
  }
  async bulk({ request }: HttpContext) {
    const { name } = request.body()
    const customer = await Customer.create({ name })
    return customer
  }
}
