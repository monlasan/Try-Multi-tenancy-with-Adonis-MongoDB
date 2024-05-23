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
    const Customer = getModelByTenant(subdomains.tenant, 'customer', CustomerSchema)
    const User = getModelByTenant(subdomains.tenant, 'user', UserSchema)
    const Organization = getModelByTenant(subdomains.tenant, 'organization', OrganizationSchema)
    // TODO: Wrap all the operations in a mongoose transaction
    const { amount, customerInfos, organizationId, initiatedById } = request.body()
    // TODO: Add proper validation

    // Find the organization member who initiated the transaction
    const operator = await User.findById(initiatedById)
    if (!operator) {
      throw new Error('Operator not found')
    }

    // Get the organization
    const organization = await Organization.findById(organizationId)
    if (!organization) {
      throw new Error('Organization not found')
    }

    let customer = null
    if (!organization.customers.includes(customerInfos._id)) {
      // ? If customer is not found in the tenant dabatase,
      // ? we create add the customer from landlord/main database.
      // TODO: Once the official customer schema is elaborated, we can should refactor the customer creation dataset.
      customer = await Customer.create({ _id: customerInfos._id, name: customerInfos.name })
      console.log('CUSTOMER CREATED IN TENANT DATABASE')
      organization.customers.push(customer._id)
    } else {
      // We just reuse the existing customer infos present in tenant database
      console.log('CUSTOMER REUSED')
      customer = await Customer.findById(customerInfos._id)
    }

    const newTransaction = await Transaction.create({
      amount,
      customer,
      organization,
      initiatedBy: operator,
    })

    // Update organization reference
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
