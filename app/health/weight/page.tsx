'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'
import { format, subDays } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface BodyRecord {
  id: string
  date: string
  weight: number
  bodyFat: number | null
  muscle: number | null
  notes: string | null
  createdAt: string
}

interface Stats {
  current: number | null
  average: number | null
  max: number | null
  min: number | null
  change: number | null
  changePercent: number | null
}

export default function WeightPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [records, setRecords] = useState<BodyRecord[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [days, setDays] = useState(30)

  // 表单状态
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    weight: '',
    bodyFat: '',
    muscleMass: '',
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
      const response = await fetch(`/api/health/weight?days=${days}`)
      const data = await response.json()

      if (data.success) {
        setRecords(data.records)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('加载体重数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch('/api/health/weight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: formData.date,
          weight: parseFloat(formData.weight),
          bodyFat: formData.bodyFat ? parseFloat(formData.bodyFat) : null,
          muscleMass: formData.muscleMass ? parseFloat(formData.muscleMass) : null,
          notes: formData.notes || null
        })
      })

      const data = await response.json()

      if (data.success) {
        setShowAddForm(false)
        setFormData({
          date: format(new Date(), 'yyyy-MM-dd'),
          weight: '',
          bodyFat: '',
          muscleMass: '',
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
      const response = await fetch(`/api/health/weight?id=${id}`, {
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
  const chartData = records
    .slice()
    .reverse()
    .map(record => ({
      date: format(new Date(record.date), 'MM/dd', { locale: zhCN }),
      体重: record.weight,
      体脂率: record.bodyFat,
      肌肉量: record.muscle
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
        {/* 头部 */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">体重管理</h1>
            <p className="text-gray-600 mt-1">追踪你的体重变化趋势</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              variant={showAddForm ? 'outline' : 'default'}
            >
              {showAddForm ? '取消' : '➕ 添加记录'}
            </Button>
            <Button onClick={() => router.push('/dashboard')} variant="outline">
              返回
            </Button>
          </div>
        </div>

        {/* 添加记录表单 */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">添加体重记录</h2>
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
                  体重 (kg) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  required
                  placeholder="例如: 65.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  体脂率 (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.bodyFat}
                  onChange={(e) => setFormData({ ...formData, bodyFat: e.target.value })}
                  placeholder="例如: 18.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  肌肉量 (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.muscleMass}
                  onChange={(e) => setFormData({ ...formData, muscleMass: e.target.value })}
                  placeholder="例如: 55.0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  备注
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="记录今天的感受、饮食情况等"
                  rows={3}
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

        {/* 时间范围选择 */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex gap-2">
            {[7, 30, 90, 180, 365].map((d) => (
              <Button
                key={d}
                onClick={() => setDays(d)}
                variant={days === d ? 'default' : 'outline'}
                size="sm"
              >
                {d === 7 ? '一周' : d === 30 ? '一月' : d === 90 ? '三月' : d === 180 ? '半年' : '一年'}
              </Button>
            ))}
          </div>
        </div>

        {/* 统计卡片 */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600 mb-1">当前体重</div>
              <div className="text-2xl font-bold text-blue-600">
                {stats.current ? `${stats.current.toFixed(1)} kg` : '-'}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600 mb-1">平均体重</div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.average ? `${stats.average.toFixed(1)} kg` : '-'}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600 mb-1">最高体重</div>
              <div className="text-2xl font-bold text-red-600">
                {stats.max ? `${stats.max.toFixed(1)} kg` : '-'}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600 mb-1">最低体重</div>
              <div className="text-2xl font-bold text-green-600">
                {stats.min ? `${stats.min.toFixed(1)} kg` : '-'}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600 mb-1">体重变化</div>
              <div className={`text-2xl font-bold ${
                stats.change && stats.change > 0 ? 'text-red-600' :
                stats.change && stats.change < 0 ? 'text-green-600' : 'text-gray-900'
              }`}>
                {stats.change ? `${stats.change > 0 ? '+' : ''}${stats.change.toFixed(1)} kg` : '-'}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600 mb-1">变化百分比</div>
              <div className={`text-2xl font-bold ${
                stats.changePercent && stats.changePercent > 0 ? 'text-red-600' :
                stats.changePercent && stats.changePercent < 0 ? 'text-green-600' : 'text-gray-900'
              }`}>
                {stats.changePercent ? `${stats.changePercent > 0 ? '+' : ''}${stats.changePercent.toFixed(1)}%` : '-'}
              </div>
            </div>
          </div>
        )}

        {/* 图表 */}
        {chartData.length > 0 ? (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">体重趋势图</h2>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="体重"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorWeight)"
                />
              </AreaChart>
            </ResponsiveContainer>

            {chartData.some(d => d.体脂率 || d.肌肉量) && (
              <>
                <h2 className="text-xl font-semibold mt-8 mb-4">体脂率 & 肌肉量趋势</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {chartData.some(d => d.体脂率) && (
                      <Line
                        type="monotone"
                        dataKey="体脂率"
                        stroke="#ef4444"
                        strokeWidth={2}
                      />
                    )}
                    {chartData.some(d => d.肌肉量) && (
                      <Line
                        type="monotone"
                        dataKey="肌肉量"
                        stroke="#10b981"
                        strokeWidth={2}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center mb-6">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              还没有体重记录
            </h2>
            <p className="text-gray-600 mb-6">
              开始记录你的体重，追踪健康变化
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              添加第一条记录
            </Button>
          </div>
        )}

        {/* 记录列表 */}
        {records.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <h2 className="text-xl font-semibold">历史记录</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      日期
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      体重
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      体脂率
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      肌肉量
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      备注
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {records.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(new Date(record.date), 'yyyy-MM-dd', { locale: zhCN })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        {record.weight.toFixed(1)} kg
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.bodyFat ? `${record.bodyFat.toFixed(1)}%` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.muscle ? `${record.muscle.toFixed(1)} kg` : '-'}
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
