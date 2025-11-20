import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 仅用于开发环境清理测试数据
export async function DELETE() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: '此操作仅在开发环境可用' },
      { status: 403 }
    )
  }

  try {
    // 删除所有用户
    const result = await prisma.user.deleteMany({})

    return NextResponse.json({
      success: true,
      message: `已删除 ${result.count} 个用户`,
      count: result.count
    })
  } catch (error: any) {
    console.error('清理用户失败:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// 获取所有用户列表
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      users: users,
      count: users.length
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
