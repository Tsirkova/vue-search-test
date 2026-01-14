import { createApp } from 'vue'
import { router } from './router'
import App from './App.vue'

async function enableMocking() {
  if (!import.meta.env.DEV) return
  const { worker } = await import('./mock/browser')
  await worker.start({ onUnhandledRequest: 'bypass' })
}

enableMocking().then(() => {
  createApp(App).use(router).mount('#app')
})