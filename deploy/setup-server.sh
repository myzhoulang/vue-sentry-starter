#!/usr/bin/env bash

set -euo pipefail

readonly DEPLOY_PATH='/var/www/vue-sentry-starter'
readonly DEPLOY_USER='deploy'
readonly DEPLOY_GROUP='deploy'
readonly NGINX_SITE='/etc/nginx/sites-available/sentry-error-test-frontend'
readonly NGINX_SNIPPET='/etc/nginx/snippets/vue-sentry-starter.conf'
readonly NGINX_SITE_BACKUP="${NGINX_SITE}.bak.vue-sentry-starter"
readonly NGINX_SNIPPET_BACKUP="${NGINX_SNIPPET}.bak.vue-sentry-starter"
readonly INCLUDE_LINE='    include /etc/nginx/snippets/vue-sentry-starter.conf;'
readonly SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

if [[ "${EUID}" -ne 0 ]]; then
  echo '错误：请使用 root 用户运行此脚本。' >&2
  exit 1
fi

if [[ ! -f "${NGINX_SITE}" ]]; then
  echo "错误：找不到 Nginx 站点文件 ${NGINX_SITE}。" >&2
  exit 1
fi

if [[ ! -f "${SCRIPT_DIR}/nginx-location.conf" ]]; then
  echo '错误：nginx-location.conf 必须与本脚本位于同一目录。' >&2
  exit 1
fi

install -d -m 755 "${DEPLOY_PATH}/releases"
chown -R "${DEPLOY_USER}:${DEPLOY_GROUP}" "${DEPLOY_PATH}"
install -d -m 755 /etc/nginx/snippets
cp "${NGINX_SITE}" "${NGINX_SITE_BACKUP}"

snippet_existed=false
if [[ -f "${NGINX_SNIPPET}" ]]; then
  cp "${NGINX_SNIPPET}" "${NGINX_SNIPPET_BACKUP}"
  snippet_existed=true
fi

install -m 644 "${SCRIPT_DIR}/nginx-location.conf" "${NGINX_SNIPPET}"

if ! grep -Fq "${INCLUDE_LINE}" "${NGINX_SITE}"; then
  readonly INSERT_ANCHOR='    add_header X-Content-Type-Options nosniff always;'

  if ! grep -Fq "${INSERT_ANCHOR}" "${NGINX_SITE}"; then
    echo "错误：无法在 ${NGINX_SITE} 中定位插入点，未修改 Nginx 配置。" >&2
    exit 1
  fi

  sed -i "\#${INSERT_ANCHOR}#i\\${INCLUDE_LINE}" "${NGINX_SITE}"
fi

if ! nginx -t; then
  echo '错误：Nginx 配置校验失败，正在恢复原配置。' >&2
  cp "${NGINX_SITE_BACKUP}" "${NGINX_SITE}"

  if [[ "${snippet_existed}" == true ]]; then
    cp "${NGINX_SNIPPET_BACKUP}" "${NGINX_SNIPPET}"
  else
    rm -f "${NGINX_SNIPPET}"
  fi

  nginx -t
  exit 1
fi

systemctl reload nginx

echo '服务器初始化完成：/vue-sentry-starter/ 已启用。'
