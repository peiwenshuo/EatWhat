import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { startOfDay, endOfDay, subDays } from 'date-fns'

// 获取体重记录
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    const startDate = subDays(new Date(), days)

    const records = await prisma.bodyRecord.findMany({
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
    const weights = records.map(r => r.weight)
    const stats = {
      current: records[0]?.weight || null,
      average: weights.length > 0 ? weights.reduce((a, b) => a + b) / weights.length : null,
      max: weights.length > 0 ? Math.max(...weights) : null,
      min: weights.length > 0 ? Math.min(...weights) : null,
      change: records.length >= 2 ? records[0].weight - records[records.length - 1].weight : null,
      changePercent: records.length >= 2
        ? ((records[0].weight - records[records.length - 1].weight) / records[records.length - 1].weight * 100)
        : null
    }

    return NextResponse.json({
      success: true,
      records,
      stats
    })
  } catch (error: any) {
    console.error('获取体重记录失败:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// 添加体重记录
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const body = await request.json()
    const { date, weight, bodyFat, muscleMass, notes } = body

    if (!weight || weight <= 0) {
      return NextResponse.json({ error: '体重数据无效' }, { status: 400 })
    }

    // 检查当天是否已有记录
    const recordDate = date ? new Date(date) : new Date()
    const existingRecord = await prisma.bodyRecord.findFirst({
      where: {
        userId: session.user.id,
        date: {
          gte: startOfDay(recordDate),
          lte: endOfDay(recordDate)
        }
      }
    })

    let record
    if (existingRecord) {
      // 更新现有记录
      record = await prisma.bodyRecord.update({
        where: { id: existingRecord.id },
        data: {
          weight,
          bodyFat: bodyFat || null,
          muscle: muscleMass || null,
          notes: notes || null
        }
      })
    } else {
      // 创建新记录
      record = await prisma.bodyRecord.create({
        data: {
          userId: session.user.id,
          date: recordDate,
          weight,
          bodyFat: bodyFat || null,
          muscle: muscleMass || null,
          notes: notes || null
        }
      })
    }

    // 同时更新用户的体重字段
    await prisma.user.update({
      where: { id: session.user.id },
      data: { weight }
    })

    return NextResponse.json({
      success: true,
      record
    })
  } catch (error: any) {
    console.error('添加体重记录失败:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// 删除体重记录
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

    const record = await prisma.bodyRecord.findUnique({
      where: { id }
    })

    if (!record || record.userId !== session.user.id) {
      return NextResponse.json({ error: '记录不存在' }, { status: 404 })
    }

    await prisma.bodyRecord.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true
    })
  } catch (error: any) {
    console.error('删除体重记录失败:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
