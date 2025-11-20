import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'

// 获取用户的目标列表
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // active, completed, all

    const where: any = {
      userId: session.user.id
    }

    if (status && status !== 'all') {
      where.status = status
    }

    const goals = await prisma.fitnessGoal.findMany({
      where,
      orderBy: [
        { status: 'asc' }, // active first
        { targetDate: 'asc' }
      ]
    })

    // 计算统计数据
    const activeGoals = goals.filter(g => g.status === 'active')
    const completedGoals = goals.filter(g => g.status === 'completed')
    const avgProgress = activeGoals.length > 0
      ? activeGoals.reduce((sum, g) => sum + g.progress, 0) / activeGoals.length
      : 0

    return NextResponse.json({
      success: true,
      goals,
      stats: {
        total: goals.length,
        active: activeGoals.length,
        completed: completedGoals.length,
        avgProgress: Math.round(avgProgress)
      }
    })
  } catch (error: any) {
    console.error('获取目标列表失败:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// 创建新目标
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const body = await request.json()
    const {
      type,
      title,
      description,
      targetValue,
      currentValue,
      unit,
      startDate,
      targetDate,
      milestones,
      notes
    } = body

    if (!type || !title || !targetValue || !unit || !targetDate) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    const goal = await prisma.fitnessGoal.create({
      data: {
        userId: session.user.id,
        type,
        title,
        description: description || null,
        targetValue,
        currentValue: currentValue || null,
        unit,
        startDate: startDate ? new Date(startDate) : new Date(),
        targetDate: new Date(targetDate),
        milestones: milestones || null,
        notes: notes || null
      }
    })

    return NextResponse.json({
      success: true,
      goal
    })
  } catch (error: any) {
    console.error('创建目标失败:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// 更新目标
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: '缺少目标ID' }, { status: 400 })
    }

    // 检查目标是否属于当前用户
    const existingGoal = await prisma.fitnessGoal.findUnique({
      where: { id }
    })

    if (!existingGoal || existingGoal.userId !== session.user.id) {
      return NextResponse.json({ error: '目标不存在' }, { status: 404 })
    }

    // 计算进度
    let progress = existingGoal.progress
    if (updateData.currentValue !== undefined && updateData.targetValue !== undefined) {
      const current = updateData.currentValue
      const target = updateData.targetValue
      const start = existingGoal.currentValue || 0

      if (existingGoal.type === 'weight_loss') {
        // 减重：当前值越小，进度越高
        progress = Math.max(0, Math.min(100, ((start - current) / (start - target)) * 100))
      } else {
        // 增肌、力量等：当前值越大，进度越高
        progress = Math.max(0, Math.min(100, ((current - start) / (target - start)) * 100))
      }
    }

    // 如果状态变为completed，设置完成时间
    if (updateData.status === 'completed' && !existingGoal.completedAt) {
      updateData.completedAt = new Date()
      updateData.progress = 100
    }

    const goal = await prisma.fitnessGoal.update({
      where: { id },
      data: {
        ...updateData,
        progress: updateData.progress !== undefined ? updateData.progress : progress,
        targetDate: updateData.targetDate ? new Date(updateData.targetDate) : undefined
      }
    })

    return NextResponse.json({
      success: true,
      goal
    })
  } catch (error: any) {
    console.error('更新目标失败:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// 删除目标
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: '缺少目标ID' }, { status: 400 })
    }

    const goal = await prisma.fitnessGoal.findUnique({
      where: { id }
    })

    if (!goal || goal.userId !== session.user.id) {
      return NextResponse.json({ error: '目标不存在' }, { status: 404 })
    }

    await prisma.fitnessGoal.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true
    })
  } catch (error: any) {
    console.error('删除目标失败:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
