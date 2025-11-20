import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { prisma } from '@/lib/prisma'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { messages, userId } = await request.json()

    const systemPrompt = `你是一位专业的饮食健身助手。

你只回答与以下主题相关的问题：
- 饮食营养（食谱、卡路里、营养搭配）
- 健身运动（运动建议、训练计划）
- 减肥增肌（目标设定、进度追踪）
- 食材选择和烹饪方法
- 健康生活方式

如果用户问题与这些主题无关，请礼貌地告知你只能回答饮食健身相关的问题。

回答要求：
1. 简洁明了，直接给出建议
2. 提供具体可行的方案
3. 关注用户的健康和安全`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      temperature: 0.7,
    })

    const aiMessage = response.choices[0].message.content

    if (userId) {
      await prisma.conversation.create({
        data: {
          userId,
          messages: [...messages, { role: 'assistant', content: aiMessage }]
        }
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: aiMessage 
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
