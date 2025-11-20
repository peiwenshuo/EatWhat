import { NextRequest, NextResponse } from 'next/server';
import { generateWorkoutPlan } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      age,
      gender,
      height,
      weight,
      goal,
      activityLevel
    } = body;

    const workoutPlan = await generateWorkoutPlan({
      age,
      gender,
      height,
      weight,
      goal,
      activityLevel
    });

    return NextResponse.json({
      success: true,
      data: workoutPlan
    });
  } catch (error) {
    console.error('Error in workout plan API:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate workout plan'
      },
      { status: 500 }
    );
  }
}

// GET 方法用于简单测试
export async function GET() {
  try {
    // 使用默认参数生成一个示例训练计划
    const workoutPlan = await generateWorkoutPlan({
      age: 25,
      gender: '男',
      height: 175,
      weight: 70,
      goal: '增肌',
      activityLevel: '中等'
    });

    return NextResponse.json({
      success: true,
      data: workoutPlan,
      message: 'This is a demo workout plan with default parameters'
    });
  } catch (error) {
    console.error('Error in workout plan API:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate workout plan'
      },
      { status: 500 }
    );
  }
}
