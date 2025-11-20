'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button } from '@/components/ui/button'
import { Loading } from '@/components/ui/loading'
import { ArrowLeft, MessageSquare, Plus } from 'lucide-react'
import Image from 'next/image'

interface Message {
  id: string
  role: string
  content: string
  createdAt: string
}

interface Conversation {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  messages: Message[]
}

export default function HistoryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      loadConversations()
    }
  }, [status, router])

  const loadConversations = async () => {
    try {
      const response = await fetch('/api/conversations')
      const data = await response.json()

      if (data.success) {
        setConversations(data.conversations)
        if (data.conversations.length > 0) {
          setSelectedConv(data.conversations[0])
        }
      }
    } catch (error) {
      console.error('加载对话历史失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN')
  }

  if (status === 'loading' || loading) {
    return <Loading fullScreen />
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">对话历史</h1>
            <p className="text-muted-foreground mt-2">查看所有与 AI 的对话记录</p>
          </div>
          <div className="flex gap-2 self-start sm:self-auto">
            <Button onClick={() => router.push('/ai-diet')} variant="outline" className="gap-1.5">
              <Plus className="w-4 h-4" />
              新对话
            </Button>
            <Button onClick={() => router.push('/dashboard')} variant="outline" className="gap-1.5">
              <ArrowLeft className="w-4 h-4" />
              返回
            </Button>
          </div>
        </div>

        {conversations.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-10 h-10 text-accent-foreground" />
            </div>
            <h2 className="text-2xl font-semibold text-card-foreground mb-3">
              还没有对话记录
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              去 AI 饮食顾问开始你的第一次对话吧！
            </p>
            <Button onClick={() => router.push('/ai-diet')} size="lg">
              开始对话
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左侧对话列表 */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 bg-accent border-b border-border">
                  <h2 className="font-semibold text-card-foreground">
                    全部对话 ({conversations.length})
                  </h2>
                </div>
                <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
                  {conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConv(conv)}
                      className={`w-full p-4 text-left hover:bg-accent transition ${
                        selectedConv?.id === conv.id ? 'bg-primary/10 border-l-4 border-primary' : ''
                      }`}
                    >
                      <div className="font-medium text-card-foreground truncate">
                        {conv.title}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {conv.messages.length} 条消息
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatDate(conv.updatedAt)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 右侧对话详情 */}
            <div className="lg:col-span-2">
              {selectedConv ? (
                <div className="bg-card border border-border rounded-2xl shadow-sm">
                  <div className="p-4 border-b border-border">
                    <h2 className="text-xl font-bold text-card-foreground">
                      {selectedConv.title}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      创建于: {formatDate(selectedConv.createdAt)}
                    </p>
                  </div>

                  <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto">
                    {selectedConv.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-4 ${
                          msg.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {msg.role === 'assistant' && (
                          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 shadow-lg ring-2 ring-primary/20">
                            <Image
                              src="/ai-avatar.jpg"
                              alt="AI"
                              width={40}
                              height={40}
                              className="object-cover"
                            />
                          </div>
                        )}

                        <div
                          className={`max-w-2xl rounded-2xl px-5 py-4 ${
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
                                  strong: ({ node, ...props }) => <strong className="font-semibold text-card-foreground" {...props} />,
                                  code: ({ node, ...props }) => <code className="bg-accent px-1.5 py-0.5 rounded text-sm text-accent-foreground" {...props} />,
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
                          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-bold flex-shrink-0">
                            我
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-card border border-border rounded-2xl shadow-sm p-12 text-center">
                  <p className="text-muted-foreground">选择一个对话查看详情</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
