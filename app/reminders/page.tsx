'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  Plus,
  Bell,
  Clock,
  Calendar,
  Trash2,
  Edit,
  Power,
  Weight,
  Dumbbell,
  UtensilsCrossed,
  Droplets,
  Moon,
  BellRing,
  AlertCircle
} from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'

interface Reminder {
  id: string
  type: string
  title: string
  message: string | null
  time: string
  frequency: string
  daysOfWeek: string[]
  enabled: boolean
  lastSentAt: string | null
  createdAt: string
}

export default function RemindersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { permission, requestPermission, startReminderCheck, hasPermission, isSupported } = useNotifications()
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null)

  // 表单状态
  const [formData, setFormData] = useState({
    type: 'weight',
    title: '',
    message: '',
    time: '09:00',
    frequency: 'daily',
    daysOfWeek: [] as string[]
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      loadReminders()
      // 启动提醒检查
      const cleanup = startReminderCheck()
      return cleanup
    }
  }, [status, router, startReminderCheck])

  const loadReminders = async () => {
    try {
      const response = await fetch('/api/reminders')
      const data = await response.json()

      if (data.success) {
        setReminders(data.reminders)
      }
    } catch (error) {
      console.error('加载提醒失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const getReminderIcon = (type: string) => {
    switch (type) {
      case 'weight':
        return <Weight className="w-5 h-5" />
      case 'workout':
        return <Dumbbell className="w-5 h-5" />
      case 'food':
        return <UtensilsCrossed className="w-5 h-5" />
      case 'water':
        return <Droplets className="w-5 h-5" />
      case 'sleep':
        return <Moon className="w-5 h-5" />
      default:
        return <Bell className="w-5 h-5" />
    }
  }

  const getReminderTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      weight: '体重记录',
      workout: '运动打卡',
      food: '饮食记录',
      water: '喝水提醒',
      sleep: '睡眠提醒'
    }
    return labels[type] || type
  }

  const getFrequencyLabel = (frequency: string) => {
    const labels: Record<string, string> = {
      daily: '每天',
      weekly: '每周',
      weekdays: '工作日',
      weekends: '周末'
    }
    return labels[frequency] || frequency
  }

  const getDaysLabel = (daysOfWeek: string[]) => {
    if (daysOfWeek.length === 0) return ''
    const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return daysOfWeek.map(d => dayNames[parseInt(d)]).join('、')
  }

  const handleCreateReminder = async () => {
    try {
      const response = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        setShowCreateDialog(false)
        resetForm()
        loadReminders()
      } else {
        alert(data.error || '创建失败')
      }
    } catch (error) {
      console.error('创建提醒失败:', error)
      alert('创建失败')
    }
  }

  const handleUpdateReminder = async () => {
    if (!editingReminder) return

    try {
      const response = await fetch(`/api/reminders?id=${editingReminder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        setEditingReminder(null)
        resetForm()
        loadReminders()
      } else {
        alert(data.error || '更新失败')
      }
    } catch (error) {
      console.error('更新提醒失败:', error)
      alert('更新失败')
    }
  }

  const toggleReminder = async (id: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/reminders?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !enabled })
      })

      const data = await response.json()

      if (data.success) {
        loadReminders()
      }
    } catch (error) {
      console.error('切换提醒失败:', error)
    }
  }

  const deleteReminder = async (id: string) => {
    if (!confirm('确定要删除这个提醒吗？')) return

    try {
      const response = await fetch(`/api/reminders?id=${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        loadReminders()
      }
    } catch (error) {
      console.error('删除提醒失败:', error)
    }
  }

  const openEditDialog = (reminder: Reminder) => {
    setEditingReminder(reminder)
    setFormData({
      type: reminder.type,
      title: reminder.title,
      message: reminder.message || '',
      time: reminder.time,
      frequency: reminder.frequency,
      daysOfWeek: reminder.daysOfWeek
    })
    setShowCreateDialog(true)
  }

  const resetForm = () => {
    setFormData({
      type: 'weight',
      title: '',
      message: '',
      time: '09:00',
      frequency: 'daily',
      daysOfWeek: []
    })
  }

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter(d => d !== day)
        : [...prev.daysOfWeek, day]
    }))
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">提醒设置</h1>
            <p className="text-muted-foreground mt-2">管理你的健康提醒</p>
          </div>
          <div className="flex gap-2 self-start sm:self-auto">
            <Button onClick={() => { resetForm(); setShowCreateDialog(true) }} className="gap-2">
              <Plus className="w-4 h-4" />
              新建提醒
            </Button>
            <Button onClick={() => router.push('/dashboard')} variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              返回
            </Button>
          </div>
        </div>

        {/* Notification Permission Banner */}
        {isSupported && !hasPermission && (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <BellRing className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-2">
                  启用浏览器通知
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300 mb-4">
                  为了及时收到提醒，请允许浏览器发送通知。你可以随时在浏览器设置中更改此权限。
                </p>
                <Button
                  onClick={requestPermission}
                  size="sm"
                  variant="outline"
                  className="gap-2 border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                >
                  <Bell className="w-4 h-4" />
                  启用通知
                </Button>
              </div>
            </div>
          </div>
        )}

        {!isSupported && (
          <div className="bg-gray-50 dark:bg-gray-950/20 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  浏览器不支持通知
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  你的浏览器不支持通知功能。建议使用最新版本的 Chrome、Firefox 或 Edge 浏览器。
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Reminders List */}
        {reminders.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Bell className="w-10 h-10 text-accent-foreground" />
            </div>
            <h2 className="text-2xl font-semibold text-card-foreground mb-3">
              还没有设置提醒
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              设置提醒，让我们帮你记录健康数据
            </p>
            <Button onClick={() => { resetForm(); setShowCreateDialog(true) }} size="lg" className="gap-2">
              <Plus className="w-5 h-5" />
              创建第一个提醒
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                className={`bg-card border border-border rounded-2xl shadow-sm p-6 hover:shadow-md transition-all ${
                  !reminder.enabled ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        reminder.enabled ? 'bg-primary/10 text-primary' : 'bg-accent text-accent-foreground'
                      }`}>
                        {getReminderIcon(reminder.type)}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-card-foreground">{reminder.title}</h3>
                        <span className="text-sm text-muted-foreground">
                          {getReminderTypeLabel(reminder.type)}
                        </span>
                      </div>
                    </div>

                    {reminder.message && (
                      <p className="text-sm text-muted-foreground mb-3">{reminder.message}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{reminder.time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{getFrequencyLabel(reminder.frequency)}</span>
                      </div>
                      {reminder.daysOfWeek.length > 0 && (
                        <span className="text-xs bg-accent px-2 py-1 rounded-full">
                          {getDaysLabel(reminder.daysOfWeek)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleReminder(reminder.id, reminder.enabled)}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                        reminder.enabled
                          ? 'bg-green-100 text-green-600 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                      title={reminder.enabled ? '禁用' : '启用'}
                    >
                      <Power className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => openEditDialog(reminder)}
                      className="w-10 h-10 rounded-lg hover:bg-accent flex items-center justify-center transition-colors"
                      title="编辑"
                    >
                      <Edit className="w-5 h-5 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => deleteReminder(reminder.id)}
                      className="w-10 h-10 rounded-lg hover:bg-accent flex items-center justify-center transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-5 h-5 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4">
              <h2 className="text-2xl font-bold text-card-foreground">
                {editingReminder ? '编辑提醒' : '新建提醒'}
              </h2>
            </div>

            <div className="p-6 space-y-4">
              {/* 提醒类型 */}
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  提醒类型
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="weight">体重记录</option>
                  <option value="workout">运动打卡</option>
                  <option value="food">饮食记录</option>
                  <option value="water">喝水提醒</option>
                  <option value="sleep">睡眠提醒</option>
                </select>
              </div>

              {/* 标题 */}
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  标题 *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="例如：记得称体重"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* 消息 */}
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  消息内容
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="可选的提醒消息"
                  rows={2}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* 时间 */}
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  提醒时间 *
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* 频率 */}
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  重复频率 *
                </label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="daily">每天</option>
                  <option value="weekdays">工作日</option>
                  <option value="weekends">周末</option>
                  <option value="weekly">每周</option>
                </select>
              </div>

              {/* 星期几选择（仅当选择每周时显示） */}
              {formData.frequency === 'weekly' && (
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    选择星期几
                  </label>
                  <div className="grid grid-cols-7 gap-2">
                    {['日', '一', '二', '三', '四', '五', '六'].map((day, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleDayToggle(index.toString())}
                        className={`py-2 text-sm font-medium rounded-lg transition-colors ${
                          formData.daysOfWeek.includes(index.toString())
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-accent text-accent-foreground hover:bg-accent/80'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex gap-3">
              <Button
                onClick={() => {
                  setShowCreateDialog(false)
                  setEditingReminder(null)
                  resetForm()
                }}
                variant="outline"
                className="flex-1"
              >
                取消
              </Button>
              <Button
                onClick={editingReminder ? handleUpdateReminder : handleCreateReminder}
                className="flex-1"
                disabled={!formData.title || !formData.time}
              >
                {editingReminder ? '保存' : '创建'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
