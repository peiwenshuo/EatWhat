'use client'

import { SessionProvider } from 'next-auth/react'
import { useEffect } from 'react'
import { MobileDebugger } from '@/components/MobileDebugger'
import { ErrorDisplay } from '@/components/ErrorDisplay'

// 导入 Safari 兼容性 polyfills（必须在组件顶部）
import '@/lib/polyfills'

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    console.log('[Providers] 客户端已加载', {
      hasOwn: typeof Object.hasOwn,
      userAgent: navigator.userAgent,
      isSafari: /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
      iOS: /iPhone|iPad|iPod/i.test(navigator.userAgent),
    })
  }, [])

  return (
    <SessionProvider>
      <MobileDebugger />
      <ErrorDisplay />
      {children}
    </SessionProvider>
  )
}
