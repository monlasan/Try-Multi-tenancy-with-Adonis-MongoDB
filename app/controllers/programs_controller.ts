import { getModelByTenant } from '#database/index'
import type { HttpContext } from '@adonisjs/core/http'
import { addProgramParams, currentTenant } from '../../lib/utils.js'
import { TenantSchema } from '#database/schemas/tenant_schema'

export default class ProgramsController {
  async index({ request, response }: HttpContext) {
    const tenant = currentTenant(request)
    const Tenant = getModelByTenant('landlord', 'tenant', TenantSchema)
    const res = await Tenant.findOne({
      database_name: tenant,
    })
    return response.status(200).send({ data: res.programs })
  }
  async save({ request, response }: HttpContext) {
    let programs = request.body()

    const tenant = currentTenant(request)
    const Tenant = getModelByTenant('landlord', 'tenant', TenantSchema)
    const res = await Tenant.findOne({
      database_name: tenant,
    })

    let updatedPrograms: any = {}
    programs.forEach((program: any) => {
      updatedPrograms[program.name.toLowerCase()] = addProgramParams(program.name, program.params)
    })
    res.programs = updatedPrograms
    await res.save()

    return response.status(200).send({ data: res.programs })
  }
  async updateOne({ request, response }: HttpContext) {
    const payload = request.body()
    const tenant = currentTenant(request)
    const Tenant = getModelByTenant('landlord', 'tenant', TenantSchema)
    const res = await Tenant.findOne({
      database_name: tenant,
    })

    res.programs[payload.name.toLowerCase()].added_points = payload.params.added_points

    if (payload.name === 'PERIODIC_PROGRAM') {
      res.programs[payload.name.toLowerCase()].from = payload.params.from
      res.programs[payload.name.toLowerCase()].to = payload.params.to
    }
    if (payload.name === 'SPECIFIC_PROGRAM') {
      res.programs[payload.name.toLowerCase()].dates = payload.params.dates
    }
    if (payload.name === 'BATCH_PROGRAM') {
      res.programs[payload.name.toLowerCase()].amount = payload.params.amount
    }

    res.save()

    return response.status(200).send({ data: res.programs })
  }
}
