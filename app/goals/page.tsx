'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  Plus,
  Target,
  Calendar,
  TrendingUp,
  CheckCircle2,
  Pause,
  Trash2,
  Edit,
  Flag
} from 'lucide-react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface FitnessGoal {
  id: string
  type: string
  title: string
  description: string | null
  targetValue: number
  currentValue: number | null
  unit: string
  startDate: string
  targetDate: string
  completedAt: string | null
  status: string
  progress: number
  notes: string | null
  createdAt: string
}

interface GoalStats {
  total: number
  active: number
  completed: number
  avgProgress: number
}

export default function GoalsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [goals, setGoals] = useState<FitnessGoal[]>([])
  const [stats, setStats] = useState<GoalStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('active')
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      loadGoals()
    }
  }, [status, router, filter])

  const loadGoals = async () => {
    try {
      const response = await fetch(`/api/goals?status=${filter}`)
      const data = await response.json()

      if (data.success) {
        setGoals(data.goals)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('加载目标失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const getGoalTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      weight_loss: '减重',
      muscle_gain: '增肌',
      body_shape: '塑形',
      endurance: '耐力',
      strength: '力量'
    }
    return types[type] || type
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-700'
      case 'completed':
        return 'bg-green-100 text-green-700'
      case 'paused':
        return 'bg-yellow-100 text-yellow-700'
      case 'abandoned':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: '进行中',
      completed: '已完成',
      paused: '已暂停',
      abandoned: '已放弃'
    }
    return labels[status] || status
  }

  const deleteGoal = async (id: string) => {
    if (!confirm('确定要删除这个目标吗？')) return

    try {
      const response = await fetch(`/api/goals?id=${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        loadGoals()
      }
    } catch (error) {
      console.error('删除目标失败:', error)
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
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">我的目标</h1>
            <p className="text-muted-foreground mt-2">设定和追踪你的健身目标</p>
          </div>
          <div className="flex gap-2 self-start sm:self-auto">
            <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              新建目标
            </Button>
            <Button onClick={() => router.push('/dashboard')} variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              返回
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card border border-border rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-muted-foreground">总目标</div>
                <Target className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold text-card-foreground">{stats.total}</div>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-muted-foreground">进行中</div>
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-muted-foreground">已完成</div>
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-muted-foreground">平均进度</div>
                <Flag className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-orange-600">{stats.avgProgress}%</div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filter === 'active'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card text-muted-foreground hover:bg-accent'
            }`}
          >
            进行中
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filter === 'completed'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card text-muted-foreground hover:bg-accent'
            }`}
          >
            已完成
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filter === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card text-muted-foreground hover:bg-accent'
            }`}
          >
            全部
          </button>
        </div>

        {/* Goals List */}
        {goals.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Target className="w-10 h-10 text-accent-foreground" />
            </div>
            <h2 className="text-2xl font-semibold text-card-foreground mb-3">
              还没有设定目标
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              设定一个健身目标，开始你的健康之旅吧！
            </p>
            <Button onClick={() => setShowCreateDialog(true)} size="lg" className="gap-2">
              <Plus className="w-5 h-5" />
              创建第一个目标
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {goals.map((goal) => (
              <div key={goal.id} className="bg-card border border-border rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow">
                {/* Goal Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(goal.status)}`}>
                        {getStatusLabel(goal.status)}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-accent text-accent-foreground font-medium">
                        {getGoalTypeLabel(goal.type)}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-card-foreground">{goal.title}</h3>
                    {goal.description && (
                      <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="w-8 h-8 rounded-lg hover:bg-accent flex items-center justify-center transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">进度</span>
                    <span className="font-semibold text-primary">{Math.round(goal.progress)}%</span>
                  </div>
                  <div className="w-full bg-accent rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, goal.progress)}%` }}
                    />
                  </div>
                </div>

                {/* Goal Details */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">当前</div>
                    <div className="text-lg font-semibold text-card-foreground">
                      {goal.currentValue !== null ? `${goal.currentValue} ${goal.unit}` : '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">目标</div>
                    <div className="text-lg font-semibold text-primary">
                      {goal.targetValue} {goal.unit}
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>截止：{format(new Date(goal.targetDate), 'yyyy-MM-dd', { locale: zhCN })}</span>
                  </div>
                  {goal.completedAt && (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>完成于 {format(new Date(goal.completedAt), 'MM-dd', { locale: zhCN })}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Goal Dialog - 简化版，后续可以完善 */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-card-foreground mb-4">创建新目标</h2>
            <p className="text-muted-foreground mb-6">
              此功能正在完善中，敬请期待！
            </p>
            <Button onClick={() => setShowCreateDialog(false)} className="w-full">
              关闭
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
