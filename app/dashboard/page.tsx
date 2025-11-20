'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Loading } from '@/components/ui/loading'
import {
  UtensilsCrossed,
  Activity,
  User,
  CalendarDays,
  MessageSquare,
  FlaskConical,
  LogOut,
  Sparkles,
  Dumbbell,
  TrendingUp,
  Target
} from 'lucide-react'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  if (status === 'loading') {
    return <Loading fullScreen />
  }

  if (!session) {
    return null
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
          <Button
            onClick={() => signOut({ callbackUrl: '/' })}
            variant="outline"
            className="gap-2 self-start sm:self-auto"
          >
            <LogOut className="w-4 h-4" />
            退出登录
          </Button>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* AI Diet - Featured Card */}
          <Link href="/ai-diet" className="group block">
            <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-blue-600 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] text-white h-full">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-5 group-hover:bg-white/30 transition-colors">
                  <UtensilsCrossed className="w-7 h-7" />
                </div>
                <h2 className="text-2xl font-bold mb-2">今天吃什么？</h2>
                <p className="text-blue-50 mb-4 leading-relaxed">AI 营养师为你定制每日饮食</p>
                <div className="inline-flex items-center gap-1.5 text-xs bg-white/25 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>基于XXXXXiugo</span>
                </div>
              </div>
            </div>
          </Link>

          {/* AI Workout - Featured Card */}
          <Link href="/ai-workout" className="group block">
            <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] text-white h-full">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-5 group-hover:bg-white/30 transition-colors">
                  <Dumbbell className="w-7 h-7" />
                </div>
                <h2 className="text-2xl font-bold mb-2">今天练什么？</h2>
                <p className="text-orange-50 mb-4 leading-relaxed">AI 教练为你定制专业训练</p>
                <div className="inline-flex items-center gap-1.5 text-xs bg-white/25 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>基于Duoge</span>
                </div>
              </div>
            </div>
          </Link>

          {/* Health Center - Featured Card */}
          <Link href="/health" className="group block">
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-green-500 to-emerald-600 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] text-white h-full">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-5 group-hover:bg-white/30 transition-colors">
                  <Activity className="w-7 h-7" />
                </div>
                <h2 className="text-2xl font-bold mb-2">健康数据中心</h2>
                <p className="text-emerald-50 mb-4 leading-relaxed">体重、训练、饮食全方位追踪</p>
                <div className="inline-flex items-center gap-1.5 text-xs bg-white/25 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>大裴给你瞎分析</span>
                </div>
              </div>
            </div>
          </Link>

          {/* Progress Card */}
          <Link href="/progress" className="group block">
            <div className="bg-card border border-border p-7 rounded-2xl hover:shadow-lg hover:border-primary/50 transition-all duration-300 h-full">
              <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                <TrendingUp className="w-6 h-6 text-accent-foreground group-hover:text-primary transition-colors" />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-card-foreground">进度总览</h2>
              <p className="text-muted-foreground leading-relaxed">查看全面的健康进展数据</p>
            </div>
          </Link>

          {/* Goals Card */}
          <Link href="/goals" className="group block">
            <div className="bg-card border border-border p-7 rounded-2xl hover:shadow-lg hover:border-primary/50 transition-all duration-300 h-full">
              <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                <Target className="w-6 h-6 text-accent-foreground group-hover:text-primary transition-colors" />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-card-foreground">我的目标</h2>
              <p className="text-muted-foreground leading-relaxed">设定和追踪健身目标</p>
            </div>
          </Link>

          {/* Profile Card */}
          <Link href="/profile" className="group block">
            <div className="bg-card border border-border p-7 rounded-2xl hover:shadow-lg hover:border-primary/50 transition-all duration-300 h-full">
              <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                <User className="w-6 h-6 text-accent-foreground group-hover:text-primary transition-colors" />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-card-foreground">个人资料</h2>
              <p className="text-muted-foreground leading-relaxed">设置身体数据和健身目标</p>
            </div>
          </Link>

          {/* Meal Plan Card */}
          <Link href="/meal-plan" className="group block">
            <div className="bg-card border border-border p-7 rounded-2xl hover:shadow-lg hover:border-primary/50 transition-all duration-300 h-full">
              <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                <CalendarDays className="w-6 h-6 text-accent-foreground group-hover:text-primary transition-colors" />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-card-foreground">我的计划</h2>
              <p className="text-muted-foreground leading-relaxed">查看已保存的饮食计划</p>
            </div>
          </Link>

          {/* History Card */}
          <Link href="/history" className="group block">
            <div className="bg-card border border-border p-7 rounded-2xl hover:shadow-lg hover:border-primary/50 transition-all duration-300 h-full">
              <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                <MessageSquare className="w-6 h-6 text-accent-foreground group-hover:text-primary transition-colors" />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-card-foreground">对话历史</h2>
              <p className="text-muted-foreground leading-relaxed">查看与 AI 的聊天记录</p>
            </div>
          </Link>

          {/* AI Test Card */}
          <Link href="/test-ai" className="group block">
            <div className="bg-card border border-border p-7 rounded-2xl hover:shadow-lg hover:border-primary/50 transition-all duration-300 h-full">
              <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                <FlaskConical className="w-6 h-6 text-accent-foreground group-hover:text-primary transition-colors" />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-card-foreground">AI 测试</h2>
              <p className="text-muted-foreground leading-relaxed">快速生成饮食和训练计划</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
