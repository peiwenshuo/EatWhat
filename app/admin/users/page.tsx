'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const loadUsers = async () => {
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/admin/clear-users')
      const data = await response.json()

      if (data.success) {
        setUsers(data.users)
        setMessage(`找到 ${data.count} 个用户`)
      } else {
        setMessage('加载失败: ' + data.error)
      }
    } catch (error: any) {
      setMessage('加载失败: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const clearAllUsers = async () => {
    if (!confirm('确定要删除所有用户吗？此操作不可恢复！')) {
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/admin/clear-users', {
        method: 'DELETE'
      })
      const data = await response.json()

      if (data.success) {
        setMessage(data.message)
        setUsers([])
        // 重新加载用户列表
        setTimeout(loadUsers, 1000)
      } else {
        setMessage('删除失败: ' + data.error)
      }
    } catch (error: any) {
      setMessage('删除失败: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">用户管理</h1>
            <p className="text-gray-600 mt-1">开发环境 - 测试数据管理</p>
          </div>
          <div className="flex gap-4">
            <Button onClick={loadUsers} disabled={loading} variant="outline">
              刷新列表
            </Button>
            <Button onClick={clearAllUsers} disabled={loading} variant="destructive">
              清空所有用户
            </Button>
          </div>
        </div>

        {message && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-6">
            {message}
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  邮箱
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  昵称
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  注册时间
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    {loading ? '加载中...' : '暂无用户'}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleString('zh-CN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-yellow-900 mb-2">
            注意事项
          </h2>
          <ul className="list-disc list-inside text-yellow-800 space-y-1">
            <li>此页面仅用于开发环境的测试数据管理</li>
            <li>清空操作会删除数据库中所有用户数据</li>
            <li>删除后可以重新注册新用户进行测试</li>
            <li>生产环境此功能会被禁用</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
