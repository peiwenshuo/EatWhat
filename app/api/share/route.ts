import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'

// 创建分享
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const body = await request.json()
    const { type, title, content, expiresInDays } = body

    if (!type || !title || !content) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    // 生成唯一的分享码
    const shareCode = nanoid(10)

    // 计算过期时间
    let expiresAt = null
    if (expiresInDays && expiresInDays > 0) {
      expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + expiresInDays)
    }

    // 创建分享记录
    const share = await prisma.share.create({
      data: {
        shareCode,
        userId: session.user.id,
        userName: session.user.name || session.user.email || '匿名用户',
        type,
        title,
        content: JSON.stringify(content),
        expiresAt
      }
    })

    return NextResponse.json({
      success: true,
      share: {
        id: share.id,
        shareCode: share.shareCode,
        shareUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3002'}/share/${share.shareCode}`
      }
    })
  } catch (error: any) {
    console.error('创建分享失败:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// 获取用户的分享列表
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const shares = await prisma.share.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        shareCode: true,
        type: true,
        title: true,
        viewCount: true,
        isPublic: true,
        expiresAt: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      success: true,
      shares
    })
  } catch (error: any) {
    console.error('获取分享列表失败:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// 删除分享
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const shareCode = searchParams.get('shareCode')

    if (!shareCode) {
      return NextResponse.json({ error: '缺少分享码' }, { status: 400 })
    }

    // 检查分享是否属于当前用户
    const share = await prisma.share.findUnique({
      where: { shareCode }
    })

    if (!share || share.userId !== session.user.id) {
      return NextResponse.json({ error: '无权删除此分享' }, { status: 403 })
    }

    await prisma.share.delete({
      where: { shareCode }
    })

    return NextResponse.json({
      success: true
    })
  } catch (error: any) {
    console.error('删除分享失败:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
