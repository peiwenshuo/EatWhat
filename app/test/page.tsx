'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function TestPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const testAI = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetCalories: 2000 }),
      })
      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">AI 测试</h1>
        
        <Button 
          onClick={testAI} 
          disabled={loading}
          className="mb-6"
        >
          {loading ? '生成中...' : '生成一日三餐'}
        </Button>

        {result && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">结果</h2>
            <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded">
              {JSON.stringify(result, null, 2)}
            </pre>
          </Card>
        )}
      </div>
    </div>
  )
}
