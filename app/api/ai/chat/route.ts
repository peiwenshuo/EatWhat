import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { openai } from '@/lib/openai'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { message, conversationId } = await request.json()

    if (!message) {
      return NextResponse.json({ error: '消息不能为空' }, { status: 400 })
    }

    // 获取用户资料
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        age: true,
        gender: true,
        height: true,
        weight: true,
        goal: true,
        activityLevel: true,
        dietType: true,
        allergies: true,
        dislikes: true,
      }
    })

    // 构建系统提示词
    const systemPrompt = `你是一位专业的营养师和健身顾问助手，专门帮助用户制定个性化的饮食和健身计划。

用户资料：
${user?.age ? `- 年龄: ${user.age}岁` : ''}
${user?.gender ? `- 性别: ${user.gender}` : ''}
${user?.height ? `- 身高: ${user.height}cm` : ''}
${user?.weight ? `- 体重: ${user.weight}kg` : ''}
${user?.goal ? `- 健身目标: ${user.goal}` : ''}
${user?.activityLevel ? `- 活动水平: ${user.activityLevel}` : ''}
${user?.dietType ? `- 饮食类型: ${user.dietType}` : ''}
${user?.allergies && user.allergies.length > 0 ? `- 过敏食物: ${user.allergies.join(', ')}` : ''}
${user?.dislikes && user.dislikes.length > 0 ? `- 不喜欢的食物: ${user.dislikes.join(', ')}` : ''}

请根据用户的个人资料，提供专业、详细、实用的建议。你的回答应该：
1. 具体、可执行，包含明确的食物名称、份量、时间等
2. 考虑用户的过敏和饮食偏好
3. 使用 Markdown 格式，让内容结构清晰、易读
4. 包含必要的营养说明和注意事项
5. 语气亲切专业，像一个真正的营养师在面对面交流`

    // 调用 GPT-4o
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', // 使用最新最强的 GPT-4o 模型
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })

    const aiResponse = completion.choices[0]?.message?.content

    if (!aiResponse) {
      throw new Error('AI 未返回响应')
    }

    // 保存对话记录到数据库
    let conversation
    if (conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId }
      })
    }

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          userId: session.user.id,
          title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
        }
      })
    }

    // 保存用户消息
    await prisma.conversationMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: message,
      }
    })

    // 保存 AI 回复
    await prisma.conversationMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: aiResponse,
      }
    })

    return NextResponse.json({
      success: true,
      response: aiResponse,
      conversationId: conversation.id
    })
  } catch (error: any) {
    console.error('AI 对话错误:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || '生成回复失败'
      },
      { status: 500 }
    )
  }
}
