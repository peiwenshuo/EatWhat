'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '男',
    height: '',
    weight: '',
    goal: '保持健康',
    activityLevel: '中等',
    dietType: '无限制',
    allergies: '',
    dislikes: ''
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      loadProfile()
    }
  }, [status, router])

  const loadProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')
      const data = await response.json()

      if (data.success && data.profile) {
        setFormData({
          name: data.profile.name || '',
          age: data.profile.age?.toString() || '',
          gender: data.profile.gender || '男',
          height: data.profile.height?.toString() || '',
          weight: data.profile.weight?.toString() || '',
          goal: data.profile.goal || '保持健康',
          activityLevel: data.profile.activityLevel || '中等',
          dietType: data.profile.dietType || '无限制',
          allergies: data.profile.allergies?.join(', ') || '',
          dislikes: data.profile.dislikes?.join(', ') || ''
        })
      }
    } catch (error) {
      console.error('加载资料失败:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          age: parseInt(formData.age) || null,
          gender: formData.gender,
          height: parseInt(formData.height) || null,
          weight: parseFloat(formData.weight) || null,
          goal: formData.goal,
          activityLevel: formData.activityLevel,
          dietType: formData.dietType,
          allergies: formData.allergies.split(',').map(s => s.trim()).filter(Boolean),
          dislikes: formData.dislikes.split(',').map(s => s.trim()).filter(Boolean)
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage('保存成功！')
        setTimeout(() => router.push('/dashboard'), 1500)
      } else {
        setMessage('保存失败: ' + data.error)
      }
    } catch (error: any) {
      setMessage('保存失败: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">个人资料</h1>
          <p className="text-gray-600 mt-1">填写你的基本信息，帮助 AI 生成更精准的饮食计划</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded ${message.includes('成功') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* 基本信息 */}
          <div>
            <h2 className="text-xl font-semibold mb-4">基本信息</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  昵称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  年龄
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  性别
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="男">男</option>
                  <option value="女">女</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  身高 (cm)
                </label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  体重 (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          {/* 健身目标 */}
          <div>
            <h2 className="text-xl font-semibold mb-4">健身目标</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  目标
                </label>
                <select
                  name="goal"
                  value={formData.goal}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="减脂">减脂</option>
                  <option value="增肌">增肌</option>
                  <option value="保持健康">保持健康</option>
                  <option value="提高体能">提高体能</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  活动水平
                </label>
                <select
                  name="activityLevel"
                  value={formData.activityLevel}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="久坐">久坐（很少运动）</option>
                  <option value="轻度活动">轻度活动（每周1-3次）</option>
                  <option value="中等">中等活动（每周3-5次）</option>
                  <option value="高强度">高强度（每周6-7次）</option>
                  <option value="专业运动员">专业运动员</option>
                </select>
              </div>
            </div>
          </div>

          {/* 饮食偏好 */}
          <div>
            <h2 className="text-xl font-semibold mb-4">饮食偏好</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  饮食类型
                </label>
                <select
                  name="dietType"
                  value={formData.dietType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="无限制">无限制</option>
                  <option value="素食">素食</option>
                  <option value="纯素">纯素</option>
                  <option value="低碳水">低碳水</option>
                  <option value="生酮">生酮</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  过敏食物（用逗号分隔）
                </label>
                <input
                  type="text"
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  placeholder="例如：花生, 海鲜, 牛奶"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  不喜欢的食物（用逗号分隔）
                </label>
                <input
                  type="text"
                  name="dislikes"
                  value={formData.dislikes}
                  onChange={handleChange}
                  placeholder="例如：香菜, 苦瓜, 动物内脏"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? '保存中...' : '保存资料'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard')}
            >
              取消
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
