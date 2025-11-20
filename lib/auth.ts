import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  // 注意: Credentials Provider 不能与 Adapter 一起使用
  // adapter: PrismaAdapter(prisma) as any,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          console.log('authorize 开始', credentials?.email)

          if (!credentials?.email || !credentials?.password) {
            console.log('缺少邮箱或密码')
            return null
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          console.log('查询用户结果:', user ? '找到用户' : '未找到用户')

          if (!user || !user.password) {
            console.log('用户不存在或没有密码')
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          console.log('密码验证结果:', isPasswordValid)

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.avatar,
          }
        } catch (error) {
          console.error('authorize 错误:', error)
          return null
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
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    }
  },
  debug: process.env.NODE_ENV === 'development',
}
