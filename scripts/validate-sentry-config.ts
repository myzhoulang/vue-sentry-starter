export {}

const requiredVariables = [
  'VITE_SENTRY_DSN',
  'VITE_SENTRY_RELEASE',
  'SENTRY_URL',
  'SENTRY_ORG',
  'SENTRY_PROJECT',
  'SENTRY_AUTH_TOKEN',
] as const

const missingVariables = requiredVariables.filter(
  (name) => !process.env[name]?.trim(),
)

if (missingVariables.length > 0) {
  throw new Error(`Sentry 配置不完整，缺少：${missingVariables.join(', ')}`)
}

const dsn = new URL(process.env.VITE_SENTRY_DSN ?? '')
if (!['https:', 'http:'].includes(dsn.protocol)) {
  throw new Error('VITE_SENTRY_DSN 必须是合法的 HTTP(S) 地址')
}

const sentryUrl = new URL(process.env.SENTRY_URL ?? '')
if (!['https:', 'http:'].includes(sentryUrl.protocol)) {
  throw new Error('SENTRY_URL 必须是合法的 HTTP(S) 地址')
}

console.info(
  `Sentry 配置校验通过：${process.env.SENTRY_ORG}/${process.env.SENTRY_PROJECT} · ${process.env.VITE_SENTRY_RELEASE}`,
)
