import { useState, useEffect, useCallback } from 'react'
import {
  requestNotificationPermission,
  checkNotificationPermission,
  sendNotification,
  shouldTriggerReminder,
  formatReminderMessage
} from '@/lib/notifications'

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
}

export function useNotifications() {
  const [permission, setPermission] = useState<'granted' | 'denied' | 'default' | 'unsupported'>('default')
  const [isChecking, setIsChecking] = useState(false)

  // 初始化时检查权限
  useEffect(() => {
    const currentPermission = checkNotificationPermission()
    setPermission(currentPermission)
  }, [])

  // 请求通知权限
  const requestPermission = useCallback(async () => {
    const granted = await requestNotificationPermission()
    const newPermission = checkNotificationPermission()
    setPermission(newPermission)
    return granted
  }, [])

  // 发送通知
  const notify = useCallback(async (title: string, body?: string, options?: { tag?: string }) => {
    return await sendNotification({
      title,
      body,
      tag: options?.tag,
      requireInteraction: false
    })
  }, [])

  // 检查并触发提醒
  const checkReminders = useCallback(async () => {
    if (isChecking) return

    setIsChecking(true)

    try {
      // 获取所有启用的提醒
      const response = await fetch('/api/reminders?enabled=true')
      const data = await response.json()

      if (!data.success) {
        return
      }

      const reminders: Reminder[] = data.reminders

      // 检查每个提醒是否需要触发
      for (const reminder of reminders) {
        const shouldTrigger = shouldTriggerReminder(
          reminder.time,
          reminder.frequency,
          reminder.daysOfWeek,
          reminder.lastSentAt ? new Date(reminder.lastSentAt) : null
        )

        if (shouldTrigger) {
          // 发送通知
          const body = formatReminderMessage(reminder.type, reminder.message || undefined)
          const sent = await sendNotification({
            title: reminder.title,
            body,
            tag: `reminder-${reminder.id}`,
            requireInteraction: true
          })

          // 如果发送成功，更新 lastSentAt
          if (sent) {
            await fetch(`/api/reminders?id=${reminder.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                lastSentAt: new Date().toISOString()
              })
            })
          }
        }
      }
    } catch (error) {
      console.error('检查提醒失败:', error)
    } finally {
      setIsChecking(false)
    }
  }, [isChecking])

  // 启动提醒检查循环（每分钟检查一次）
  const startReminderCheck = useCallback(() => {
    // 立即检查一次
    checkReminders()

    // 设置定时器，每分钟检查一次
    const interval = setInterval(() => {
      checkReminders()
    }, 60 * 1000) // 每60秒检查一次

    return () => clearInterval(interval)
  }, [checkReminders])

  return {
    permission,
    requestPermission,
    notify,
    checkReminders,
    startReminderCheck,
    hasPermission: permission === 'granted',
    isSupported: permission !== 'unsupported'
  }
}
