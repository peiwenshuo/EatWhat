'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface WorkoutLog {
  id: string
  date: string
  type: string
  exercises: string
  duration: number | null
  caloriesBurned: number | null
  intensity: string | null
  notes: string | null
  createdAt: string
}

interface Stats {
  totalWorkouts: number
  totalDuration: number
  totalCalories: number
  avgDuration: number
  avgCalories: number
  typeStats: Record<string, { count: number; duration: number; calories: number }>
}

const WORKOUT_TYPES = [
  '力量训练',
  '有氧运动',
  '瑜伽',
  '普拉提',
  '游泳',
  '跑步',
  '骑行',
  '球类运动',
  '其他'
]

const INTENSITY_LEVELS = ['低', '中', '高']

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

export default function WorkoutPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [records, setRecords] = useState<WorkoutLog[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [days, setDays] = useState(30)

  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    type: '力量训练',
    exercises: '',
    duration: '',
    caloriesBurned: '',
    intensity: '中',
    notes: ''
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      loadData()
    }
  }, [status, router, days])

  const loadData = async () => {
    try {
      const response = await fetch(`/api/health/workout?days=${days}`)
      const data = await response.json()

      if (data.success) {
        setRecords(data.records)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('加载训练数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch('/api/health/workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: formData.date,
          type: formData.type,
          exercises: formData.exercises,
          duration: formData.duration ? parseInt(formData.duration) : null,
          caloriesBurned: formData.caloriesBurned ? parseInt(formData.caloriesBurned) : null,
          intensity: formData.intensity,
          notes: formData.notes || null
        })
      })

      const data = await response.json()

      if (data.success) {
        setShowAddForm(false)
        setFormData({
          date: format(new Date(), 'yyyy-MM-dd'),
          type: '力量训练',
          exercises: '',
          duration: '',
          caloriesBurned: '',
          intensity: '中',
          notes: ''
        })
        loadData()
      } else {
        alert(`保存失败: ${data.error}`)
      }
    } catch (error: any) {
      alert(`保存失败: ${error.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条记录吗？')) return

    try {
      const response = await fetch(`/api/health/workout?id=${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        loadData()
      } else {
        alert(`删除失败: ${data.error}`)
      }
    } catch (error: any) {
      alert(`删除失败: ${error.message}`)
    }
  }

  // 准备图表数据
  const typeChartData = stats?.typeStats
    ? Object.entries(stats.typeStats).map(([type, data]) => ({
        name: type,
        次数: data.count,
        时长: Math.round(data.duration),
        卡路里: Math.round(data.calories)
      }))
    : []

  const dailyData = records
    .slice()
    .reverse()
    .map(record => ({
      date: format(new Date(record.date), 'MM/dd'),
      时长: record.duration || 0,
      卡路里: record.caloriesBurned || 0
    }))

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">训练记录</h1>
            <p className="text-gray-600 mt-1">记录和追踪你的训练情况</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              variant={showAddForm ? 'outline' : 'default'}
            >
              {showAddForm ? '取消' : '➕ 添加训练'}
            </Button>
            <Button onClick={() => router.push('/health')} variant="outline">
              返回
            </Button>
          </div>
        </div>

        {showAddForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">添加训练记录</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  日期 *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  训练类型 *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {WORKOUT_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  训练内容 *
                </label>
                <textarea
                  value={formData.exercises}
                  onChange={(e) => setFormData({ ...formData, exercises: e.target.value })}
                  required
                  placeholder="例如: 深蹲 4组x12次, 卧推 4组x10次, 硬拉 3组x8次"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  时长 (分钟)
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="例如: 60"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  消耗卡路里
                </label>
                <input
                  type="number"
                  value={formData.caloriesBurned}
                  onChange={(e) => setFormData({ ...formData, caloriesBurned: e.target.value })}
                  placeholder="例如: 300"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  强度
                </label>
                <select
                  value={formData.intensity}
                  onChange={(e) => setFormData({ ...formData, intensity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {INTENSITY_LEVELS.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  备注
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="记录今天的训练感受"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? '保存中...' : '保存记录'}
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex gap-2">
            {[7, 30, 90].map((d) => (
              <Button
                key={d}
                onClick={() => setDays(d)}
                variant={days === d ? 'default' : 'outline'}
                size="sm"
              >
                {d === 7 ? '一周' : d === 30 ? '一月' : '三月'}
              </Button>
            ))}
          </div>
        </div>

        {stats && stats.totalWorkouts > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600 mb-1">总训练次数</div>
                <div className="text-2xl font-bold text-blue-600">
                  {stats.totalWorkouts} 次
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600 mb-1">总时长</div>
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(stats.totalDuration)} 分
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600 mb-1">总消耗</div>
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round(stats.totalCalories)} 卡
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600 mb-1">平均时长</div>
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round(stats.avgDuration)} 分
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600 mb-1">平均消耗</div>
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round(stats.avgCalories)} 卡
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">训练类型分布</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={typeChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="次数"
                    >
                      {typeChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">训练类型统计</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={typeChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="次数" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {dailyData.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">每日训练趋势</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="时长" stroke="#3b82f6" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="卡路里" stroke="#f59e0b" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}

        {records.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">💪</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              还没有训练记录
            </h2>
            <p className="text-gray-600 mb-6">
              开始记录你的训练，追踪健身进度
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              添加第一次训练
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <h2 className="text-xl font-semibold">训练历史</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">日期</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">类型</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">内容</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">时长</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">消耗</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">强度</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">备注</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {records.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(new Date(record.date), 'yyyy-MM-dd')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        {record.type}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {record.exercises}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.duration ? `${record.duration} 分` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.caloriesBurned ? `${record.caloriesBurned} 卡` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${
                          record.intensity === '高' ? 'bg-red-100 text-red-800' :
                          record.intensity === '中' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {record.intensity || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {record.notes || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Button
                          onClick={() => handleDelete(record.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          删除
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
