import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import './index.css'

// 仅在 http/https 协议下注册 Service Worker
// file:// 协议（手机本地打开）下 SW 无法注册，应用本身仍可正常使用，只是没有离线缓存
if (typeof window !== 'undefined' && window.location.protocol.startsWith('http')) {
  registerSW({ immediate: true })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
