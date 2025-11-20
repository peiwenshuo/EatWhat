import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
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
      const type = r.type || '其他'
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
    const { date, type, exercises, duration, caloriesBurned, intensity, notes } = body

    if (!type || !exercises) {
      return NextResponse.json({ error: '训练类型和内容不能为空' }, { status: 400 })
    }

    // 检查当天是否已有相同类型的记录
    const recordDate = date ? new Date(date) : new Date()
    const existingRecord = await prisma.workoutLog.findFirst({
      where: {
        userId: session.user.id,
        type,
        date: {
          gte: startOfDay(recordDate),
          lte: endOfDay(recordDate)
        }
      }
    })

    let record
    if (existingRecord) {
      // 更新现有记录
      record = await prisma.workoutLog.update({
        where: { id: existingRecord.id },
        data: {
          exercises,
          duration: duration || null,
          caloriesBurned: caloriesBurned || null,
          intensity: intensity || null,
          notes: notes || null
        }
      })
    } else {
      // 创建新记录
      record = await prisma.workoutLog.create({
        data: {
          userId: session.user.id,
          date: recordDate,
          type,
          exercises,
          duration: duration || null,
          caloriesBurned: caloriesBurned || null,
          intensity: intensity || null,
          notes: notes || null
        }
      })
    }

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
