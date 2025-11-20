import { NextRequest, NextResponse } from 'next/server';
import { generateMealPlan } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      age,
      gender,
      height,
      weight,
      goal,
      dietaryRestrictions,
      activityLevel
    } = body;

    const mealPlan = await generateMealPlan({
      age,
      gender,
      height,
      weight,
      goal,
      dietaryRestrictions,
      activityLevel
    });

    return NextResponse.json({
      success: true,
      data: mealPlan
    });
  } catch (error) {
    console.error('Error in meal plan API:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate meal plan'
      },
      { status: 500 }
    );
  }
}

// GET 方法用于简单测试
export async function GET() {
  try {
    // 使用默认参数生成一个示例餐单
    const mealPlan = await generateMealPlan({
      age: 25,
      gender: '男',
      height: 175,
      weight: 70,
      goal: '增肌',
      activityLevel: '中等',
      dietaryRestrictions: []
    });

    return NextResponse.json({
      success: true,
      data: mealPlan,
      message: 'This is a demo meal plan with default parameters'
    });
  } catch (error) {
    console.error('Error in meal plan API:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate meal plan'
      },
      { status: 500 }
    );
  }
}
