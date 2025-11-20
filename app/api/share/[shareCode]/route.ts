import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareCode: string }> }
) {
  try {
    const { shareCode } = await params

    if (!shareCode) {
      return NextResponse.json({ error: '缺少分享码' }, { status: 400 })
    }

    // 查找分享记录
    const share = await prisma.share.findUnique({
      where: { shareCode }
    })

    if (!share) {
      return NextResponse.json({ error: '分享不存在' }, { status: 404 })
    }

    // 检查是否过期
    if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
      return NextResponse.json({ error: '分享已过期' }, { status: 410 })
    }

    // 检查是否公开
    if (!share.isPublic) {
      return NextResponse.json({ error: '分享已关闭' }, { status: 403 })
    }

    // 增加查看次数
    await prisma.share.update({
      where: { shareCode },
      data: {
        viewCount: {
          increment: 1
        }
      }
    })

    // 解析内容
    let parsedContent
    try {
      parsedContent = JSON.parse(share.content)
    } catch (e) {
      parsedContent = share.content
    }

    return NextResponse.json({
      success: true,
      share: {
        id: share.id,
        shareCode: share.shareCode,
        type: share.type,
        title: share.title,
        content: parsedContent,
        userName: share.userName,
        viewCount: share.viewCount + 1, // 返回更新后的数量
        createdAt: share.createdAt
      }
    })
  } catch (error: any) {
    console.error('获取分享内容失败:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
