import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { startOfDay, endOfDay, subDays } from 'date-fns'

// 获取饮食记录
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    const startDate = subDays(new Date(), days)

    const records = await prisma.foodLog.findMany({
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
    const totalMeals = records.length
    const totalCalories = records.reduce((sum, r) => sum + (r.calories || 0), 0)
    const totalProtein = records.reduce((sum, r) => sum + (r.protein || 0), 0)
    const totalCarbs = records.reduce((sum, r) => sum + (r.carbs || 0), 0)
    const totalFat = records.reduce((sum, r) => sum + (r.fat || 0), 0)

    const avgCalories = totalMeals > 0 ? totalCalories / totalMeals : 0
    const avgProtein = totalMeals > 0 ? totalProtein / totalMeals : 0
    const avgCarbs = totalMeals > 0 ? totalCarbs / totalMeals : 0
    const avgFat = totalMeals > 0 ? totalFat / totalMeals : 0

    // 按餐次统计
    const mealTypeStats = records.reduce((acc, r) => {
      const type = r.mealType || '其他'
      if (!acc[type]) {
        acc[type] = { count: 0, calories: 0 }
      }
      acc[type].count++
      acc[type].calories += r.calories || 0
      return acc
    }, {} as Record<string, { count: number; calories: number }>)

    const stats = {
      totalMeals,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      avgCalories,
      avgProtein,
      avgCarbs,
      avgFat,
      mealTypeStats
    }

    return NextResponse.json({
      success: true,
      records,
      stats
    })
  } catch (error: any) {
    console.error('获取饮食记录失败:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// 添加饮食记录
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const body = await request.json()
    const { date, mealType, foods, calories, protein, carbs, fat, notes } = body

    if (!mealType || !foods) {
      return NextResponse.json({ error: '餐次和食物不能为空' }, { status: 400 })
    }

    // 检查当天是否已有相同餐次的记录
    const recordDate = date ? new Date(date) : new Date()
    const existingRecord = await prisma.foodLog.findFirst({
      where: {
        userId: session.user.id,
        mealType,
        date: {
          gte: startOfDay(recordDate),
          lte: endOfDay(recordDate)
        }
      }
    })

    let record
    if (existingRecord) {
      // 更新现有记录
      record = await prisma.foodLog.update({
        where: { id: existingRecord.id },
        data: {
          foods,
          calories: calories || null,
          protein: protein || null,
          carbs: carbs || null,
          fat: fat || null,
          notes: notes || null
        }
      })
    } else {
      // 创建新记录
      record = await prisma.foodLog.create({
        data: {
          userId: session.user.id,
          date: recordDate,
          mealType,
          foods,
          calories: calories || null,
          protein: protein || null,
          carbs: carbs || null,
          fat: fat || null,
          notes: notes || null
        }
      })
    }

    return NextResponse.json({
      success: true,
      record
    })
  } catch (error: any) {
    console.error('添加饮食记录失败:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// 删除饮食记录
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

    const record = await prisma.foodLog.findUnique({
      where: { id }
    })

    if (!record || record.userId !== session.user.id) {
      return NextResponse.json({ error: '记录不存在' }, { status: 404 })
    }

    await prisma.foodLog.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true
    })
  } catch (error: any) {
    console.error('删除饮食记录失败:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
