import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import env from '#start/env'
import { USER_TEMPORARY_TOKEN_EXPIRY } from './constants.js'

export function generateTemporaryToken() {
  // This token should be client facing
  // for example: for email verification unHashedToken should go into the user's mail
  const unHashedToken = crypto.randomBytes(20).toString('hex')

  // This should stay in the DB to compare at the time of verification
  const hashedToken = crypto.createHash('sha256').update(unHashedToken).digest('hex')
  // This is the expiry time for the token (20 minutes)
  const tokenExpiry = Date.now() + USER_TEMPORARY_TOKEN_EXPIRY

  return { unHashedToken, hashedToken, tokenExpiry }
}

export function generateAccessToken(user: any) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      full_name: user.full_name,
      phone_number: user.phone_number,
      role: user.role,
      organization: user.organization,
    },
    String(env.get('ACCESS_TOKEN_SECRET')),
    { expiresIn: env.get('ACCESS_TOKEN_EXPIRY') }
  )
}

export function generateRefreshToken(user: any) {
  return jwt.sign(
    {
      id: user._id,
    },
    String(env.get('REFRESH_TOKEN_SECRET')),
    { expiresIn: env.get('REFRESH_TOKEN_EXPIRY') }
  )
}
