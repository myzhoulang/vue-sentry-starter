<template>
  <section class="hero">
    <p class="eyebrow">Vue 3 · TypeScript · Vite</p>
    <h1>一个简洁的 Vue 起点</h1>
    <p class="lead">路由和 Sentry 已配置完毕，可以直接开始开发。</p>
    <RouterLink class="button" to="/about">查看项目配置</RouterLink>
    <button class="button" type="button" @click="onClick">触发测试错误</button>
  </section>
</template>

<script setup lang="ts">
// 显式抛出异常，用于验证生产环境的 Sentry 错误上报链路。
const onClick = (): never => {
  throw new Error('Sentry 前端测试错误')
}
</script>
