'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function TestAIPage() {
  const [mealPlan, setMealPlan] = useState<any>(null)
  const [workoutPlan, setWorkoutPlan] = useState<any>(null)
  const [loadingMeal, setLoadingMeal] = useState(false)
  const [loadingWorkout, setLoadingWorkout] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    age: 25,
    gender: '男',
    height: 175,
    weight: 70,
    goal: '增肌',
    activityLevel: '中等'
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' || name === 'height' || name === 'weight'
        ? parseInt(value) || 0
        : value
    }))
  }

  const generateMealPlan = async () => {
    setLoadingMeal(true)
    setError('')
    setMealPlan(null)

    try {
      const response = await fetch('/api/ai/meal-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        setMealPlan(data.data)
      } else {
        setError(data.error || '生成失败')
      }
    } catch (err) {
      setError('请求失败，请检查网络连接')
    } finally {
      setLoadingMeal(false)
    }
  }

  const generateWorkoutPlan = async () => {
    setLoadingWorkout(true)
    setError('')
    setWorkoutPlan(null)

    try {
      const response = await fetch('/api/ai/workout-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        setWorkoutPlan(data.data)
      } else {
        setError(data.error || '生成失败')
      }
    } catch (err) {
      setError('请求失败，请检查网络连接')
    } finally {
      setLoadingWorkout(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI 功能测试</h1>
          <p className="text-gray-600">测试 OpenAI API 生成饮食和训练计划</p>
        </div>

        {/* 用户信息表单 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">用户信息</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                年龄
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                性别
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="男">男</option>
                <option value="女">女</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                身高 (cm)
              </label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                体重 (kg)
              </label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                健身目标
              </label>
              <select
                name="goal"
                value={formData.goal}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="减脂">减脂</option>
                <option value="增肌">增肌</option>
                <option value="保持健康">保持健康</option>
                <option value="提高体能">提高体能</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                活动水平
              </label>
              <select
                name="activityLevel"
                value={formData.activityLevel}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="久坐">久坐</option>
                <option value="轻度活动">轻度活动</option>
                <option value="中等">中等</option>
                <option value="高强度">高强度</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <Button
              onClick={generateMealPlan}
              disabled={loadingMeal}
              className="flex-1"
            >
              {loadingMeal ? '生成中...' : '生成饮食计划'}
            </Button>

            <Button
              onClick={generateWorkoutPlan}
              disabled={loadingWorkout}
              className="flex-1"
              variant="outline"
            >
              {loadingWorkout ? '生成中...' : '生成训练计划'}
            </Button>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 饮食计划显示 */}
          {mealPlan && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">今日饮食计划</h2>

              {mealPlan.breakfast && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-orange-600 mb-2">早餐</h3>
                  <p className="font-medium">{mealPlan.breakfast.name}</p>
                  <ul className="list-disc list-inside text-gray-700 mt-2">
                    {mealPlan.breakfast.items?.map((item: string, idx: number) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                  <p className="text-sm text-gray-600 mt-2">
                    热量: {mealPlan.breakfast.calories} 卡
                  </p>
                  {mealPlan.breakfast.notes && (
                    <p className="text-sm text-gray-500 mt-1">{mealPlan.breakfast.notes}</p>
                  )}
                </div>
              )}

              {mealPlan.lunch && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-green-600 mb-2">午餐</h3>
                  <p className="font-medium">{mealPlan.lunch.name}</p>
                  <ul className="list-disc list-inside text-gray-700 mt-2">
                    {mealPlan.lunch.items?.map((item: string, idx: number) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                  <p className="text-sm text-gray-600 mt-2">
                    热量: {mealPlan.lunch.calories} 卡
                  </p>
                  {mealPlan.lunch.notes && (
                    <p className="text-sm text-gray-500 mt-1">{mealPlan.lunch.notes}</p>
                  )}
                </div>
              )}

              {mealPlan.dinner && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-blue-600 mb-2">晚餐</h3>
                  <p className="font-medium">{mealPlan.dinner.name}</p>
                  <ul className="list-disc list-inside text-gray-700 mt-2">
                    {mealPlan.dinner.items?.map((item: string, idx: number) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                  <p className="text-sm text-gray-600 mt-2">
                    热量: {mealPlan.dinner.calories} 卡
                  </p>
                  {mealPlan.dinner.notes && (
                    <p className="text-sm text-gray-500 mt-1">{mealPlan.dinner.notes}</p>
                  )}
                </div>
              )}

              {mealPlan.totalCalories && (
                <div className="border-t pt-4">
                  <p className="font-semibold">
                    全天总热量: {mealPlan.totalCalories} 卡
                  </p>
                  {mealPlan.summary && (
                    <p className="text-sm text-gray-600 mt-2">{mealPlan.summary}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 训练计划显示 */}
          {workoutPlan && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">今日训练计划</h2>

              {workoutPlan.warmup && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-yellow-600 mb-2">热身</h3>
                  <ul className="space-y-2">
                    {workoutPlan.warmup.exercises?.map((ex: any, idx: number) => (
                      <li key={idx} className="text-gray-700">
                        {ex.name} - {ex.duration}
                      </li>
                    ))}
                  </ul>
                  {workoutPlan.warmup.notes && (
                    <p className="text-sm text-gray-500 mt-2">{workoutPlan.warmup.notes}</p>
                  )}
                </div>
              )}

              {workoutPlan.mainWorkout && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-red-600 mb-2">主要训练</h3>
                  <div className="space-y-4">
                    {workoutPlan.mainWorkout.map((exercise: any, idx: number) => (
                      <div key={idx} className="border-l-4 border-red-400 pl-4">
                        <p className="font-medium">{exercise.name}</p>
                        <p className="text-sm text-gray-600">
                          {exercise.sets} 组 × {exercise.reps}
                          {exercise.rest && ` | 休息: ${exercise.rest}`}
                        </p>
                        {exercise.notes && (
                          <p className="text-sm text-gray-500 mt-1">{exercise.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {workoutPlan.cooldown && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-blue-600 mb-2">拉伸放松</h3>
                  <ul className="space-y-2">
                    {workoutPlan.cooldown.exercises?.map((ex: any, idx: number) => (
                      <li key={idx} className="text-gray-700">
                        {ex.name} - {ex.duration}
                      </li>
                    ))}
                  </ul>
                  {workoutPlan.cooldown.notes && (
                    <p className="text-sm text-gray-500 mt-2">{workoutPlan.cooldown.notes}</p>
                  )}
                </div>
              )}

              <div className="border-t pt-4">
                {workoutPlan.totalDuration && (
                  <p className="font-semibold">总时长: {workoutPlan.totalDuration}</p>
                )}
                {workoutPlan.difficulty && (
                  <p className="text-sm text-gray-600">难度: {workoutPlan.difficulty}</p>
                )}
                {workoutPlan.summary && (
                  <p className="text-sm text-gray-600 mt-2">{workoutPlan.summary}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
