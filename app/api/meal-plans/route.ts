import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'

// 获取用户的所有饮食计划
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const savedDietPlans = await prisma.savedDietPlan.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50 // 最多返回50条
    })

    return NextResponse.json({
      success: true,
      mealPlans: savedDietPlans
    })
  } catch (error: any) {
    console.error('获取饮食计划失败:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// 保存新的饮食计划
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const body = await request.json()
    const { date, content, source } = body

    if (!content) {
      return NextResponse.json({ error: '计划内容不能为空' }, { status: 400 })
    }

    const savedDietPlan = await prisma.savedDietPlan.create({
      data: {
        userId: session.user.id,
        date: date ? new Date(date) : new Date(),
        content,
        source: source || 'ai'
      }
    })

    return NextResponse.json({
      success: true,
      mealPlan: savedDietPlan
    })
  } catch (error: any) {
    console.error('保存饮食计划失败:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
