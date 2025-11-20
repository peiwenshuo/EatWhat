// 浏览器通知工具函数

export interface NotificationOptions {
  title: string
  body?: string
  icon?: string
  tag?: string
  requireInteraction?: boolean
}

// 请求通知权限
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('浏览器不支持通知功能')
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  return false
}

// 检查通知权限状态
export function checkNotificationPermission(): 'granted' | 'denied' | 'default' | 'unsupported' {
  if (!('Notification' in window)) {
    return 'unsupported'
  }
  return Notification.permission
}

// 发送浏览器通知
export async function sendNotification(options: NotificationOptions): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('浏览器不支持通知功能')
    return false
  }

  if (Notification.permission !== 'granted') {
    const granted = await requestNotificationPermission()
    if (!granted) {
      console.warn('用户未授予通知权限')
      return false
    }
  }

  try {
    const notification = new Notification(options.title, {
      body: options.body,
      icon: options.icon || '/icon-192x192.png',
      tag: options.tag,
      requireInteraction: options.requireInteraction || false,
      badge: '/icon-192x192.png'
    })

    // 点击通知时聚焦到窗口
    notification.onclick = () => {
      window.focus()
      notification.close()
    }

    return true
  } catch (error) {
    console.error('发送通知失败:', error)
    return false
  }
}

// 检查提醒时间是否到达
export function shouldTriggerReminder(
  reminderTime: string, // HH:mm 格式
  frequency: string,
  daysOfWeek: string[],
  lastSentAt: Date | null
): boolean {
  const now = new Date()
  const [hours, minutes] = reminderTime.split(':').map(Number)

  // 检查时间是否匹配（允许1分钟误差）
  const currentHours = now.getHours()
  const currentMinutes = now.getMinutes()

  const timeMatches =
    currentHours === hours &&
    Math.abs(currentMinutes - minutes) <= 1

  if (!timeMatches) {
    return false
  }

  // 检查今天是否已经发送过
  if (lastSentAt) {
    const lastSentDate = new Date(lastSentAt)
    const isSameDay =
      lastSentDate.getFullYear() === now.getFullYear() &&
      lastSentDate.getMonth() === now.getMonth() &&
      lastSentDate.getDate() === now.getDate()

    if (isSameDay) {
      return false
    }
  }

  // 检查频率
  const dayOfWeek = now.getDay()

  switch (frequency) {
    case 'daily':
      return true

    case 'weekdays':
      return dayOfWeek >= 1 && dayOfWeek <= 5

    case 'weekends':
      return dayOfWeek === 0 || dayOfWeek === 6

    case 'weekly':
      return daysOfWeek.includes(dayOfWeek.toString())

    default:
      return false
  }
}

// 格式化提醒消息
export function formatReminderMessage(type: string, message?: string): string {
  if (message) {
    return message
  }

  const defaultMessages: Record<string, string> = {
    weight: '别忘了记录今天的体重哦！',
    workout: '该运动啦，动起来吧！',
    food: '记得记录你的饮食哦！',
    water: '该喝水了，保持水分很重要！',
    sleep: '该准备睡觉了，充足睡眠很重要！'
  }

  return defaultMessages[type] || '你有一个健康提醒'
}
