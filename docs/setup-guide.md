# 快速启动指南

## 前置要求
- Node.js 18+
- npm 或 pnpm
- Supabase 账号（免费）
- OpenAI API Key

## 步骤 1：创建 Supabase 项目

1. 访问 https://supabase.com
2. 创建新项目
3. 等待数据库初始化完成
4. 获取以下信息：
   - Project URL
   - Anon Key
   - Service Role Key
   - Database URL（在 Settings > Database > Connection String）

## 步骤 2：配置环境变量

1. 复制环境变量文件：
```bash
cp .env.example .env
```

2. 填写 .env 文件：
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL="你的项目 URL"
NEXT_PUBLIC_SUPABASE_ANON_KEY="你的 Anon Key"
SUPABASE_SERVICE_ROLE_KEY="你的 Service Role Key"

# Database
DATABASE_URL="你的数据库连接字符串"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="运行 openssl rand -base64 32 生成"

# OpenAI
OPENAI_API_KEY="你的 OpenAI API Key"
```

## 步骤 3：安装依赖

```bash
npm install
```

## 步骤 4：初始化数据库

```bash
# 推送 Prisma schema 到 Supabase
npx prisma db push

# 打开 Prisma Studio 查看数据库
npx prisma studio
```

## 步骤 5：运行开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 步骤 6：创建第一个用户

目前需要通过 API 创建用户，稍后会添加注册页面。

## 常见问题

### 数据库连接失败
- 确认 DATABASE_URL 正确
- 确认 Supabase 项目已初始化完成
- 检查网络连接

### NextAuth 报错
- 确认 NEXTAUTH_SECRET 已设置
- 确认 NEXTAUTH_URL 正确

### OpenAI API 调用失败
- 确认 API Key 有效
- 检查账户余额
- 确认网络可访问 OpenAI API

## 下一步

- [ ] 创建注册和登录页面
- [ ] 实现 AI 生成菜单功能
- [ ] 添加用户资料设置
