import * as Sentry from '@sentry/vue'
import { createApp } from 'vue'

import App from './App.vue'
import { router } from './router'
import './styles.css'

const app = createApp(App)
const sentryDsn = import.meta.env.VITE_SENTRY_DSN?.trim()
const sentryTunnel = import.meta.env.VITE_SENTRY_TUNNEL?.trim()

if (sentryDsn) {
  Sentry.init({
    app,
    dsn: sentryDsn,
    ...(sentryTunnel ? { tunnel: sentryTunnel } : {}),
    environment: import.meta.env.VITE_APP_ENV ?? import.meta.env.MODE,
    release: import.meta.env.VITE_SENTRY_RELEASE,
    integrations: [Sentry.browserTracingIntegration({ router })],
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1,
    enabled: true,
  })
}

app.use(router)
app.mount('#app')
