import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
import ProgramsController from '#controllers/programs_controller'
const CustomersController = () => import('#controllers/customers_controller')
const TransactionsController = () => import('#controllers/transactions_controller')
const MembersController = () => import('#controllers/members_controller')
const AuthController = () => import('#controllers/auths_controller')
const TenantsController = () => import('#controllers/tenants_controller')

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

      // Tenants
      router.get('tenants', [TenantsController, 'index'])
      router.post('tenant/register', [TenantsController, 'store']) // AUTH FOR TENANTS

      // ? I think we need customer related auth to specific informations
      router.get('tenants/:tenant', [TenantsController, 'show'])

      // All Customers
      router.get('customers', [CustomersController, 'index'])
      router.post('customers', [CustomersController, 'store'])
      router.post('customers/bulk', [CustomersController, 'bulk'])
    })

    router
      .group(() => {
        // SIGN IN
        router.post('tenant/login', [AuthController, 'login'])
        router.get('tenant/logout', [AuthController, 'logout'])
        router.post('tenant/callapi', (ctx) => {
          console.log("ctx.request.cookie('refreshToken')", ctx.request.cookie('refreshToken'))
          ctx.response
            .clearCookie('accessToken', {
              httpOnly: false,
              secure: true,
              sameSite: 'none',
              // expires: FIFTEEN_MINUTES_FROM_NOW,
            })
            .clearCookie('refreshToken', {
              httpOnly: true,
              secure: true,
              sameSite: 'none',
              // expires: FIFTEEN_MINUTES_FROM_NOW,
            })
            .send({ message: '🟢 COOKIES LIST!', user: ctx.request.cookiesList() })
          // return { message: '🟢 COOKIES LIST!', user: ctx.request.cookiesList() }
        })

        // [🔒 AUTH ROUTES GROUP]
        router
          .group(() => {
            router.post('tokenVerify', (ctx) => {
              return { message: '🟢 Everything ok!', user: ctx.request.header('user') }
            })

            // Programs
            router.get('tenant/programs', [ProgramsController, 'index'])
            router.put('tenant/programs/save', [ProgramsController, 'save'])

            // Members
            router.get('tenant/members', [MembersController, 'index'])
            router.post('tenant/members', [MembersController, 'store'])
            router.get('tenant/members/:id', [MembersController, 'show'])

            // Customers
            router.get('tenant/customers', [CustomersController, 'index_tenant'])
            router.get('tenant/customers/:id', [CustomersController, 'show_tenant'])

            // Transactions
            // router.get('tenant/transactions', [TransactionsController, 'index'])
            router.post('tenant/transactions', [TransactionsController, 'store'])
            router.post('tenant/transactions/search', [TransactionsController, 'index'])
          })
          .use(middleware.auth())
      })
      .use(middleware.tenanted())
  })
  .prefix('api/v1')
