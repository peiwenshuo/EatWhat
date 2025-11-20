const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // 查询所有用户
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true
    }
  })

  console.log('所有用户:')
  console.log(JSON.stringify(users, null, 2))

  // 测试登录
  const testUser = await prisma.user.findUnique({
    where: { email: 'test456@example.com' }
  })

  console.log('\n测试用户详情:')
  console.log(JSON.stringify(testUser, null, 2))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
