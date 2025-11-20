import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface MealPlanParams {
  age?: number;
  gender?: string;
  height?: number;
  weight?: number;
  goal?: string;
  dietaryRestrictions?: string[];
  activityLevel?: string;
}

export async function generateMealPlan(params: MealPlanParams) {
  const {
    age,
    gender,
    height,
    weight,
    goal = '保持健康',
    dietaryRestrictions = [],
    activityLevel = '中等'
  } = params;

  const prompt = `作为一名专业的营养师，请为以下用户生成一份今日饮食计划：

用户信息：
${age ? `- 年龄: ${age}岁` : ''}
${gender ? `- 性别: ${gender}` : ''}
${height ? `- 身高: ${height}cm` : ''}
${weight ? `- 体重: ${weight}kg` : ''}
- 健身目标: ${goal}
- 活动水平: ${activityLevel}
${dietaryRestrictions.length > 0 ? `- 饮食限制: ${dietaryRestrictions.join(', ')}` : ''}

请生成一份详细的今日三餐计划，包括：
1. 早餐、午餐、晚餐的具体菜品
2. 每餐的大致热量
3. 营养搭配说明
4. 简单的制作建议

请以 JSON 格式返回，结构如下：
{
  "breakfast": {
    "name": "早餐名称",
    "items": ["食物1", "食物2"],
    "calories": 500,
    "notes": "营养说明"
  },
  "lunch": {
    "name": "午餐名称",
    "items": ["食物1", "食物2"],
    "calories": 700,
    "notes": "营养说明"
  },
  "dinner": {
    "name": "晚餐名称",
    "items": ["食物1", "食物2"],
    "calories": 600,
    "notes": "营养说明"
  },
  "totalCalories": 1800,
  "summary": "整体营养建议"
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: '你是一位专业的营养师和健身顾问，擅长根据用户的身体状况和目标提供个性化的饮食建议。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    return JSON.parse(content);
  } catch (error) {
    console.error('Error generating meal plan:', error);
    throw new Error('Failed to generate meal plan');
  }
}

export async function generateWorkoutPlan(params: MealPlanParams) {
  const {
    age,
    gender,
    height,
    weight,
    goal = '保持健康',
    activityLevel = '中等'
  } = params;

  const prompt = `作为一名专业的健身教练，请为以下用户生成一份今日训练计划：

用户信息：
${age ? `- 年龄: ${age}岁` : ''}
${gender ? `- 性别: ${gender}` : ''}
${height ? `- 身高: ${height}cm` : ''}
${weight ? `- 体重: ${weight}kg` : ''}
- 健身目标: ${goal}
- 当前活动水平: ${activityLevel}

请生成一份详细的今日训练计划，包括：
1. 热身运动
2. 主要训练项目（3-5个）
3. 每个项目的组数、次数或时长
4. 拉伸放松

请以 JSON 格式返回，结构如下：
{
  "warmup": {
    "exercises": [{"name": "运动名", "duration": "5分钟"}],
    "notes": "热身说明"
  },
  "mainWorkout": [
    {
      "name": "运动名称",
      "sets": 3,
      "reps": "12次",
      "rest": "60秒",
      "notes": "动作要领"
    }
  ],
  "cooldown": {
    "exercises": [{"name": "拉伸动作", "duration": "30秒"}],
    "notes": "放松说明"
  },
  "totalDuration": "45分钟",
  "difficulty": "中等",
  "summary": "训练总结和建议"
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: '你是一位经验丰富的健身教练，擅长根据用户的身体状况和目标制定科学有效的训练计划。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    return JSON.parse(content);
  } catch (error) {
    console.error('Error generating workout plan:', error);
    throw new Error('Failed to generate workout plan');
  }
}
