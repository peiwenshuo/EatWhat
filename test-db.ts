import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // 查询所有用户
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      password: true,
      createdAt: true
    }
  })

  console.log('所有用户:')
  console.log(JSON.stringify(users, null, 2))

  // 测试登录验证
  const testUser = await prisma.user.findUnique({
    where: { email: 'test456@example.com' }
  })

  if (testUser && testUser.password) {
    const isValid = await bcrypt.compare('password123', testUser.password)
    console.log('\n密码验证结果:', isValid)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
