import { Request } from '@adonisjs/core/http'

export const currentTenant = (request: Request) => {
  const tenant = request.header('X-Tenant-Id')
  if (!tenant) throw new Error('+++++ Missing X-Tenant-Id header +++++')
  return tenant
}

export function normalizeOrganizationName(name: string) {
  if (!name) return ''
  return name
    .toLowerCase() // Convert to lowercase
    .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric characters except spaces and hyphens
    .trim() // Trim leading and trailing spaces
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with a single hyphen
}

export function excludeFrom(payload: any, excludingElementArray: string[], type = 'object'): any {
  let data = JSON.parse(JSON.stringify(payload))
  if (type === 'object') {
    excludingElementArray.forEach((item) => {
      delete data[item]
    })
    return data
  }
  if (type === 'array') {
    data.forEach((item: any) => {
      excludingElementArray.forEach((element) => {
        delete item[element]
      })
    })
    return data
  }
  return data
}

export function addProgramParams(programName: string, params: any) {
  let param: Partial<any> = {
    added_points: params.added_points,
    active: params.active,
  }

  switch (programName) {
    case 'SPECIFIC_PROGRAM':
      param.dates = params.dates
      break
    case 'BATCH_PROGRAM':
      param.amount = params.amount
      break
    case 'PERIODIC_PROGRAM':
      param.from = params.from
      param.to = params.to
      break
    case 'BASIC_PROGRAM':
    case 'WEEKEND_PROGRAM':
    case 'REFERRAL_PROGRAM':
      break
    default:
      // Handle unknown programName if necessary
      break
  }

  return param
}
