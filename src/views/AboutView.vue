<template>
  <section class="content-card">
   <button class="button" @click="book">预订</button>
  </section>
</template>

<script setup lang="ts">
const book = () => {
  window.alert("开始预订");
  fetch('/api/book', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'Vue 3',
      version: '3.0.0',
    }),
  }).catch(() => {
    window.alert("预订失败");
  })
}
</script>
