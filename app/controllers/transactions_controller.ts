import { getModelByTenant } from '#database/index'
import { CustomerSchema } from '#database/schemas/customer_schema'
import { TransactionSchema } from '#database/schemas/transaction_schema'
import { MemberSchema } from '#database/schemas/member_schema'
import type { HttpContext } from '@adonisjs/core/http'
import { currentTenant } from '../../lib/utils.js'
import { TenantSchema } from '#database/schemas/tenant_schema'

export default class TransactionsController {
  async index({ request }: HttpContext) {
    const tenant = currentTenant(request)
    const Transaction = getModelByTenant(tenant, 'transaction', TransactionSchema)
    const transaction = await Transaction.find()
    return transaction
  }
  async store({ request }: HttpContext) {
    const tenant = currentTenant(request)
    const Tenant = getModelByTenant('landlord', 'tenant', TenantSchema)
    const TenantCustomer = getModelByTenant('landlord', 'customer', CustomerSchema)

    const Transaction = getModelByTenant(tenant, 'transaction', TransactionSchema)
    const Customer = getModelByTenant(tenant, 'customer', CustomerSchema)
    const Member = getModelByTenant(tenant, 'member', MemberSchema)
    // TODO: Wrap all the operations in a mongoose transaction
    const { amount, customerInfos, organizationId, initiatedById } = request.body()
    // TODO: Add proper validation

    // Find the organization member who initiated the transaction
    const operator = await Member.findById(initiatedById)
    if (!operator) {
      throw new Error('Operator not found')
    }

    // Get the organization
    const organization = await Tenant.findById(organizationId)
    if (!organization) {
      throw new Error('Organization not found')
    }

    // Check if customer exists
    const tenantCustomer = await TenantCustomer.findById(customerInfos._id)
    if (!tenantCustomer) {
      throw new Error('Customer not found')
    }

    let customer = null
    if (!organization.customers.includes(customerInfos._id)) {
      // ? If customer is not found in the tenant dabatase,
      // ? we create add the customer from landlord/main database.
      // TODO: Once the official customer schema is elaborated, we can should refactor the customer creation dataset.

      // Add organization to the customer object in main database
      tenantCustomer.organizations.push(organization._id)
      await tenantCustomer.save()

      customer = await Customer.create({ _id: customerInfos._id, name: customerInfos.name })
      organization.customers.push(customer._id)
    } else {
      // We just reuse the existing customer infos present in tenant database
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
