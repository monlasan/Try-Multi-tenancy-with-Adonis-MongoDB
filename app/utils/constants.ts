export const USER_TEMPORARY_TOKEN_EXPIRY = 20 * 60 * 1000 // 20 minutes

// DATES
export const FIFTEEN_MINUTES_FROM_NOW = () => new Date(Date.now() + 15 * 60 * 1000)

export const ONE_HOUR_FROM_NOW = () => new Date(Date.now() + 60 * 60 * 1000)

export const ONE_YEAR_FROM_NOW = () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)

export const THIRTY_DAYS_FROM_NOW = () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

export const PROGRAMS = {
  BASIC_PROGRAM: 'BASIC_PROGRAM',
  BATCH_PROGRAM: 'BATCH_PROGRAM',
  PERIODIC_PROGRAM: 'PERIODIC_PROGRAM',
  WEEKEND_PROGRAM: 'WEEKEND_PROGRAM',
  SPECIFIC_PROGRAM: 'SPECIFIC_PROGRAM',
  REFERALL_PROGRAM: 'REFERALL_PROGRAM',
}
