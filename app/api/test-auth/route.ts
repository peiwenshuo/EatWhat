import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // 测试数据库连接
    const userCount = await prisma.user.count()

    return NextResponse.json({
      success: true,
      message: 'Database connection OK',
      userCount,
      env: {
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        nextAuthUrl: process.env.NEXTAUTH_URL,
        nodeEnv: process.env.NODE_ENV
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
