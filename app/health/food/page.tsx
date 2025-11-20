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

interface FoodLog {
  id: string
  date: string
  mealType: string
  foods: string
  calories: number | null
  protein: number | null
  carbs: number | null
  fat: number | null
  notes: string | null
  createdAt: string
}

interface Stats {
  totalMeals: number
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  avgCalories: number
  avgProtein: number
  avgCarbs: number
  avgFat: number
  mealTypeStats: Record<string, { count: number; calories: number }>
}

const MEAL_TYPES = ['早餐', '午餐', '晚餐', '加餐']

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']

export default function FoodPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [records, setRecords] = useState<FoodLog[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [days, setDays] = useState(30)

  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    mealType: '早餐',
    foods: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
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
      const response = await fetch(`/api/health/food?days=${days}`)
      const data = await response.json()

      if (data.success) {
        setRecords(data.records)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('加载饮食数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch('/api/health/food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: formData.date,
          mealType: formData.mealType,
          foods: formData.foods,
          calories: formData.calories ? parseInt(formData.calories) : null,
          protein: formData.protein ? parseFloat(formData.protein) : null,
          carbs: formData.carbs ? parseFloat(formData.carbs) : null,
          fat: formData.fat ? parseFloat(formData.fat) : null,
          notes: formData.notes || null
        })
      })

      const data = await response.json()

      if (data.success) {
        setShowAddForm(false)
        setFormData({
          date: format(new Date(), 'yyyy-MM-dd'),
          mealType: '早餐',
          foods: '',
          calories: '',
          protein: '',
          carbs: '',
          fat: '',
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
      const response = await fetch(`/api/health/food?id=${id}`, {
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
  const mealTypeChartData = stats?.mealTypeStats
    ? Object.entries(stats.mealTypeStats).map(([type, data]) => ({
        name: type,
        次数: data.count,
        卡路里: Math.round(data.calories)
      }))
    : []

  const nutritionData = stats ? [
    { name: '蛋白质', value: Math.round(stats.totalProtein), color: '#3b82f6' },
    { name: '碳水', value: Math.round(stats.totalCarbs), color: '#10b981' },
    { name: '脂肪', value: Math.round(stats.totalFat), color: '#f59e0b' }
  ] : []

  const dailyCaloriesData = records
    .slice()
    .reverse()
    .reduce((acc, record) => {
      const dateStr = format(new Date(record.date), 'MM/dd')
      const existing = acc.find(item => item.date === dateStr)
      if (existing) {
        existing.卡路里 += record.calories || 0
      } else {
        acc.push({
          date: dateStr,
          卡路里: record.calories || 0
        })
      }
      return acc
    }, [] as Array<{ date: string; 卡路里: number }>)

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
            <h1 className="text-3xl font-bold text-gray-900">饮食记录</h1>
            <p className="text-gray-600 mt-1">记录每日饮食和营养摄入</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              variant={showAddForm ? 'outline' : 'default'}
            >
              {showAddForm ? '取消' : '➕ 添加记录'}
            </Button>
            <Button onClick={() => router.push('/health')} variant="outline">
              返回
            </Button>
          </div>
        </div>

        {showAddForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">添加饮食记录</h2>
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
                  餐次 *
                </label>
                <select
                  value={formData.mealType}
                  onChange={(e) => setFormData({ ...formData, mealType: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {MEAL_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  食物 *
                </label>
                <textarea
                  value={formData.foods}
                  onChange={(e) => setFormData({ ...formData, foods: e.target.value })}
                  required
                  placeholder="例如: 鸡胸肉200g, 糙米饭150g, 西兰花100g"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  卡路里
                </label>
                <input
                  type="number"
                  value={formData.calories}
                  onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                  placeholder="例如: 500"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  蛋白质 (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.protein}
                  onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                  placeholder="例如: 40"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  碳水化合物 (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.carbs}
                  onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                  placeholder="例如: 60"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  脂肪 (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.fat}
                  onChange={(e) => setFormData({ ...formData, fat: e.target.value })}
                  placeholder="例如: 15"
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
                  placeholder="记录口感、感受等"
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

        {stats && stats.totalMeals > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600 mb-1">总餐数</div>
                <div className="text-2xl font-bold text-blue-600">
                  {stats.totalMeals} 餐
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600 mb-1">总卡路里</div>
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round(stats.totalCalories)}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600 mb-1">总蛋白质</div>
                <div className="text-2xl font-bold text-blue-500">
                  {Math.round(stats.totalProtein)}g
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600 mb-1">总碳水</div>
                <div className="text-2xl font-bold text-green-500">
                  {Math.round(stats.totalCarbs)}g
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600 mb-1">总脂肪</div>
                <div className="text-2xl font-bold text-yellow-500">
                  {Math.round(stats.totalFat)}g
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">餐次分布</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={mealTypeChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="次数"
                    >
                      {mealTypeChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">营养成分分布</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={nutritionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name} ${value}g`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {nutritionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {dailyCaloriesData.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">每日卡路里摄入</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyCaloriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="卡路里"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">平均营养摄入</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {Math.round(stats.avgCalories)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">每餐卡路里</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-500">
                    {stats.avgProtein.toFixed(1)}g
                  </div>
                  <div className="text-sm text-gray-600 mt-1">每餐蛋白质</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-500">
                    {stats.avgCarbs.toFixed(1)}g
                  </div>
                  <div className="text-sm text-gray-600 mt-1">每餐碳水</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-500">
                    {stats.avgFat.toFixed(1)}g
                  </div>
                  <div className="text-sm text-gray-600 mt-1">每餐脂肪</div>
                </div>
              </div>
            </div>
          </>
        )}

        {records.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">🍽️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              还没有饮食记录
            </h2>
            <p className="text-gray-600 mb-6">
              开始记录你的饮食，追踪营养摄入
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              添加第一条记录
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <h2 className="text-xl font-semibold">饮食历史</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">日期</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">餐次</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">食物</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">卡路里</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">蛋白质</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">碳水</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">脂肪</th>
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
                        {record.mealType}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {record.foods}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.calories || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.protein ? `${record.protein}g` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.carbs ? `${record.carbs}g` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.fat ? `${record.fat}g` : '-'}
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
