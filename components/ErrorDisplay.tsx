'use client'

import { useState, useEffect } from 'react'

interface ErrorInfo {
  message: string
  stack?: string
  timestamp: string
}

export function ErrorDisplay() {
  const [errors, setErrors] = useState<ErrorInfo[]>([])
  const [show, setShow] = useState(false)

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const errorInfo: ErrorInfo = {
        message: event.message,
        stack: event.error?.stack,
        timestamp: new Date().toISOString()
      }
      setErrors(prev => [...prev, errorInfo])
      setShow(true)

      console.error('[ErrorDisplay] 捕获到错误:', errorInfo)
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const errorInfo: ErrorInfo = {
        message: `Promise rejected: ${event.reason}`,
        stack: event.reason?.stack,
        timestamp: new Date().toISOString()
      }
      setErrors(prev => [...prev, errorInfo])
      setShow(true)

      console.error('[ErrorDisplay] 捕获到 Promise 拒绝:', errorInfo)
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  if (!show || errors.length === 0) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fee',
        border: '2px solid #f00',
        padding: '10px',
        maxHeight: '300px',
        overflowY: 'auto',
        zIndex: 9999,
        fontSize: '12px',
        fontFamily: 'monospace'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <strong style={{ color: '#c00' }}>🐛 检测到 {errors.length} 个错误</strong>
        <button
          onClick={() => setShow(false)}
          style={{
            background: '#000',
            color: '#fff',
            border: 'none',
            padding: '2px 10px',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          关闭
        </button>
      </div>

      {errors.map((error, index) => (
        <div
          key={index}
          style={{
            marginBottom: '10px',
            padding: '8px',
            backgroundColor: '#fff',
            border: '1px solid #fcc',
            borderRadius: '4px'
          }}
        >
          <div style={{ fontWeight: 'bold', color: '#c00', marginBottom: '5px' }}>
            错误 #{index + 1}: {new Date(error.timestamp).toLocaleTimeString()}
          </div>
          <div style={{ marginBottom: '5px', wordBreak: 'break-all' }}>
            {error.message}
          </div>
          {error.stack && (
            <details>
              <summary style={{ cursor: 'pointer', color: '#666' }}>
                查看堆栈跟踪
              </summary>
              <pre style={{
                fontSize: '10px',
                overflow: 'auto',
                maxHeight: '100px',
                margin: '5px 0 0 0',
                padding: '5px',
                backgroundColor: '#f5f5f5'
              }}>
                {error.stack}
              </pre>
            </details>
          )}
        </div>
      ))}
    </div>
  )
}
