# Vue Sentry Starter

一个基于 Vue 3、Vite、TypeScript、Vue Router 和 Sentry 的简洁项目。

## 启动

```bash
bun install
cp .env.example .env.local
bun run dev
```

在 `.env.local` 中填写 `VITE_SENTRY_DSN` 后，Sentry 会自动捕获 Vue 运行时错误和路由性能数据。DSN 为空时不会初始化 Sentry。

生产环境还配置了同源 `VITE_SENTRY_TUNNEL=/vue-sentry-starter/sentry-tunnel`，由 Nginx 转发 Sentry envelope，避免 HTTP 页面直接请求 Sentry ingest 时被浏览器的 PNA/CORS 策略拦截。

## 常用命令

```bash
bun run dev
bun run typecheck
bun run build
bun run build:sentry
bun run preview
```

`build:sentry` 会严格校验 Sentry 构建配置，生成 hidden sourcemap，上传成功后从 `dist` 删除 `.map` 文件。浏览器 SDK 与 sourcemap 使用相同的 `VITE_SENTRY_RELEASE`，确保 Sentry 能正确还原生产堆栈。

## 自动发布

推送到 `main` 后，GitHub Actions 会依次执行：

1. 使用锁文件安装依赖并运行类型检查。
2. 构建生产产物并上传 sourcemap 到 Sentry。
3. 将 `dist` 同步到服务器的 `$DEPLOY_PATH/releases/$GITHUB_SHA`。
4. 原子切换 `$DEPLOY_PATH/current` 软链接并验证线上地址。

在 GitHub 仓库的 `production` Environment 中配置：

### Secrets

- `VITE_SENTRY_DSN`：Sentry 项目的浏览器 DSN。
- `SENTRY_AUTH_TOKEN`：仅授予 sourcemap/release 上传所需权限。
- `DEPLOY_SSH_PRIVATE_KEY`：部署用户的 SSH 私钥。
- `SSH_KNOWN_HOSTS`：服务器主机指纹，可通过 `ssh-keyscan <host>` 获取后人工核验。

### Variables

- `SENTRY_URL`：Sentry 服务地址，Sentry SaaS 使用 `https://sentry.io/`。
- `SENTRY_ORG`：Sentry Organization slug。
- `SENTRY_PROJECT`：Sentry Project slug。
- `DEPLOY_HOST`：服务器地址。
- `DEPLOY_USER`：部署用户。
- `DEPLOY_PATH`：项目发布根目录，本项目使用 `/var/www/vue-sentry-starter`。
- `DEPLOY_URL`：发布完成后的健康检查 URL。

服务器的 Nginx 站点根目录应指向 `$DEPLOY_PATH/current`。由于项目使用 Vue Router history 模式，还需要配置：

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

当前生产环境使用 `/vue-sentry-starter/` 子路径。对应的 Nginx 配置应为：

```nginx
location = /vue-sentry-starter {
    return 301 /vue-sentry-starter/;
}

location /vue-sentry-starter/ {
    alias /var/www/vue-sentry-starter/current/;
    try_files $uri $uri/ /vue-sentry-starter/index.html;
}
```

首次发布前，需要由服务器 root 用户执行一次：

```bash
bash /home/deploy/vue-sentry-starter-deploy/setup-server.sh
```

脚本会创建发布目录、安装 Nginx location、校验配置并重载 Nginx。修改站点配置前会保留一份 `.bak.vue-sentry-starter` 备份。

不要把 SSH 私钥、Sentry Auth Token 或生产 `.env` 文件提交到 Git。
