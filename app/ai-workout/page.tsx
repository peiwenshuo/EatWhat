'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import {
  Dumbbell,
  ArrowLeft,
  Plus,
  Send,
  Loader2,
  Save,
  Sparkles,
  User as UserIcon,
  Share2
} from 'lucide-react'
import { ShareDialog } from '@/components/ShareDialog'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function AIWorkoutPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [shareContent, setShareContent] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 添加错误监控
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('[AI Workout Page] 全局错误:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
        userAgent: navigator.userAgent
      })
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('[AI Workout Page] 未处理的 Promise 拒绝:', {
        reason: event.reason,
        userAgent: navigator.userAgent
      })
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    console.log('[AI Workout Page] 页面已加载', {
      userAgent: navigator.userAgent,
      viewport: { width: window.innerWidth, height: window.innerHeight }
    })

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') {
      console.log('[AI Workout Page] 未认证，重定向到登录页')
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      console.log('[AI Workout Page] 用户已认证:', session?.user?.email)
    }
  }, [status, router, session])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')

    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const response = await fetch('/api/ai/workout-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversationId
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }])

        if (data.conversationId && !conversationId) {
          setConversationId(data.conversationId)
        }
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `抱歉，出现了错误：${data.error}`
        }])
      }
    } catch (error: any) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `抱歉，请求失败：${error.message}`
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleNewChat = () => {
    setMessages([])
    setConversationId(null)
    setSaveMessage('')
  }

  const saveToWorkoutPlan = async (content: string) => {
    setSaving(true)
    setSaveMessage('')

    try {
      const response = await fetch('/api/health/workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          source: 'ai',
          date: new Date().toISOString()
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSaveMessage('✅ 已保存到我的训练计划')
        setTimeout(() => setSaveMessage(''), 3000)
      } else {
        setSaveMessage('❌ 保存失败')
      }
    } catch (error) {
      setSaveMessage('❌ 保存失败')
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-primary/20">
            <Image
              src="/ai-avatar.jpg"
              alt="AI Workout Coach"
              width={40}
              height={40}
              className="object-cover"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-card-foreground">Xiugo 训练顾问</h1>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Sparkles className="w-3.5 h-3.5" />
              <span>基于XiuGo的专业训练指导</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 self-start sm:self-auto">
          <Button onClick={handleNewChat} variant="outline" size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" />
            新对话
          </Button>
          <Button onClick={() => router.push('/dashboard')} variant="outline" size="sm" className="gap-1.5">
            <ArrowLeft className="w-4 h-4" />
            返回
          </Button>
        </div>
      </div>

      {/* 对话区域 */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-accent rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Dumbbell className="w-12 h-12 text-accent-foreground" />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-3">
                今天练什么？
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                告诉我你的目标，我来帮你制定专业的训练计划
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                <button
                  onClick={() => setInput('我想增肌，请给我一份详细的增肌训练计划')}
                  className="group p-5 bg-card border border-border rounded-xl hover:border-primary hover:shadow-md transition-all text-left"
                >
                  <div className="font-semibold text-card-foreground mb-1">增肌训练</div>
                  <div className="text-sm text-muted-foreground">获取专业增肌计划</div>
                </button>
                <button
                  onClick={() => setInput('我想减脂，应该做什么运动？')}
                  className="group p-5 bg-card border border-border rounded-xl hover:border-primary hover:shadow-md transition-all text-left"
                >
                  <div className="font-semibold text-card-foreground mb-1">减脂训练</div>
                  <div className="text-sm text-muted-foreground">定制减脂运动方案</div>
                </button>
                <button
                  onClick={() => setInput('给我一份适合新手的全身训练计划')}
                  className="group p-5 bg-card border border-border rounded-xl hover:border-primary hover:shadow-md transition-all text-left"
                >
                  <div className="font-semibold text-card-foreground mb-1">新手入门</div>
                  <div className="text-sm text-muted-foreground">适合初学者的训练</div>
                </button>
                <button
                  onClick={() => setInput('如何提高力量和爆发力？')}
                  className="group p-5 bg-card border border-border rounded-xl hover:border-primary hover:shadow-md transition-all text-left"
                >
                  <div className="font-semibold text-card-foreground mb-1">力量提升</div>
                  <div className="text-sm text-muted-foreground">增强力量和爆发力</div>
                </button>
              </div>
            </div>
          )}

          {messages.map((msg, index) => (
            <div key={index}>
              <div
                className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 shadow-lg ring-2 ring-blue-500/20">
                    <Image
                      src="/ai-avatar.jpg"
                      alt="AI Workout Coach"
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  </div>
                )}

                <div
                  className={`max-w-3xl rounded-2xl px-5 py-4 ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border border-border'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({ node, ...props }) => <h1 className="text-xl font-bold mb-3 text-card-foreground" {...props} />,
                          h2: ({ node, ...props }) => <h2 className="text-lg font-semibold mb-2 text-card-foreground" {...props} />,
                          h3: ({ node, ...props }) => <h3 className="text-base font-semibold mb-2 text-card-foreground" {...props} />,
                          p: ({ node, ...props }) => <p className="mb-2 text-muted-foreground leading-relaxed" {...props} />,
                          ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-3 space-y-1" {...props} />,
                          ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-3 space-y-1" {...props} />,
                          li: ({ node, ...props }) => <li className="text-muted-foreground" {...props} />,
                          strong: ({ node, ...props }) => <strong className="font-semibold text-card-foreground" {...props} />,
                          code: ({ node, ...props }) => <code className="bg-accent px-1.5 py-0.5 rounded text-sm text-accent-foreground" {...props} />,
                          blockquote: ({ node, ...props }) => (
                            <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-2" {...props} />
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <UserIcon className="w-5 h-5 text-secondary-foreground" />
                  </div>
                )}
              </div>

              {/* AI 消息下方的操作按钮 */}
              {msg.role === 'assistant' && (
                <div className="flex justify-start ml-14 mt-3 gap-2">
                  <Button
                    onClick={() => saveToWorkoutPlan(msg.content)}
                    disabled={saving}
                    size="sm"
                    variant="outline"
                    className="gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>保存中...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>保存到我的训练计划</span>
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      setShareContent(msg.content)
                      setShareDialogOpen(true)
                    }}
                    size="sm"
                    variant="outline"
                    className="gap-2"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>分享</span>
                  </Button>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 shadow-lg ring-2 ring-blue-500/20">
                <Image
                  src="/ai-avatar.jpg"
                  alt="AI Workout Coach"
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
              <div className="bg-card border border-border rounded-2xl px-5 py-4">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 输入区域 */}
      <div className="bg-card border-t border-border px-4 py-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          {saveMessage && (
            <div className="mb-3 text-sm text-center text-green-600 dark:text-green-400 font-medium">
              {saveMessage}
            </div>
          )}
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入你的训练问题，比如'今天练什么？'"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <Button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-6"
            >
              {loading ? '发送中...' : '发送'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            基于你的个人资料，AI 会给出更精准的训练建议
          </p>
        </form>
      </div>

      {/* 分享对话框 */}
      <ShareDialog
        isOpen={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        type="workout_log"
        title="AI 训练计划"
        content={shareContent}
        expiresInDays={7}
      />
    </div>
  )
}
