'use client'

import { useEffect } from 'react'

export function MobileDebugger() {
  useEffect(() => {
    // 只在移动设备和非生产环境加载 Eruda
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    const isDev = process.env.NODE_ENV === 'development' ||
                  window.location.hostname === 'eat-what-rho.vercel.app' // 临时在生产环境也启用

    if (isMobile && isDev) {
      // 动态导入 eruda
      import('eruda').then((eruda) => {
        eruda.default.init()
        console.log('[MobileDebugger] Eruda 移动端调试工具已加载')
        console.log('[MobileDebugger] 点击右下角的图标打开控制台')
      }).catch((err) => {
        console.error('[MobileDebugger] Eruda 加载失败:', err)
      })
    } else {
      console.log('[MobileDebugger] 跳过 Eruda 加载', { isMobile, isDev })
    }
  }, [])

  return null
}
