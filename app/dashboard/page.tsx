'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Loading } from '@/components/ui/loading'
import {
  UtensilsCrossed,
  Activity,
  User,
  CalendarDays,
  MessageSquare,
  FlaskConical,
  Sparkles,
  Dumbbell,
  TrendingUp,
  Target,
  Bell
} from 'lucide-react'

interface DashboardCard {
  id: string
  label: string
  description: string
  visible: boolean
  order: number
}

const defaultCards: DashboardCard[] = [
  { id: 'ai-diet', label: '今天吃什么？', description: 'AI 营养师', visible: true, order: 0 },
  { id: 'ai-workout', label: '今天练什么？', description: 'AI 教练', visible: true, order: 1 },
  { id: 'health', label: '健康数据中心', description: '数据追踪', visible: true, order: 2 },
  { id: 'progress', label: '进度总览', description: '查看进展', visible: true, order: 3 },
  { id: 'goals', label: '我的目标', description: '目标追踪', visible: true, order: 4 },
  { id: 'profile', label: '个人资料', description: '身体数据', visible: true, order: 5 },
  { id: 'meal-plan', label: '我的计划', description: '饮食计划', visible: true, order: 6 },
  { id: 'reminders', label: '提醒设置', description: '数据提醒', visible: true, order: 7 },
  { id: 'history', label: '对话历史', description: 'AI 聊天', visible: true, order: 8 },
  { id: 'test-ai', label: 'AI 测试', description: '快速生成', visible: true, order: 9 }
]

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [cards, setCards] = useState<DashboardCard[]>(defaultCards)
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    // 从 localStorage 加载设置
    const savedCards = localStorage.getItem('dashboardCards')
    const savedLayout = localStorage.getItem('layoutMode')

    if (savedCards) {
      try {
        setCards(JSON.parse(savedCards))
      } catch (e) {
        console.error('Failed to parse saved cards:', e)
      }
    }

    if (savedLayout) {
      setLayoutMode(savedLayout as 'grid' | 'list')
    }
  }, [])

  if (status === 'loading') {
    return <Loading fullScreen />
  }

  if (!session) {
    return null
  }

  // 获取可见的卡片并按顺序排序
  const visibleCards = cards
    .filter(card => card.visible)
    .sort((a, b) => a.order - b.order)

  // 渲染卡片内容
  const renderCard = (cardId: string) => {
    switch (cardId) {
      case 'ai-diet':
        return (
          <Link href="/ai-diet" className="group block">
            <div className="relative overflow-hidden p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] text-white h-full">
              <Image
                src="/1.jpg"
                alt="AI Diet"
                fill
                className="object-cover brightness-75 group-hover:brightness-90 transition-all duration-300"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="relative h-full flex flex-col justify-end">
                <div className="w-14 h-14 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-5 group-hover:bg-white transition-colors shadow-lg">
                  <UtensilsCrossed className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2 drop-shadow-lg">今天吃什么？</h2>
                <p className="text-white/90 mb-4 leading-relaxed drop-shadow-md">AI 营养师为你定制每日饮食</p>
                <div className="inline-flex items-center gap-1.5 text-xs bg-white/90 text-primary backdrop-blur-sm px-3 py-1.5 rounded-full self-start">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="font-medium">基于Xiugo</span>
                </div>
              </div>
            </div>
          </Link>
        )

      case 'ai-workout':
        return (
          <Link href="/ai-workout" className="group block">
            <div className="relative overflow-hidden p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] text-white h-full">
              <Image
                src="/2.jpg"
                alt="AI Workout"
                fill
                className="object-cover brightness-75 group-hover:brightness-90 transition-all duration-300"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="relative h-full flex flex-col justify-end">
                <div className="w-14 h-14 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-5 group-hover:bg-white transition-colors shadow-lg">
                  <Dumbbell className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2 drop-shadow-lg">今天练什么？</h2>
                <p className="text-white/90 mb-4 leading-relaxed drop-shadow-md">AI 教练为你定制专业训练</p>
                <div className="inline-flex items-center gap-1.5 text-xs bg-white/90 text-primary backdrop-blur-sm px-3 py-1.5 rounded-full self-start">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="font-medium">基于Duoge</span>
                </div>
              </div>
            </div>
          </Link>
        )

      case 'health':
        return (
          <Link href="/health" className="group block">
            <div className="relative overflow-hidden p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] text-white h-full">
              <Image
                src="/3.jpg"
                alt="Health Center"
                fill
                className="object-cover brightness-75 group-hover:brightness-90 transition-all duration-300"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="relative h-full flex flex-col justify-end">
                <div className="w-14 h-14 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-5 group-hover:bg-white transition-colors shadow-lg">
                  <Activity className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2 drop-shadow-lg">健康数据中心</h2>
                <p className="text-white/90 mb-4 leading-relaxed drop-shadow-md">体重、训练、饮食全方位追踪</p>
                <div className="inline-flex items-center gap-1.5 text-xs bg-white/90 text-primary backdrop-blur-sm px-3 py-1.5 rounded-full self-start">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="font-medium">大裴给你瞎分析</span>
                </div>
              </div>
            </div>
          </Link>
        )

      case 'progress':
        return (
          <Link href="/progress" className="group block">
            <div className="bg-card border border-border p-7 rounded-2xl hover:shadow-lg hover:border-primary/50 transition-all duration-300 h-full">
              <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                <TrendingUp className="w-6 h-6 text-accent-foreground group-hover:text-primary transition-colors" />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-card-foreground">进度总览</h2>
              <p className="text-muted-foreground leading-relaxed">查看全面的健康进展数据</p>
            </div>
          </Link>
        )

      case 'goals':
        return (
          <Link href="/goals" className="group block">
            <div className="bg-card border border-border p-7 rounded-2xl hover:shadow-lg hover:border-primary/50 transition-all duration-300 h-full">
              <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                <Target className="w-6 h-6 text-accent-foreground group-hover:text-primary transition-colors" />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-card-foreground">我的目标</h2>
              <p className="text-muted-foreground leading-relaxed">设定和追踪健身目标</p>
            </div>
          </Link>
        )

      case 'profile':
        return (
          <Link href="/profile" className="group block">
            <div className="bg-card border border-border p-7 rounded-2xl hover:shadow-lg hover:border-primary/50 transition-all duration-300 h-full">
              <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                <User className="w-6 h-6 text-accent-foreground group-hover:text-primary transition-colors" />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-card-foreground">个人资料</h2>
              <p className="text-muted-foreground leading-relaxed">设置身体数据和健身目标</p>
            </div>
          </Link>
        )

      case 'meal-plan':
        return (
          <Link href="/meal-plan" className="group block">
            <div className="bg-card border border-border p-7 rounded-2xl hover:shadow-lg hover:border-primary/50 transition-all duration-300 h-full">
              <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                <CalendarDays className="w-6 h-6 text-accent-foreground group-hover:text-primary transition-colors" />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-card-foreground">我的计划</h2>
              <p className="text-muted-foreground leading-relaxed">查看已保存的饮食计划</p>
            </div>
          </Link>
        )

      case 'reminders':
        return (
          <Link href="/reminders" className="group block">
            <div className="bg-card border border-border p-7 rounded-2xl hover:shadow-lg hover:border-primary/50 transition-all duration-300 h-full">
              <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                <Bell className="w-6 h-6 text-accent-foreground group-hover:text-primary transition-colors" />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-card-foreground">提醒设置</h2>
              <p className="text-muted-foreground leading-relaxed">设置健康数据记录提醒</p>
            </div>
          </Link>
        )

      case 'history':
        return (
          <Link href="/history" className="group block">
            <div className="bg-card border border-border p-7 rounded-2xl hover:shadow-lg hover:border-primary/50 transition-all duration-300 h-full">
              <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                <MessageSquare className="w-6 h-6 text-accent-foreground group-hover:text-primary transition-colors" />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-card-foreground">对话历史</h2>
              <p className="text-muted-foreground leading-relaxed">查看与 AI 的聊天记录</p>
            </div>
          </Link>
        )

      case 'test-ai':
        return (
          <Link href="/test-ai" className="group block">
            <div className="bg-card border border-border p-7 rounded-2xl hover:shadow-lg hover:border-primary/50 transition-all duration-300 h-full">
              <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                <FlaskConical className="w-6 h-6 text-accent-foreground group-hover:text-primary transition-colors" />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-card-foreground">AI 测试</h2>
              <p className="text-muted-foreground leading-relaxed">快速生成饮食和训练计划</p>
            </div>
          </Link>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">窝</h1>
            <p className="text-muted-foreground mt-2">欢迎回来，{session.user?.name || session.user?.email}</p>
          </div>
        </div>

        {/* Feature Cards */}
        <div className={`grid gap-4 sm:gap-6 ${
          layoutMode === 'grid'
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1'
        }`}>
          {visibleCards.map((card) => (
            <div key={card.id}>
              {renderCard(card.id)}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {visibleCards.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">没有可显示的卡片</p>
            <Link
              href="/settings/layout"
              className="text-primary hover:underline"
            >
              前往布局设置
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
