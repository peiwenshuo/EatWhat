'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
  Home,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
  Moon,
  Sun,
  Layout
} from 'lucide-react'
import { useTheme } from 'next-themes'

export function Header() {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { theme, setTheme } = useTheme()

  // 不在登录页和主页显示 Header
  if (pathname === '/' || pathname?.startsWith('/auth/')) {
    return null
  }

  // 未登录不显示 Header
  if (!session) {
    return null
  }

  const navigation = [
    { name: '主页', href: '/dashboard', icon: Home },
    { name: '个人资料', href: '/profile', icon: User },
    { name: '提醒', href: '/reminders', icon: Bell },
  ]

  const isActive = (href: string) => {
    return pathname === href
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-primary/20 group-hover:border-primary transition-colors">
                  <Image
                    src="/ai-avatar.jpg"
                    alt="AI Avatar"
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-bold text-lg text-foreground hidden sm:inline-block group-hover:text-primary transition-colors">
                  XiuGo的健康计划
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    isActive(item.href)
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="hidden sm:flex"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </Button>

              {/* Settings */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/settings')}
                className="hidden sm:flex"
              >
                <Settings className="w-5 h-5" />
              </Button>

              {/* User Menu - Desktop */}
              <div className="hidden md:block relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground max-w-[100px] truncate">
                    {session.user?.name || session.user?.email}
                  </span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>

                {showUserMenu && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserMenu(false)}
                    />

                    {/* Dropdown Menu */}
                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-card border border-border shadow-lg overflow-hidden z-50">
                      <div className="p-3 border-b border-border">
                        <p className="text-sm font-medium text-card-foreground">
                          {session.user?.name || '用户'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {session.user?.email}
                        </p>
                      </div>

                      <div className="p-1">
                        <button
                          onClick={() => {
                            setShowUserMenu(false)
                            router.push('/profile')
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent text-sm text-card-foreground transition-colors"
                        >
                          <User className="w-4 h-4" />
                          个人资料
                        </button>

                        <button
                          onClick={() => {
                            setShowUserMenu(false)
                            router.push('/settings')
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent text-sm text-card-foreground transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          设置
                        </button>

                        <button
                          onClick={() => {
                            setShowUserMenu(false)
                            router.push('/settings/layout')
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent text-sm text-card-foreground transition-colors"
                        >
                          <Layout className="w-4 h-4" />
                          布局设置
                        </button>
                      </div>

                      <div className="p-1 border-t border-border">
                        <button
                          onClick={() => signOut({ callbackUrl: '/' })}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent text-sm text-destructive transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          退出登录
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden"
              >
                {showMobileMenu ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-border bg-background">
            <div className="px-4 py-3 space-y-1">
              {/* User Info */}
              <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-accent/50 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-card-foreground truncate">
                    {session.user?.name || '用户'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {session.user?.email}
                  </p>
                </div>
              </div>

              {/* Navigation Links */}
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setShowMobileMenu(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              ))}

              {/* Theme Toggle */}
              <button
                onClick={() => {
                  setTheme(theme === 'dark' ? 'light' : 'dark')
                  setShowMobileMenu(false)
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-4 h-4" />
                    浅色模式
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4" />
                    深色模式
                  </>
                )}
              </button>

              {/* Settings */}
              <Link
                href="/settings"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
              >
                <Settings className="w-4 h-4" />
                设置
              </Link>

              {/* Layout Settings */}
              <Link
                href="/settings/layout"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
              >
                <Layout className="w-4 h-4" />
                布局设置
              </Link>

              {/* Logout */}
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-destructive hover:bg-accent/50 transition-colors mt-2 border-t border-border pt-3"
              >
                <LogOut className="w-4 h-4" />
                退出登录
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
