import { ContainerRegistrationKeys, loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

const mercadoPagoAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
const mercadoPagoWebhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET
const googleAuthEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CALLBACK_URL)

const authProviders = [
  { resolve: '@medusajs/medusa/auth-emailpass', id: 'emailpass' },
  ...(googleAuthEnabled ? [{
    resolve: '@medusajs/medusa/auth-google',
    id: 'google',
    options: { clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET, callbackUrl: process.env.GOOGLE_CALLBACK_URL },
  }] : []),
]

const mercadoPagoPlugin = mercadoPagoAccessToken
  ? [{
      resolve: '@nicogorga/medusa-payment-mercadopago',
      options: {
        accessToken: mercadoPagoAccessToken,
        webhookSecret: mercadoPagoWebhookSecret,
      },
    }]
  : []

const mercadoPagoProvider = mercadoPagoAccessToken
  ? [{
      resolve: '@nicogorga/medusa-payment-mercadopago/providers/mercado-pago',
      id: 'mercadopago',
      options: {
        accessToken: mercadoPagoAccessToken,
        webhookSecret: mercadoPagoWebhookSecret,
      },
      dependencies: [ContainerRegistrationKeys.LOGGER],
    }]
  : []

module.exports = defineConfig({
  plugins: mercadoPagoPlugin,
  modules: [
    { resolve: '@medusajs/medusa/auth', dependencies: [ContainerRegistrationKeys.LOGGER], options: { providers: authProviders } },
    {
      resolve: '@medusajs/medusa/payment',
      options: { providers: mercadoPagoProvider },
    },
  ],
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
      authMethodsPerActor: { customer: googleAuthEnabled ? ['emailpass', 'google'] : ['emailpass'] },
    }
  }
})
