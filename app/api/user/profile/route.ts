import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        age: true,
        gender: true,
        height: true,
        weight: true,
        goal: true,
        activityLevel: true,
        dietType: true,
        allergies: true,
        dislikes: true,
      }
    })

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      profile: user
    })
  } catch (error: any) {
    console.error('获取用户资料失败:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const body = await request.json()

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: body.name,
        age: body.age,
        gender: body.gender,
        height: body.height,
        weight: body.weight,
        goal: body.goal,
        activityLevel: body.activityLevel,
        dietType: body.dietType,
        allergies: body.allergies || [],
        dislikes: body.dislikes || [],
      },
      select: {
        id: true,
        name: true,
        email: true,
        age: true,
        gender: true,
        height: true,
        weight: true,
        goal: true,
        activityLevel: true,
        dietType: true,
        allergies: true,
        dislikes: true,
      }
    })

    return NextResponse.json({
      success: true,
      profile: updatedUser
    })
  } catch (error: any) {
    console.error('更新用户资料失败:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
