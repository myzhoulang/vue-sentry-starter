import { fileURLToPath, URL } from 'node:url'

import { sentryVitePlugin } from '@sentry/vite-plugin'
import vue from '@vitejs/plugin-vue'
import { defineConfig, loadEnv, type PluginOption } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const uploadConfigured = Boolean(
    env.SENTRY_AUTH_TOKEN &&
      env.SENTRY_ORG &&
      env.SENTRY_PROJECT &&
      env.VITE_SENTRY_RELEASE,
  )
  const plugins: PluginOption[] = [vue()]

  if (uploadConfigured) {
    plugins.push(
      sentryVitePlugin({
        authToken: env.SENTRY_AUTH_TOKEN,
        org: env.SENTRY_ORG,
        project: env.SENTRY_PROJECT,
        url: env.SENTRY_URL || 'https://sentry.io/',
        // 上传失败时终止发布，避免线上产物无法还原错误堆栈。
        errorHandler(error) {
          throw error
        },
        release: {
          name: env.VITE_SENTRY_RELEASE,
        },
        sourcemaps: {
          filesToDeleteAfterUpload: ['./dist/**/*.map'],
        },
        telemetry: false,
      }),
    )
  }

  return {
    base: env.VITE_BASE_PATH || '/',
    plugins,
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      // hidden 模式生成 sourcemap，但不会在浏览器产物中暴露 sourceMappingURL。
      sourcemap: 'hidden',
    },
  }
})
