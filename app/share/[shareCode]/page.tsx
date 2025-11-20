'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  ArrowLeft,
  Eye,
  Calendar,
  User,
  UtensilsCrossed,
  Dumbbell,
  Scale,
  Share2,
  Copy,
  Check
} from 'lucide-react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface ShareData {
  id: string
  shareCode: string
  type: string
  title: string
  content: any
  userName: string
  viewCount: number
  createdAt: string
}

export default function ShareViewPage() {
  const params = useParams()
  const router = useRouter()
  const shareCode = params.shareCode as string

  const [share, setShare] = useState<ShareData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadShareData()
  }, [shareCode])

  const loadShareData = async () => {
    try {
      const response = await fetch(`/api/share/${shareCode}`)
      const data = await response.json()

      if (data.success) {
        setShare(data.share)
      } else {
        setError(data.error || '加载失败')
      }
    } catch (err: any) {
      setError('加载分享内容失败')
    } finally {
      setLoading(false)
    }
  }

  const copyShareLink = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'diet_plan':
        return <UtensilsCrossed className="w-5 h-5" />
      case 'workout_log':
        return <Dumbbell className="w-5 h-5" />
      case 'body_record':
        return <Scale className="w-5 h-5" />
      default:
        return <Share2 className="w-5 h-5" />
    }
  }

  const getTypeName = (type: string) => {
    switch (type) {
      case 'diet_plan':
        return '饮食计划'
      case 'workout_log':
        return '训练记录'
      case 'body_record':
        return '体重记录'
      case 'food_log':
        return '饮食记录'
      default:
        return '分享内容'
    }
  }

  const renderContent = () => {
    if (!share) return null

    const { type, content } = share

    if (type === 'diet_plan') {
      return (
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mb-4 text-card-foreground" {...props} />,
              h2: ({ node, ...props }) => <h2 className="text-xl font-semibold mb-3 text-card-foreground" {...props} />,
              h3: ({ node, ...props }) => <h3 className="text-lg font-semibold mb-2 text-card-foreground" {...props} />,
              p: ({ node, ...props }) => <p className="mb-3 text-muted-foreground leading-relaxed" {...props} />,
              ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-4 space-y-2" {...props} />,
              ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-4 space-y-2" {...props} />,
              li: ({ node, ...props }) => <li className="text-muted-foreground" {...props} />,
              strong: ({ node, ...props }) => <strong className="font-semibold text-card-foreground" {...props} />,
              code: ({ node, ...props }) => <code className="bg-accent px-2 py-1 rounded text-sm text-accent-foreground" {...props} />,
              blockquote: ({ node, ...props }) => (
                <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-3" {...props} />
              ),
            }}
          >
            {typeof content === 'string' ? content : JSON.stringify(content, null, 2)}
          </ReactMarkdown>
        </div>
      )
    }

    if (type === 'workout_log') {
      const workout = content
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {workout.date && (
              <div className="bg-accent rounded-lg p-4">
                <div className="text-sm text-muted-foreground mb-1">日期</div>
                <div className="font-semibold text-card-foreground">
                  {format(new Date(workout.date), 'yyyy-MM-dd', { locale: zhCN })}
                </div>
              </div>
            )}
            {workout.exercises && (
              <div className="bg-accent rounded-lg p-4">
                <div className="text-sm text-muted-foreground mb-1">训练项目</div>
                <div className="font-semibold text-card-foreground">{workout.exercises}</div>
              </div>
            )}
            {workout.duration && (
              <div className="bg-accent rounded-lg p-4">
                <div className="text-sm text-muted-foreground mb-1">时长</div>
                <div className="font-semibold text-card-foreground">{workout.duration} 分钟</div>
              </div>
            )}
            {workout.intensity && (
              <div className="bg-accent rounded-lg p-4">
                <div className="text-sm text-muted-foreground mb-1">强度</div>
                <div className="font-semibold text-card-foreground">{workout.intensity}</div>
              </div>
            )}
          </div>
          {workout.notes && (
            <div className="bg-accent rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-2">备注</div>
              <div className="text-card-foreground whitespace-pre-wrap">{workout.notes}</div>
            </div>
          )}
        </div>
      )
    }

    if (type === 'body_record') {
      const record = content
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {record.weight && (
            <div className="bg-accent rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-1">体重</div>
              <div className="text-2xl font-bold text-primary">{record.weight} kg</div>
            </div>
          )}
          {record.bodyFat && (
            <div className="bg-accent rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-1">体脂率</div>
              <div className="text-2xl font-bold text-card-foreground">{record.bodyFat}%</div>
            </div>
          )}
          {record.muscle && (
            <div className="bg-accent rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-1">肌肉量</div>
              <div className="text-2xl font-bold text-card-foreground">{record.muscle} kg</div>
            </div>
          )}
          {record.date && (
            <div className="bg-accent rounded-lg p-4 col-span-2 md:col-span-3">
              <div className="text-sm text-muted-foreground mb-1">记录时间</div>
              <div className="font-semibold text-card-foreground">
                {format(new Date(record.date), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
              </div>
            </div>
          )}
        </div>
      )
    }

    // 默认显示JSON格式
    return (
      <pre className="bg-accent p-4 rounded-lg overflow-auto text-sm">
        {JSON.stringify(content, null, 2)}
      </pre>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  if (error || !share) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full bg-card border border-border rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Share2 className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold text-card-foreground mb-2">
            {error === '分享已过期' ? '分享已过期' :
             error === '分享已关闭' ? '分享已关闭' :
             '分享不存在'}
          </h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => router.push('/dashboard')} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-card border border-border rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                {getTypeIcon(share.type)}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                    {getTypeName(share.type)}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-card-foreground mb-2">
                  {share.title}
                </h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <User className="w-4 h-4" />
                    <span>{share.userName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(share.createdAt), 'yyyy-MM-dd', { locale: zhCN })}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4" />
                    <span>{share.viewCount} 次查看</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Share Actions */}
          <div className="flex gap-2">
            <Button
              onClick={copyShareLink}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  已复制
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  复制链接
                </>
              )}
            </Button>
            <Button
              onClick={() => router.push('/dashboard')}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              返回首页
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-card border border-border rounded-2xl shadow-sm p-6">
          {renderContent()}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>由 XiuGo Fitness 提供分享服务</p>
        </div>
      </div>
    </div>
  )
}
