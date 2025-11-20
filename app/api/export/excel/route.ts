import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'
import { format } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all' // all, weight, workout, food
    const days = parseInt(searchParams.get('days') || '30')

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // 创建工作簿
    const workbook = XLSX.utils.book_new()

    // 导出体重数据
    if (type === 'all' || type === 'weight') {
      const weightRecords = await prisma.bodyRecord.findMany({
        where: {
          userId: session.user.id,
          date: { gte: startDate }
        },
        orderBy: { date: 'desc' }
      })

      const weightData = weightRecords.map(record => ({
        '日期': format(new Date(record.date), 'yyyy-MM-dd'),
        '体重(kg)': record.weight,
        '体脂率(%)': record.bodyFat || '-',
        '肌肉量(kg)': record.muscle || '-',
        '备注': record.notes || '-'
      }))

      const weightSheet = XLSX.utils.json_to_sheet(weightData)
      XLSX.utils.book_append_sheet(workbook, weightSheet, '体重记录')
    }

    // 导出训练数据
    if (type === 'all' || type === 'workout') {
      const workoutRecords = await prisma.workoutLog.findMany({
        where: {
          userId: session.user.id,
          date: { gte: startDate }
        },
        orderBy: { date: 'desc' }
      })

      const workoutData = workoutRecords.map(record => ({
        '日期': format(new Date(record.date), 'yyyy-MM-dd'),
        '运动类型': record.exerciseType,
        '运动名称': record.exerciseName,
        '时长(分钟)': record.duration || '-',
        '距离(km)': record.distance || '-',
        '组数': record.sets || '-',
        '次数': record.reps || '-',
        '重量(kg)': record.weight || '-',
        '消耗卡路里': record.caloriesBurned || '-',
        '备注': record.notes || '-'
      }))

      const workoutSheet = XLSX.utils.json_to_sheet(workoutData)
      XLSX.utils.book_append_sheet(workbook, workoutSheet, '训练记录')
    }

    // 导出饮食数据
    if (type === 'all' || type === 'food') {
      const foodRecords = await prisma.foodLog.findMany({
        where: {
          userId: session.user.id,
          date: { gte: startDate }
        },
        orderBy: { date: 'desc' }
      })

      const foodData = foodRecords.map(record => ({
        '日期': format(new Date(record.date), 'yyyy-MM-dd'),
        '时间': format(new Date(record.time), 'HH:mm'),
        '餐次': record.mealType,
        '食物': record.foodName,
        '份量': record.portion,
        '卡路里': record.calories,
        '蛋白质(g)': record.protein || '-',
        '碳水化合物(g)': record.carbs || '-',
        '脂肪(g)': record.fat || '-',
        '备注': record.notes || '-'
      }))

      const foodSheet = XLSX.utils.json_to_sheet(foodData)
      XLSX.utils.book_append_sheet(workbook, foodSheet, '饮食记录')
    }

    // 生成Excel文件
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    // 返回文件
    const fileName = `健康数据_${format(new Date(), 'yyyy-MM-dd')}.xlsx`

    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`
      }
    })
  } catch (error: any) {
    console.error('导出Excel失败:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
