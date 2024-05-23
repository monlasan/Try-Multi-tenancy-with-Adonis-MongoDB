// 🟠 Get login information form request
// 🟠 Validate the data
// 🟠 Check if user exists
// 🟠 Check login type (EMAIL_PASSWORD | SOCIAL)
// 🟠 Compare incoming password with hashed passord
// 🟠 Generate access and refresh token
// 🟠 Set access/refresh tokens in response cookies
// 🟠 Send Logged user infos with renerated access/refresh tokens in Response
// 🟠 TODO : Handle errors properly

import { getModelByTenant } from '#database/index'
import { UserSchema } from '#database/schemas/user_schema'
import hash from '@adonisjs/core/services/hash'
import type { HttpContext } from '@adonisjs/core/http'
import { generateAccessToken, generateRefreshToken } from '../utils/helpers.js'

const generateAccessAndRefreshTokens = async (tenant: string, userId: any) => {
  const User = getModelByTenant(tenant, 'user', UserSchema)
  try {
    const user = await User.findById(userId)
    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)

    user.refresh_token = refreshToken

    await user.save({ validateBeforeSave: false })

    return { accessToken, refreshToken }
  } catch (error) {
    throw new Error('Something went wrong while generating the access token')
  }
}

export default class AuthController {
  async login({ request, response, subdomains }: HttpContext) {
    const User = getModelByTenant(subdomains.tenant, 'user', UserSchema)

    // Get login information form request
    const { from, email, password, phone_number } = request.body()

    // TODO: Validate the data
    // validateLoginInfos(from, email, password, phone_number);

    // Check if user exists
    const user = await User.findOne({
      $or: [{ phone_number }, { email }],
    })
    if (!user) {
      throw new Error("This user doesn't exist")
    }

    // TODO: Check login type (EMAIL_PASSWORD | SOCIAL)
    // checkLoginType()

    // Compare incoming password with hashed passord
    const isPasswordValid = await hash.verify(user.password, password)
    if (!isPasswordValid) {
      throw new Error('Incorrect credentials!')
    }

    // Generate access and refresh token
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      subdomains.tenant,
      user._id
    )

    response
      .cookie('accessToken', accessToken)
      .cookie('refreshToken', refreshToken)
      .status(200)
      .send({ user, accessToken, refreshToken })
    return { message: 'Please let me in ' + subdomains.tenant }
  }
}
