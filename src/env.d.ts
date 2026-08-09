/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_PATH?: string
  readonly VITE_SENTRY_DSN?: string
  readonly VITE_SENTRY_TUNNEL?: string
  readonly VITE_APP_ENV?: string
  readonly VITE_SENTRY_RELEASE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
