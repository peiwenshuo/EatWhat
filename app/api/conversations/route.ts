import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

// 获取用户的所有对话
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 50
    })

    return NextResponse.json({
      success: true,
      conversations
    })
  } catch (error: any) {
    console.error('获取对话历史失败:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
