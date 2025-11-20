import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // 测试数据库连接
    const userCount = await prisma.user.count()

    // 获取所有用户（不返回密码）
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
      take: 10,
    })

    return NextResponse.json({
      success: true,
      database: {
        connected: true,
        userCount,
        users,
      },
      env: {
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✅ 已设置' : '❌ 未设置',
        DATABASE_URL: process.env.DATABASE_URL ? '✅ 已设置' : '❌ 未设置',
        NODE_ENV: process.env.NODE_ENV,
      }
    })
  } catch (error: any) {
    console.error('[Debug] 数据库连接失败:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      database: {
        connected: false,
      },
      env: {
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✅ 已设置' : '❌ 未设置',
        DATABASE_URL: process.env.DATABASE_URL ? '✅ 已设置' : '❌ 未设置',
        NODE_ENV: process.env.NODE_ENV,
      }
    }, { status: 500 })
  }
}
