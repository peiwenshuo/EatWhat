'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  LineChart,
  Line,
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
  Cell
} from 'recharts'
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  Flame,
  Scale,
  Dumbbell,
  UtensilsCrossed,
  Activity,
  Download,
  FileSpreadsheet,
  FileText
} from 'lucide-react'

interface WeightRecord {
  date: string
  weight: number
}

interface WorkoutRecord {
  date: string
  exercises: string
  duration: number
}

interface FoodRecord {
  date: string
  calories: number
}

export default function ProgressPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [weightData, setWeightData] = useState<WeightRecord[]>([])
  const [workoutData, setWorkoutData] = useState<WorkoutRecord[]>([])
  const [foodData, setFoodData] = useState<FoodRecord[]>([])
  const [stats, setStats] = useState({
    weightChange: 0,
    totalWorkouts: 0,
    avgCalories: 0,
    weeklyProgress: 0
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      loadAllData()
    }
  }, [status, router])

  const loadAllData = async () => {
    try {
      const [weightRes, workoutRes, foodRes] = await Promise.all([
        fetch('/api/health/weight?days=30'),
        fetch('/api/health/workout?days=30'),
        fetch('/api/health/food?days=30')
      ])

      const [weightJson, workoutJson, foodJson] = await Promise.all([
        weightRes.json(),
        workoutRes.json(),
        foodRes.json()
      ])

      if (weightJson.success) {
        setWeightData(weightJson.records)
      }

      if (workoutJson.success) {
        setWorkoutData(workoutJson.records)
      }

      if (foodJson.success) {
        setFoodData(foodJson.records)
      }

      // Calculate stats
      const weightChange = weightJson.stats?.change || 0
      const totalWorkouts = workoutJson.records?.length || 0
      const avgCalories = foodJson.stats?.avgCalories || 0
      const weeklyProgress = calculateWeeklyProgress(
        weightJson.records,
        workoutJson.records,
        foodJson.records
      )

      setStats({
        weightChange,
        totalWorkouts,
        avgCalories,
        weeklyProgress
      })

    } catch (error) {
      console.error('加载数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateWeeklyProgress = (
    weights: any[],
    workouts: any[],
    foods: any[]
  ) => {
    const now = new Date()
    const weekStart = startOfWeek(now, { locale: zhCN })

    const weekWeights = weights.filter(w => new Date(w.date) >= weekStart).length
    const weekWorkouts = workouts.filter(w => new Date(w.date) >= weekStart).length
    const weekFoods = foods.filter(f => new Date(f.date) >= weekStart).length

    const totalDays = eachDayOfInterval({
      start: weekStart,
      end: now
    }).length

    const expectedRecords = totalDays * 3 // Weight + Workout + Food per day
    const actualRecords = weekWeights + weekWorkouts + weekFoods

    return Math.round((actualRecords / expectedRecords) * 100)
  }

  // Prepare weekly overview data
  const getWeeklyOverview = () => {
    const now = new Date()
    const weekStart = startOfWeek(now, { locale: zhCN })
    const weekEnd = endOfWeek(now, { locale: zhCN })
    const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd })

    return daysInWeek.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd')

      const weightRecord = weightData.find(r =>
        format(new Date(r.date), 'yyyy-MM-dd') === dateStr
      )
      const workoutRecord = workoutData.find(r =>
        format(new Date(r.date), 'yyyy-MM-dd') === dateStr
      )
      const foodRecord = foodData.find(r =>
        format(new Date(r.date), 'yyyy-MM-dd') === dateStr
      )

      return {
        date: format(day, 'EEE', { locale: zhCN }),
        体重: weightRecord?.weight || null,
        运动时长: workoutRecord?.duration || null,
        卡路里: foodRecord?.calories || null
      }
    })
  }

  const weeklyOverview = getWeeklyOverview()

  // Activity distribution
  const activityDistribution = [
    { name: '体重记录', value: weightData.length, color: '#3b82f6' },
    { name: '训练记录', value: workoutData.length, color: '#10b981' },
    { name: '饮食记录', value: foodData.length, color: '#f59e0b' }
  ]

  const handleExportExcel = async () => {
    try {
      const response = await fetch('/api/export/excel?type=all&days=30')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `健康数据_${format(new Date(), 'yyyy-MM-dd')}.xlsx`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('导出Excel失败:', error)
    }
  }

  const handleExportPDF = async () => {
    try {
      const response = await fetch('/api/export/pdf?days=30')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `健康报告_${format(new Date(), 'yyyy-MM-dd')}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('导出PDF失败:', error)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">进度总览</h1>
            <p className="text-muted-foreground mt-2">全面追踪你的健康进展</p>
          </div>
          <div className="flex gap-2 self-start sm:self-auto flex-wrap">
            <Button onClick={handleExportExcel} variant="outline" className="gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              导出Excel
            </Button>
            <Button onClick={handleExportPDF} variant="outline" className="gap-2">
              <FileText className="w-4 h-4" />
              导出PDF
            </Button>
            <Button onClick={() => router.push('/dashboard')} variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              返回
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Scale className="w-5 h-5 text-blue-600" />
              </div>
              {stats.weightChange !== 0 && (
                stats.weightChange > 0 ?
                  <TrendingUp className="w-5 h-5 text-red-500" /> :
                  <TrendingDown className="w-5 h-5 text-green-500" />
              )}
            </div>
            <div className="text-sm text-muted-foreground mb-1">体重变化</div>
            <div className={`text-2xl font-bold ${
              stats.weightChange > 0 ? 'text-red-600' :
              stats.weightChange < 0 ? 'text-green-600' :
              'text-card-foreground'
            }`}>
              {stats.weightChange > 0 ? '+' : ''}{stats.weightChange.toFixed(1)} kg
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="text-sm text-muted-foreground mb-1">本月训练</div>
            <div className="text-2xl font-bold text-card-foreground">
              {stats.totalWorkouts} 次
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <div className="text-sm text-muted-foreground mb-1">平均卡路里</div>
            <div className="text-2xl font-bold text-card-foreground">
              {Math.round(stats.avgCalories)}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="text-sm text-muted-foreground mb-1">本周完成度</div>
            <div className="text-2xl font-bold text-card-foreground">
              {stats.weeklyProgress}%
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Weekly Overview */}
          <div className="bg-card border border-border rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-card-foreground mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              本周数据概览
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyOverview}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.75rem'
                  }}
                />
                <Legend />
                <Bar dataKey="运动时长" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Activity Distribution */}
          <div className="bg-card border border-border rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-card-foreground mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              记录分布
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={activityDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {activityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 30-Day Weight Trend */}
        {weightData.length > 0 && (
          <div className="bg-card border border-border rounded-2xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-card-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              30天体重趋势
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={weightData.slice().reverse().map(r => ({
                  date: format(new Date(r.date), 'MM-dd'),
                  体重: r.weight
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                <YAxis domain={['dataMin - 2', 'dataMax + 2']} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.75rem'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="体重"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ r: 4, fill: 'hsl(var(--primary))' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => router.push('/health/weight')}
            className="bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-primary/50 transition-all text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Scale className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="font-semibold text-card-foreground">记录体重</div>
                <div className="text-sm text-muted-foreground">添加今日体重数据</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => router.push('/health/workout')}
            className="bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-primary/50 transition-all text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="font-semibold text-card-foreground">记录训练</div>
                <div className="text-sm text-muted-foreground">添加今日训练记录</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => router.push('/health/food')}
            className="bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-primary/50 transition-all text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <UtensilsCrossed className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <div className="font-semibold text-card-foreground">记录饮食</div>
                <div className="text-sm text-muted-foreground">添加今日饮食数据</div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
