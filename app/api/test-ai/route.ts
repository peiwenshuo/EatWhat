import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const targetCalories = body.targetCalories || 2000

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: '你是营养师，生成简单的一日三餐建议'
        },
        {
          role: 'user',
          content: `生成目标${targetCalories}卡路里的一日三餐。返回JSON格式`
        }
      ],
      response_format: { type: 'json_object' },
    })

    const result = JSON.parse(response.choices[0].message.content || '{}')
    
    return NextResponse.json({ success: true, meals: result })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
