import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import { startOfDay, endOfDay, subDays } from 'date-fns'

// 获取训练记录
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    const startDate = subDays(new Date(), days)

    const records = await prisma.workoutLog.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: startDate
        }
      },
      orderBy: {
        date: 'desc'
      }
    })

    // 计算统计数据
    const totalWorkouts = records.length
    const totalDuration = records.reduce((sum, r) => sum + (r.duration || 0), 0)
    const totalCalories = records.reduce((sum, r) => sum + (r.caloriesBurned || 0), 0)
    const avgDuration = totalWorkouts > 0 ? totalDuration / totalWorkouts : 0
    const avgCalories = totalWorkouts > 0 ? totalCalories / totalWorkouts : 0

    // 按类型统计
    const typeStats = records.reduce((acc, r) => {
      const type = r.exerciseType || '其他'
      if (!acc[type]) {
        acc[type] = { count: 0, duration: 0, calories: 0 }
      }
      acc[type].count++
      acc[type].duration += r.duration || 0
      acc[type].calories += r.caloriesBurned || 0
      return acc
    }, {} as Record<string, { count: number; duration: number; calories: number }>)

    const stats = {
      totalWorkouts,
      totalDuration,
      totalCalories,
      avgDuration,
      avgCalories,
      typeStats
    }

    return NextResponse.json({
      success: true,
      records,
      stats
    })
  } catch (error: any) {
    console.error('获取训练记录失败:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// 添加训练记录
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const body = await request.json()
    const { date, exerciseType, exerciseName, duration, distance, sets, reps, weight, caloriesBurned, notes, imageUrl } = body

    if (!exerciseType || !exerciseName) {
      return NextResponse.json({ error: '训练类型和名称不能为空' }, { status: 400 })
    }

    // 创建新记录
    const recordDate = date ? new Date(date) : new Date()
    const record = await prisma.workoutLog.create({
      data: {
        userId: session.user.id,
        date: recordDate,
        exerciseType,
        exerciseName,
        duration: duration || null,
        distance: distance || null,
        sets: sets || null,
        reps: reps || null,
        weight: weight || null,
        caloriesBurned: caloriesBurned || null,
        notes: notes || null,
        imageUrl: imageUrl || null
      }
    })

    return NextResponse.json({
      success: true,
      record
    })
  } catch (error: any) {
    console.error('添加训练记录失败:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// 删除训练记录
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: '缺少记录 ID' }, { status: 400 })
    }

    const record = await prisma.workoutLog.findUnique({
      where: { id }
    })

    if (!record || record.userId !== session.user.id) {
      return NextResponse.json({ error: '记录不存在' }, { status: 404 })
    }

    await prisma.workoutLog.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true
    })
  } catch (error: any) {
    console.error('删除训练记录失败:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
