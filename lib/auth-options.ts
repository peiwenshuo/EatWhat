import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials): Promise<any> {
        try {
          console.log('[Auth] 开始认证流程...')

          if (!credentials?.email || !credentials?.password) {
            console.error('[Auth] 缺少邮箱或密码')
            throw new Error('邮箱和密码不能为空')
          }

          console.log('[Auth] 尝试查找用户:', credentials.email)

          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user) {
            console.error('[Auth] 用户不存在:', credentials.email)
            throw new Error('用户不存在')
          }

          if (!user.password) {
            console.error('[Auth] 用户没有密码')
            throw new Error('账号配置错误')
          }

          console.log('[Auth] 验证密码...')

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            console.error('[Auth] 密码错误')
            throw new Error('密码错误')
          }

          console.log('[Auth] 登录成功:', user.email)

          return {
            id: user.id,
            email: user.email!,
            name: user.name,
            image: user.avatar || undefined,
          }
        } catch (error: any) {
          console.error('[Auth] 认证失败:', error.message)
          // 抛出错误而不是返回 null，这样可以在前端看到具体错误信息
          throw new Error(error.message || '登录失败')
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
}
