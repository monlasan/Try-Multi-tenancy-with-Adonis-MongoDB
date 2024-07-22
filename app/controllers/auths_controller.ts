// 🟠 Get login information form request
// 🟠 Validate the data
// 🟢 Check if member exists
// 🟠 Check login type (EMAIL_PASSWORD | SOCIAL)
// 🟢 Compare incoming password with hashed passord
// 🟢 Generate access and refresh token
// 🟢 Set access/refresh tokens in response cookies
// 🟢 Send Logged member infos with renerated access/refresh tokens in Response
// 🟠 TODO : Handle errors properly

import { getModelByTenant } from '#database/index'
import { MemberSchema } from '#database/schemas/member_schema'
import hash from '@adonisjs/core/services/hash'
import type { HttpContext } from '@adonisjs/core/http'
import { generateAccessToken, generateRefreshToken } from '../utils/helpers.js'
import BadCredentialsException from '#exceptions/bad_credentials_exception'
import { currentTenant } from '../../lib/utils.js'
import { FIFTEEN_MINUTES_FROM_NOW, THIRTY_DAYS_FROM_NOW } from '../utils/constants.js'

const generateAccessAndRefreshTokens = async (tenant: string, memberId: any) => {
  const Member = getModelByTenant(tenant, 'member', MemberSchema)
  try {
    const member = await Member.findById(memberId)
    const accessToken = generateAccessToken(member)
    const refreshToken = generateRefreshToken(member)

    // Store refresh token on member
    member.refresh_token = refreshToken

    await member.save({ validateBeforeSave: false })

    return { accessToken, refreshToken }
  } catch (error) {
    throw new Error('Something went wrong while generating the access token!')
  }
}

export default class AuthController {
  async login({ request, response }: HttpContext) {
    const tenant = currentTenant(request)

    const Member = getModelByTenant(tenant, 'member', MemberSchema)

    // Get login information form request
    const { email, password, phone_number } = request.body()

    // TODO: Validate the data
    // validateLoginInfos(from, email, password, phone_number);

    // Check if member exists
    const member = await Member.findOne({
      $or: [{ phone_number }, { email }],
    })
    if (!member) {
      response.abort({ message: "This member doesn't exist" }, 403)
    }

    // If member is registered with some other method, we will ask him/her to use the same method as registered.
    // This shows that if member is registered with methods other than email password, he/she will not be able to login with password. Which makes password field redundant for the SSO
    if (member.login_type !== 'EMAIL_PASSWORD') {
      response.abort(
        {
          message:
            'You have previously registered using ' +
            member.login_type?.toLowerCase() +
            '. Please use the ' +
            member.login_type?.toLowerCase() +
            ' login option to access your account.',
        },
        500
      )
    }

    // Compare incoming password with hashed passord
    const isPasswordValid = await hash.verify(member.password, password)
    if (!isPasswordValid) {
      response.abort({ message: 'Incorrect credentials' }, 403)
      throw new BadCredentialsException('')
    }

    // Generate access and refresh token
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(tenant, member._id)

    response
      .status(200)
      .cookie('accessToken', accessToken, {
        httpOnly: false,
        secure: true,
        sameSite: 'none',
        expires: FIFTEEN_MINUTES_FROM_NOW,
      })
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        expires: THIRTY_DAYS_FROM_NOW,
      })
      .send({ message: '✅ Members authenticated successfully', member, accessToken })
  }
}
