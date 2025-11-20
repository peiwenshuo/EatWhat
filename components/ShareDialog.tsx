'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Share2,
  Copy,
  Check,
  X,
  Loader2,
  ExternalLink
} from 'lucide-react'

interface ShareDialogProps {
  isOpen: boolean
  onClose: () => void
  type: string
  title: string
  content: any
  expiresInDays?: number
}

export function ShareDialog({
  isOpen,
  onClose,
  type,
  title,
  content,
  expiresInDays = 7
}: ShareDialogProps) {
  const [loading, setLoading] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const handleShare = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          title,
          content,
          expiresInDays
        })
      })

      const data = await response.json()

      if (data.success) {
        setShareUrl(data.share.shareUrl)
      } else {
        setError(data.error || '创建分享失败')
      }
    } catch (err: any) {
      setError('创建分享失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const openInNewTab = () => {
    window.open(shareUrl, '_blank')
  }

  const handleClose = () => {
    setShareUrl('')
    setCopied(false)
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Share2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-card-foreground">分享内容</h2>
              <p className="text-sm text-muted-foreground">{title}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg hover:bg-accent flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {!shareUrl ? (
            <>
              <div className="bg-accent rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-2">
                  创建分享链接后，任何人都可以通过链接查看此内容
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  <span>链接有效期：{expiresInDays} 天</span>
                </div>
              </div>

              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <Button
                onClick={handleShare}
                disabled={loading}
                className="w-full gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    创建中...
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    创建分享链接
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <div className="bg-accent rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-2">分享链接</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-card-foreground"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  className="flex-1 gap-2"
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
                  onClick={openInNewTab}
                  variant="outline"
                  className="flex-1 gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  打开链接
                </Button>
              </div>

              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <p className="text-sm text-green-700 dark:text-green-400">
                  ✓ 分享链接已创建成功！
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {shareUrl && (
          <div className="mt-6 pt-4 border-t border-border">
            <Button
              onClick={handleClose}
              variant="ghost"
              className="w-full"
            >
              完成
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
