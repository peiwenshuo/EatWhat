'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loading } from '@/components/ui/loading'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts'
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import {
  Scale,
  Dumbbell,
  UtensilsCrossed,
  TrendingUp,
  Target,
  Smartphone,
  ArrowLeft,
  TrendingDown,
  Activity
} from 'lucide-react'

interface BodyRecord {
  id: string
  date: string
  weight: number
  bodyFat: number | null
  muscle: number | null
}

interface Stats {
  current: number | null
  average: number | null
  max: number | null
  min: number | null
  change: number | null
  changePercent: number | null
}

export default function HealthDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [weightRecords, setWeightRecords] = useState<BodyRecord[]>([])
  const [weightStats, setWeightStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      loadHealthData()
    }
  }, [status, router])

  const loadHealthData = async () => {
    try {
      // 获取最近30天的体重数据
      const weightResponse = await fetch('/api/health/weight?days=30')
      const weightData = await weightResponse.json()

      if (weightData.success) {
        setWeightRecords(weightData.records)
        setWeightStats(weightData.stats)
      }
    } catch (error) {
      console.error('加载健康数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 准备本周数据
  const thisWeekData = () => {
    const now = new Date()
    const weekStart = startOfWeek(now, { locale: zhCN })
    const weekEnd = endOfWeek(now, { locale: zhCN })
    const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd })

    return daysInWeek.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd')
      const record = weightRecords.find(r =>
        format(new Date(r.date), 'yyyy-MM-dd') === dateStr
      )

      return {
        date: format(day, 'EEE', { locale: zhCN }),
        体重: record?.weight || null,
        已记录: record ? 1 : 0
      }
    })
  }

  const weeklyData = thisWeekData()

  if (status === 'loading' || loading) {
    return <Loading fullScreen />
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">健康数据中心</h1>
            <p className="text-muted-foreground mt-2">全面追踪你的健康指标</p>
          </div>
          <Button onClick={() => router.push('/dashboard')} variant="outline" className="gap-2 self-start sm:self-auto">
            <ArrowLeft className="w-4 h-4" />
            返回主页
          </Button>
        </div>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => router.push('/health/weight')}
            className="group relative overflow-hidden bg-gradient-to-br from-primary to-blue-600 rounded-2xl shadow-lg p-8 text-left hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
            <div className="relative">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                <Scale className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">体重管理</h2>
              <p className="text-blue-50 mb-4 leading-relaxed">
                追踪体重、体脂率、肌肉量变化
              </p>
              {weightStats?.current && (
                <div className="text-3xl font-bold text-white mb-1">
                  {weightStats.current.toFixed(1)} kg
                </div>
              )}
              {weightStats?.change && (
                <div className="flex items-center gap-1.5 text-sm">
                  {weightStats.change > 0 ? (
                    <TrendingUp className="w-4 h-4 text-red-200" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-green-200" />
                  )}
                  <span className={weightStats.change > 0 ? 'text-red-200' : 'text-green-200'}>
                    {Math.abs(weightStats.change).toFixed(1)} kg
                  </span>
                </div>
              )}
            </div>
          </button>

          <button
            onClick={() => router.push('/health/workout')}
            className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg p-8 text-left hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
            <div className="relative">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                <Dumbbell className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">训练记录</h2>
              <p className="text-emerald-50 mb-4 leading-relaxed">
                记录每日训练内容和强度
              </p>
              <div className="flex items-center gap-2 text-sm text-emerald-100">
                <Activity className="w-4 h-4" />
                <span>点击进入 →</span>
              </div>
            </div>
          </button>

          <button
            onClick={() => router.push('/health/food')}
            className="group relative overflow-hidden bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl shadow-lg p-8 text-left hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
            <div className="relative">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                <UtensilsCrossed className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">饮食记录</h2>
              <p className="text-orange-50 mb-4 leading-relaxed">
                记录每日饮食和营养摄入
              </p>
              <div className="flex items-center gap-2 text-sm text-orange-100">
                <UtensilsCrossed className="w-4 h-4" />
                <span>点击进入 →</span>
              </div>
            </div>
          </button>
        </div>

        {/* Weekly Weight Overview */}
        <div className="bg-card border border-border rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-card-foreground mb-4">本周体重记录</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyData}>
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
              <Bar dataKey="体重" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 text-sm text-muted-foreground text-center flex items-center justify-center gap-2">
            <Activity className="w-4 h-4" />
            <span>本周已记录 {weeklyData.filter(d => d.已记录).length} / 7 天</span>
          </div>
        </div>

        {/* Stats Cards */}
        {weightStats && weightRecords.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-card border border-border rounded-xl shadow-sm p-5">
              <div className="text-sm text-muted-foreground mb-2">当前体重</div>
              <div className="text-2xl font-bold text-primary">
                {weightStats.current ? `${weightStats.current.toFixed(1)} kg` : '-'}
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm p-5">
              <div className="text-sm text-muted-foreground mb-2">30天平均</div>
              <div className="text-2xl font-bold text-card-foreground">
                {weightStats.average ? `${weightStats.average.toFixed(1)} kg` : '-'}
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm p-5">
              <div className="text-sm text-muted-foreground mb-2">体重变化</div>
              <div className={`text-2xl font-bold ${
                weightStats.change && weightStats.change > 0 ? 'text-destructive' :
                weightStats.change && weightStats.change < 0 ? 'text-green-600' : 'text-card-foreground'
              }`}>
                {weightStats.change ? `${weightStats.change > 0 ? '+' : ''}${weightStats.change.toFixed(1)} kg` : '-'}
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm p-5">
              <div className="text-sm text-muted-foreground mb-2">变化率</div>
              <div className={`text-2xl font-bold ${
                weightStats.changePercent && weightStats.changePercent > 0 ? 'text-destructive' :
                weightStats.changePercent && weightStats.changePercent < 0 ? 'text-green-600' : 'text-card-foreground'
              }`}>
                {weightStats.changePercent ? `${weightStats.changePercent > 0 ? '+' : ''}${weightStats.changePercent.toFixed(1)}%` : '-'}
              </div>
            </div>
          </div>
        )}

        {/* 30-Day Weight Trend */}
        {weightRecords.length > 0 && (
          <div className="bg-card border border-border rounded-2xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-card-foreground mb-4">30天体重趋势</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={weightRecords.slice().reverse().map(r => ({
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

        {/* Empty State */}
        {weightRecords.length === 0 && (
          <div className="bg-card border border-border rounded-2xl shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Activity className="w-10 h-10 text-accent-foreground" />
            </div>
            <h2 className="text-2xl font-semibold text-card-foreground mb-3">
              开始记录你的健康数据
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              从体重管理开始，全面追踪你的健康变化
            </p>
            <Button onClick={() => router.push('/health/weight')} size="lg">
              添加体重记录
            </Button>
          </div>
        )}

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-card border border-border rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-accent-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-card-foreground mb-2">数据可视化</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              通过图表直观展示健康数据趋势，支持日、周、月、年多维度分析
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-accent-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-card-foreground mb-2">目标追踪</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              设定健康目标，系统自动计算进度，帮助你持续改进
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-4">
              <Smartphone className="w-6 h-6 text-accent-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-card-foreground mb-2">便捷记录</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              简单快速的记录流程，支持批量导入和数据导出
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
