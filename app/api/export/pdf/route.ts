import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'

// 添加中文字体支持（使用默认字体）
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // 创建PDF文档
    const doc = new jsPDF()

    // 设置标题
    doc.setFontSize(20)
    doc.text('Health Data Report', 105, 15, { align: 'center' })

    doc.setFontSize(12)
    doc.text(`User: ${session.user.name || session.user.email}`, 14, 25)
    doc.text(`Date: ${format(new Date(), 'yyyy-MM-dd')}`, 14, 32)
    doc.text(`Period: Last ${days} days`, 14, 39)

    let yPosition = 50

    // 体重数据
    const weightRecords = await prisma.bodyRecord.findMany({
      where: {
        userId: session.user.id,
        date: { gte: startDate }
      },
      orderBy: { date: 'desc' },
      take: 20 // 限制数量避免PDF过大
    })

    if (weightRecords.length > 0) {
      doc.setFontSize(14)
      doc.text('Weight Records', 14, yPosition)
      yPosition += 7

      const weightData = weightRecords.map(record => [
        format(new Date(record.date), 'yyyy-MM-dd'),
        record.weight.toFixed(1),
        record.bodyFat ? record.bodyFat.toFixed(1) : '-',
        record.muscle ? record.muscle.toFixed(1) : '-'
      ])

      autoTable(doc, {
        startY: yPosition,
        head: [['Date', 'Weight(kg)', 'Body Fat(%)', 'Muscle(kg)']],
        body: weightData,
        theme: 'grid',
        headStyles: { fillColor: [66, 139, 202] },
        margin: { left: 14 }
      })

      yPosition = (doc as any).lastAutoTable.finalY + 10
    }

    // 训练数据
    if (yPosition > 250) {
      doc.addPage()
      yPosition = 20
    }

    const workoutRecords = await prisma.workoutLog.findMany({
      where: {
        userId: session.user.id,
        date: { gte: startDate }
      },
      orderBy: { date: 'desc' },
      take: 20
    })

    if (workoutRecords.length > 0) {
      doc.setFontSize(14)
      doc.text('Workout Records', 14, yPosition)
      yPosition += 7

      const workoutData = workoutRecords.map(record => [
        format(new Date(record.date), 'yyyy-MM-dd'),
        record.exerciseName,
        record.duration ? `${record.duration}min` : '-',
        record.caloriesBurned || '-'
      ])

      autoTable(doc, {
        startY: yPosition,
        head: [['Date', 'Exercise', 'Duration', 'Calories']],
        body: workoutData,
        theme: 'grid',
        headStyles: { fillColor: [92, 184, 92] },
        margin: { left: 14 }
      })

      yPosition = (doc as any).lastAutoTable.finalY + 10
    }

    // 饮食数据
    if (yPosition > 250) {
      doc.addPage()
      yPosition = 20
    }

    const foodRecords = await prisma.foodLog.findMany({
      where: {
        userId: session.user.id,
        date: { gte: startDate }
      },
      orderBy: { date: 'desc' },
      take: 20
    })

    if (foodRecords.length > 0) {
      doc.setFontSize(14)
      doc.text('Food Records', 14, yPosition)
      yPosition += 7

      const foodData = foodRecords.map(record => [
        format(new Date(record.date), 'yyyy-MM-dd'),
        record.mealType,
        record.foodName,
        record.calories.toString()
      ])

      autoTable(doc, {
        startY: yPosition,
        head: [['Date', 'Meal', 'Food', 'Calories']],
        body: foodData,
        theme: 'grid',
        headStyles: { fillColor: [240, 173, 78] },
        margin: { left: 14 }
      })
    }

    // 生成PDF
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

    // 返回文件
    const fileName = `Health_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`
      }
    })
  } catch (error: any) {
    console.error('导出PDF失败:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
