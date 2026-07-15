import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import './index.css'

// 仅在 http/https 协议下注册 Service Worker
if (typeof window !== 'undefined' && window.location.protocol.startsWith('http')) {
  registerSW({
    immediate: true,
    onNeedRefresh() {
      // 新版本可用时，立即刷新页面加载最新代码
      if (confirm('应用有新版本，是否立即更新？')) {
        window.location.reload()
      }
    },
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
