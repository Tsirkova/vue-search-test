<script setup lang="ts">
import { NEWS } from '../mock/news'
</script>

<template lang="pug">
main
  h1 Новости

  ul
    li(v-for="n in NEWS" :key="n.id")
      h3 {{ n.title }}
      p {{ n.description }}
      small {{ n.date }} · {{ n.category }}
</template>