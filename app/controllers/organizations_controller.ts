import { Organization } from '#database/models/organization_model'
import type { HttpContext } from '@adonisjs/core/http'

export default class OrganizationsController {
  async index({}: HttpContext) {
    const organization = await Organization.find({})
    return organization
  }
  async show({ params }: HttpContext) {
    const organization = await Organization.findById(params.id)
    return { organization }
  }
}
