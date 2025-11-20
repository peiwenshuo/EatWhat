'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { LogIn, UserPlus, Sparkles } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent">
      <div className="max-w-md w-full mx-auto px-6">
        <div className="text-center mb-12">
          {/* Logo/Icon */}
          <div className="w-20 h-20 rounded-3xl overflow-hidden mx-auto mb-6 shadow-lg ring-4 ring-primary/20">
            <Image
              src="/ai-avatar.jpg"
              alt="猫猫"
              width={80}
              height={80}
              className="object-cover"
            />
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 tracking-tight">
            大裴与珊珊的吃
          </h1>
          <p className="text-lg text-muted-foreground">
            一起健康生活，记录美好时光
          </p>

          {/* Feature Badges */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Xiugo</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Duoge</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>TianTian</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <Link href="/dashboard">
            <Button className="w-full h-12 text-base shadow-lg" size="lg">
              开搞
            </Button>
          </Link>

          <Link href="/auth/signin">
            <Button variant="outline" className="w-full h-12 text-base gap-2" size="lg">
              <LogIn className="w-4 h-4" />
              登录
            </Button>
          </Link>

          <Link href="/auth/signup">
            <Button variant="outline" className="w-full h-12 text-base gap-2" size="lg">
              <UserPlus className="w-4 h-4" />
              注册
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          用AI赋能的健康管理平台
        </p>
      </div>
    </div>
  )
}
