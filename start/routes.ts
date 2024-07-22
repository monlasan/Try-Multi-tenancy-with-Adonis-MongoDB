import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
const CustomersController = () => import('#controllers/customers_controller')
const OrganizationsController = () => import('#controllers/organizations_controller')
const TransactionsController = () => import('#controllers/transactions_controller')
const UsersController = () => import('#controllers/users_controller')
const AuthController = () => import('#controllers/auth_controller')
const TenantsController = () => import('#controllers/tenant_controller')

router
  .group(() => {
    router.group(() => {
      router.get('/', async (ctx) => {
        console.log('============================================================')
        console.log('🟢 ctx.request.host', ctx.request.host())
        console.log('🟢 ctx.request.hostname', ctx.request.hostname())
        console.log('============================================================')
        return '🟢 Everything ok!'
      })

      // [ANON] Tenants
      router.get('tenants', [TenantsController, 'index'])
      router.get('tenants/:tenant', [TenantsController, 'show'])
      router.post('tenants/register', [TenantsController, 'store']) // AUTH FOR TENANTS
      // [ANON] Customers
      router.post('customers', [CustomersController, 'store'])
      router.post('customers/bulk', [CustomersController, 'bulk'])
    })

    router
      .group(() => {
        // [ANON AUTH]
        router.post('tenants/login', [AuthController, 'login'])

        // [🔒 AUTH ROUTES GROUP]
        router
          .group(() => {
            router.post('tokenVerify', (ctx) => {
              return { message: '🟢 Everything ok!', user: ctx.request.header('user') }
            })
          })
          .use(middleware.auth())

        // Organizations (tenants)
        router.get('organizations', [OrganizationsController, 'index'])
        router.get('organizations/:id', [OrganizationsController, 'show'])
        // Users (Members)
        router.get('members', [UsersController, 'index'])
        router.post('members', [UsersController, 'store'])
        router.get('members/:id', [UsersController, 'show'])
        // Users (Customers)
        router.get('customers', [CustomersController, 'index'])
        router.get('customers/:id', [CustomersController, 'show'])
        // Transactions
        router.get('transactions', [TransactionsController, 'index'])
        router.post('transactions', [TransactionsController, 'store'])
      })
      .use(middleware.tenanted())
  })
  .prefix('api/v1')
