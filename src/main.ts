import { createApp } from 'vue'
import { router } from './router'
import './styles/main.css'
import App from './App.vue'

async function enableMocking() {
  const shouldMock = import.meta.env.DEV || import.meta.env.VITE_ENABLE_MSW === 'true'
  if (!shouldMock) return

  const { worker } = await import('./mock/browser')
  await worker.start({ onUnhandledRequest: 'bypass' })
}

enableMocking().then(() => {
  createApp(App).use(router).mount('#app')
})