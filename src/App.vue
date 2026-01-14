<script setup lang="ts"></script>

<template>
  <div class="app">
    <header class="app__header">
      <div class="container">
        <h1 class="app__title">Vue Search</h1>
      </div>
    </header>

    <main class="app__main">
      <div class="container">
        <router-view />
      </div>
    </main>
  </div>
</template>

<style>
:root {
  color-scheme: light;
  --bg: #ffffff;
  --text: #111827;
  --muted: #6b7280;
  --border: #e5e7eb;
  --card: #f9fafb;
  --primary: #2563eb;
  --primary-hover: #1d4ed8;
}

* {
  box-sizing: border-box;
}

html,
body {
  height: 100%;
}

body {
  margin: 0;
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial,
    'Noto Sans', 'Liberation Sans', sans-serif;
  background: var(--bg);
  color: var(--text);
}

a {
  color: inherit;
}

.container {
  width: min(960px, calc(100% - 32px));
  margin: 0 auto;
}

.app__header {
  border-bottom: 1px solid var(--border);
  background: #fff;
}

.app__title {
  margin: 0;
  padding: 16px 0;
  font-size: 18px;
  font-weight: 700;
}

.app__main {
  padding: 20px 0 32px;
}
</style>