<script setup lang="ts"></script>

<template>
  <div class="app">
    <header class="app__header">
      <div class="container">
        <h1 class="app__title">Новости</h1>
      </div>
    </header>

    <main class="app__main">
      <div class="container">
        <router-view />
      </div>
    </main>
  </div>
</template>