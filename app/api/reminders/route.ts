import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

// GET - 获取用户的提醒列表
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const enabled = searchParams.get('enabled')

    const where: any = {
      userId: session.user.id
    }

    if (type) {
      where.type = type
    }

    if (enabled !== null) {
      where.enabled = enabled === 'true'
    }

    const reminders = await prisma.reminder.findMany({
      where,
      orderBy: [
        { enabled: 'desc' },
        { time: 'asc' }
      ]
    })

    return NextResponse.json({
      success: true,
      reminders
    })
  } catch (error: any) {
    console.error('获取提醒失败:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// POST - 创建新提醒
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const body = await request.json()
    const { type, title, message, time, frequency, daysOfWeek } = body

    if (!type || !title || !time || !frequency) {
      return NextResponse.json(
        { error: '缺少必填字段' },
        { status: 400 }
      )
    }

    // 验证时间格式 (HH:mm)
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(time)) {
      return NextResponse.json(
        { error: '时间格式不正确，应为 HH:mm' },
        { status: 400 }
      )
    }

    // 验证星期几格式
    if (daysOfWeek && !Array.isArray(daysOfWeek)) {
      return NextResponse.json(
        { error: 'daysOfWeek 必须是数组' },
        { status: 400 }
      )
    }

    const reminder = await prisma.reminder.create({
      data: {
        userId: session.user.id,
        type,
        title,
        message: message || null,
        time,
        frequency,
        daysOfWeek: daysOfWeek || [],
        enabled: true
      }
    })

    return NextResponse.json({
      success: true,
      reminder
    })
  } catch (error: any) {
    console.error('创建提醒失败:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// PUT - 更新提醒
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: '缺少提醒 ID' },
        { status: 400 }
      )
    }

    const body = await request.json()

    // 验证提醒是否属于当前用户
    const existingReminder = await prisma.reminder.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!existingReminder) {
      return NextResponse.json(
        { error: '提醒不存在或无权限' },
        { status: 404 }
      )
    }

    // 如果更新时间，验证格式
    if (body.time) {
      const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/
      if (!timeRegex.test(body.time)) {
        return NextResponse.json(
          { error: '时间格式不正确，应为 HH:mm' },
          { status: 400 }
        )
      }
    }

    const updateData: any = {}

    if (body.type !== undefined) updateData.type = body.type
    if (body.title !== undefined) updateData.title = body.title
    if (body.message !== undefined) updateData.message = body.message
    if (body.time !== undefined) updateData.time = body.time
    if (body.frequency !== undefined) updateData.frequency = body.frequency
    if (body.daysOfWeek !== undefined) updateData.daysOfWeek = body.daysOfWeek
    if (body.enabled !== undefined) updateData.enabled = body.enabled

    const reminder = await prisma.reminder.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      reminder
    })
  } catch (error: any) {
    console.error('更新提醒失败:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// DELETE - 删除提醒
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: '缺少提醒 ID' },
        { status: 400 }
      )
    }

    // 验证提醒是否属于当前用户
    const existingReminder = await prisma.reminder.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!existingReminder) {
      return NextResponse.json(
        { error: '提醒不存在或无权限' },
        { status: 404 }
      )
    }

    await prisma.reminder.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: '提醒已删除'
    })
  } catch (error: any) {
    console.error('删除提醒失败:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
