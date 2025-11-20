'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button } from '@/components/ui/button'
import { Loading } from '@/components/ui/loading'
import { ArrowLeft, CalendarDays, Plus } from 'lucide-react'

interface MealPlan {
  id: string
  date: string
  content: string
  source: string
  createdAt: string
}

export default function MealPlanPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<MealPlan | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      loadMealPlans()
    }
  }, [status, router])

  const loadMealPlans = async () => {
    try {
      const response = await fetch('/api/meal-plans')
      const data = await response.json()

      if (data.success) {
        setMealPlans(data.mealPlans)
        if (data.mealPlans.length > 0) {
          setSelectedPlan(data.mealPlans[0])
        }
      }
    } catch (error) {
      console.error('加载饮食计划失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (status === 'loading' || loading) {
    return <Loading fullScreen />
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">我的饮食计划</h1>
            <p className="text-muted-foreground mt-2">查看和管理已保存的饮食计划</p>
          </div>
          <div className="flex gap-2 self-start sm:self-auto">
            <Button onClick={() => router.push('/ai-diet')} variant="outline" className="gap-1.5">
              <Plus className="w-4 h-4" />
              生成新计划
            </Button>
            <Button onClick={() => router.push('/dashboard')} variant="outline" className="gap-1.5">
              <ArrowLeft className="w-4 h-4" />
              返回
            </Button>
          </div>
        </div>

        {mealPlans.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-6">
              <CalendarDays className="w-10 h-10 text-accent-foreground" />
            </div>
            <h2 className="text-2xl font-semibold text-card-foreground mb-3">
              还没有保存的计划
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              去 AI 饮食顾问生成你的第一份饮食计划吧！
            </p>
            <Button onClick={() => router.push('/ai-diet')} size="lg">
              开始生成
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左侧列表 */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 bg-accent border-b border-border">
                  <h2 className="font-semibold text-card-foreground">
                    全部计划 ({mealPlans.length})
                  </h2>
                </div>
                <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
                  {mealPlans.map((plan) => (
                    <button
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan)}
                      className={`w-full p-4 text-left hover:bg-accent transition ${
                        selectedPlan?.id === plan.id ? 'bg-primary/10 border-l-4 border-primary' : ''
                      }`}
                    >
                      <div className="font-medium text-card-foreground">
                        {formatDate(plan.date)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {new Date(plan.createdAt).toLocaleString('zh-CN')}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        来源: {plan.source === 'ai' ? 'AI 生成' : '手动添加'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 右侧详情 */}
            <div className="lg:col-span-2">
              {selectedPlan ? (
                <div className="bg-card border border-border rounded-2xl shadow-sm p-6">
                  <div className="mb-4 pb-4 border-b border-border">
                    <h2 className="text-2xl font-bold text-card-foreground">
                      {formatDate(selectedPlan.date)}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      创建于: {new Date(selectedPlan.createdAt).toLocaleString('zh-CN')}
                    </p>
                  </div>

                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mb-4 text-card-foreground" {...props} />,
                        h2: ({ node, ...props }) => <h2 className="text-xl font-semibold mb-3 text-card-foreground" {...props} />,
                        h3: ({ node, ...props }) => <h3 className="text-lg font-semibold mb-2 text-card-foreground" {...props} />,
                        p: ({ node, ...props }) => <p className="mb-3 text-muted-foreground leading-relaxed" {...props} />,
                        ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-4 space-y-1" {...props} />,
                        ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-4 space-y-1" {...props} />,
                        li: ({ node, ...props }) => <li className="text-muted-foreground" {...props} />,
                        strong: ({ node, ...props }) => <strong className="font-semibold text-card-foreground" {...props} />,
                        code: ({ node, ...props }) => <code className="bg-accent px-1.5 py-0.5 rounded text-sm text-accent-foreground" {...props} />,
                        blockquote: ({ node, ...props }) => (
                          <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-3" {...props} />
                        ),
                      }}
                    >
                      {selectedPlan.content}
                    </ReactMarkdown>
                  </div>
                </div>
              ) : (
                <div className="bg-card border border-border rounded-2xl shadow-sm p-12 text-center">
                  <p className="text-muted-foreground">选择一个计划查看详情</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
