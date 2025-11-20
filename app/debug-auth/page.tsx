'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'

export default function DebugAuthPage() {
  const [registerResult, setRegisterResult] = useState<any>(null)
  const [loginResult, setLoginResult] = useState<any>(null)
  const [error, setError] = useState('')

  const testRegister = async () => {
    setError('')
    setRegisterResult(null)

    const testEmail = `test${Date.now()}@example.com`

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: 'password123',
          name: '测试用户'
        }),
      })

      const data = await response.json()
      setRegisterResult({
        status: response.status,
        ok: response.ok,
        data: data
      })

      if (response.ok) {
        // 注册成功，立即尝试登录
        setTimeout(() => testLogin(testEmail), 1000)
      }
    } catch (err: any) {
      setError(err.message)
    }
  }

  const testLogin = async (email?: string) => {
    setError('')
    setLoginResult(null)

    const loginEmail = email || registerResult?.data?.user?.email || 'test456@example.com'

    try {
      console.log('尝试登录:', loginEmail)

      const result = await signIn('credentials', {
        email: loginEmail,
        password: 'password123',
        redirect: false,
      })

      console.log('登录结果:', result)

      setLoginResult({
        result: result,
        success: !result?.error,
        error: result?.error
      })
    } catch (err: any) {
      console.error('登录错误:', err)
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">认证系统调试</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            错误: {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 注册测试 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">注册测试</h2>
            <Button onClick={testRegister} className="w-full mb-4">
              测试注册新用户
            </Button>

            {registerResult && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">注册结果:</h3>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <div>状态码: {registerResult.status}</div>
                  <div>成功: {registerResult.ok ? '是' : '否'}</div>
                  <pre className="mt-2 overflow-auto">
                    {JSON.stringify(registerResult.data, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* 登录测试 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">登录测试</h2>
            <Button
              onClick={() => testLogin()}
              className="w-full mb-4"
              variant="outline"
            >
              测试登录已注册用户
            </Button>

            {loginResult && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">登录结果:</h3>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <div>成功: {loginResult.success ? '是' : '否'}</div>
                  {loginResult.error && (
                    <div className="text-red-600 mt-2">
                      错误: {loginResult.error}
                    </div>
                  )}
                  <pre className="mt-2 overflow-auto">
                    {JSON.stringify(loginResult.result, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* API 测试 */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">快速 API 测试</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">1. 直接访问注册 API</h3>
              <code className="bg-gray-100 p-2 rounded block text-sm">
                POST /api/auth/register
              </code>
              <p className="text-sm text-gray-600 mt-1">
                在浏览器控制台运行:
              </p>
              <pre className="bg-gray-100 p-2 rounded text-xs mt-1 overflow-auto">
{`fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'password123',
    name: '测试'
  })
}).then(r => r.json()).then(console.log)`}
              </pre>
            </div>

            <div>
              <h3 className="font-medium mb-2">2. NextAuth 登录</h3>
              <code className="bg-gray-100 p-2 rounded block text-sm">
                POST /api/auth/callback/credentials
              </code>
              <p className="text-sm text-gray-600 mt-1">
                使用 signIn() 函数
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
