import { getModelByTenant } from '#database/index'
import type { HttpContext } from '@adonisjs/core/http'
import { currentTenant } from '../../lib/utils.js'
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

    // const tenant = currentTenant(request)
    // const Tenant = getModelByTenant('landlord', 'tenant', TenantSchema)
    // const res = await Tenant.findOne({
    //   database_name: tenant,
    // })

    const updatedPrograms = programs.map((program: any) => {
      return {
        name: program.name,
        active: program.active,
        basic_program: {
          added_points: program.basic_program.added_points,
        },
        specific_program: {
          dates: program.specific_program.dates,
        },
        referral_program: {
          added_points: program.referral_program.added_points,
        },
        batch_program: {
          amount: program.batch_program.amount,
          added_points: program.batch_program.added_points,
        },
        weekend_program: {
          added_points: program.weekend_program.added_points,
        },
        periodic_program: {
          from: program.periodic_program.from,
          to: program.periodic_program.to,
          added_points: program.periodic_program.added_points,
        },
      }
    })

    console.log('programs', updatedPrograms)

    // const program = request.body()
    // res.programs.push(program)
    // await res.save()
    // return response.status(200).send({ data: res.programs })
    return response.send({ data: 'z' })
  }
}
