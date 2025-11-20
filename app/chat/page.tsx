'use client'
import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function ChatPage() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const send = async () => {
    if (!input.trim() || loading) return

    const newMsg = [...messages, { role: 'user', content: input }]
    setMessages(newMsg)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMsg,
          userId: session?.user?.id
        }),
      })
      const data = await res.json()
      setMessages([...newMsg, { role: 'assistant', content: data.message }])
    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="border-b">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold">饮食健身助手</h1>
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
            返回首页
          </Link>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold mb-2">开始对话</h2>
              <p className="text-gray-500">问我任何关于饮食、健身、营养的问题</p>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={
              'py-6 ' + (m.role === 'assistant' ? 'bg-gray-50' : '')
            }>
              <div className="max-w-3xl mx-auto px-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" 
                       style={{backgroundColor: m.role === 'user' ? '#10a37f' : '#6b7280'}}>
                    <span className="text-white text-sm font-medium">
                      {m.role === 'user' ? 'U' : 'AI'}
                    </span>
                  </div>
                  <div className="flex-1 space-y-2 pt-1">
                    <p className="whitespace-pre-wrap leading-7">{m.content}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="py-6 bg-gray-50">
              <div className="max-w-3xl mx-auto px-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-500">
                    <span className="text-white text-sm font-medium">AI</span>
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t bg-white">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  send()
                }
              }}
              placeholder="输入消息..."
              disabled={loading}
              rows={1}
              className="flex-1 resize-none rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button 
              onClick={send} 
              disabled={loading || !input.trim()}
              className="px-6"
            >
              发送
            </Button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            AI 可能会犯错。请验证重要信息。
          </p>
        </div>
      </div>
    </div>
  )
}
