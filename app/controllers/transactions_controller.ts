import { getModelByTenant } from '#database/index'
import { CustomerSchema } from '#database/schemas/customer_schema'
import { OrganizationSchema } from '#database/schemas/organization_schema'
import { TransactionSchema } from '#database/schemas/transaction_schema'
import { UserSchema } from '#database/schemas/user_schema'
import type { HttpContext } from '@adonisjs/core/http'

export default class TransactionsController {
  async index({ subdomains }: HttpContext) {
    const Transaction = getModelByTenant(subdomains.tenant, 'transaction', TransactionSchema)
    const transaction = await Transaction.find()
    return transaction
  }
  async store({ request, subdomains }: HttpContext) {
    const Transaction = getModelByTenant(subdomains.tenant, 'transaction', TransactionSchema)
    const User = getModelByTenant(subdomains.tenant, 'user', UserSchema)
    const Customer = getModelByTenant(subdomains.tenant, 'customer', CustomerSchema)
    const Organization = getModelByTenant(subdomains.tenant, 'organization', OrganizationSchema)
    // TODO: Wrap all the operations in a mongoose transaction
    const { amount, customerId, organizationId, initiatedById } = request.body()
    // TODO: Add proper validation
    const operator = await User.findById(initiatedById)
    if (!operator) {
      throw new Error('Operator not found')
    }
    const customer = await Customer.findById(customerId)
    if (!customer) {
      throw new Error('Customer not found')
    }
    const organization = await Organization.findById(organizationId)
    if (!organization) {
      throw new Error('Organization not found')
    }

    const newTransaction = await Transaction.create({
      amount,
      customer,
      organization,
      initiatedBy: operator,
    })

    // Update organization reference
    if (!organization.customers.includes(customerId)) {
      organization.customers.push(customerId)
    }
    organization.transactions.push(newTransaction._id)
    organization.save()

    // Update operator reference
    operator.transactions.push(newTransaction._id)
    await operator.save()

    // Update customer reference
    customer.transactions.push(newTransaction._id)
    await customer.save()

    return {
      message: 'Successfully created transaction',
      newTransaction,
    }
  }
}
