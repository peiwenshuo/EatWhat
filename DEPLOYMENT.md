# Vercel 部署指南

## 📋 部署前检查清单

### ✅ 已完成的准备工作
- [x] package.json 已配置 Prisma 生成命令
- [x] vercel.json 配置文件已创建
- [x] 所有必需的环境变量已列出

## 🚀 部署步骤

### 1. 推送代码到 Git

```bash
git add .
git commit -m "Ready for Vercel deployment"
git push
```

### 2. 在 Vercel 创建项目

1. 访问 https://vercel.com
2. 点击 "New Project"
3. 选择你的 Git 仓库
4. Vercel 会自动检测 Next.js 项目

### 3. 配置环境变量

在 Vercel 项目设置中添加以下环境变量：

#### Supabase 配置
```
NEXT_PUBLIC_SUPABASE_URL=https://lrwkojppkteavqbovvyj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxyd2tvanBwa3RlYXZxYm92dnlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1OTY4MDIsImV4cCI6MjA3OTE3MjgwMn0.9O3McY1km8DQNDwFK2Ho40umRRP79sdSegB3qpJTLsA
```

#### 数据库配置
```
DATABASE_URL=postgresql://postgres:BT3d5..%2Fss2%26.fC@db.lrwkojppkteavqbovvyj.supabase.co:5432/postgres
```

#### NextAuth 配置
```
NEXTAUTH_URL=https://your-app.vercel.app  # ⚠️ 替换为实际域名
NEXTAUTH_SECRET=UqEWX7P32U/C4aYScGGAkV5Hl/IOJUs7R6WCScyCd4U=
```

#### OpenAI 配置
```
OPENAI_API_KEY=your-openai-api-key-here
```

### 4. 部署

点击 "Deploy" 按钮，等待构建完成

## 🔧 部署后配置

### 1. 更新 NEXTAUTH_URL

部署成功后：
1. Vercel 会分配一个域名（如 `your-app.vercel.app`）
2. 进入 Vercel 项目设置 → Environment Variables
3. 更新 `NEXTAUTH_URL` 为实际域名
4. 重新部署（会自动触发）

### 2. 配置 Supabase 回调 URL

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 Authentication → URL Configuration
4. 添加以下 URL：

**Site URL:**
```
https://your-app.vercel.app
```

**Redirect URLs:**
```
https://your-app.vercel.app/api/auth/callback/*
https://your-app.vercel.app/*
```

### 3. 测试功能

部署完成后测试以下功能：
- [ ] 用户注册/登录
- [ ] AI 饮食计划生成
- [ ] AI 训练计划生成
- [ ] 数据记录（体重、运动、饮食）
- [ ] 数据导出（Excel、PDF）
- [ ] 提醒通知
- [ ] 布局设置

## ⚠️ 常见问题

### 1. 构建失败

如果出现 Prisma 相关错误：
```bash
# 确保 package.json 中包含
"postinstall": "prisma generate"
```

### 2. 数据库连接失败

- 检查 `DATABASE_URL` 是否正确
- 确保 Supabase 数据库可以从外部访问
- 检查密码中的特殊字符是否正确编码（`%` 应为 `%25`）

### 3. NextAuth 登录失败

- 确保 `NEXTAUTH_URL` 使用 HTTPS
- 确保 Supabase 回调 URL 已正确配置
- 检查 `NEXTAUTH_SECRET` 是否正确设置

### 4. OpenAI API 错误

- 确认 API Key 有效且有额度
- 检查 API Key 是否正确复制（无多余空格）

## 🔒 安全提示

1. **不要**将 `.env` 文件提交到 Git
2. **不要**在公开代码中暴露 API Keys
3. 定期轮换敏感密钥
4. 使用 Vercel 的环境变量管理功能
5. 为生产环境设置不同的 `NEXTAUTH_SECRET`

## 📊 监控和日志

部署后可以在 Vercel Dashboard 查看：
- 构建日志
- 运行时日志
- 性能指标
- 错误报告

## 🆘 需要帮助？

如果遇到问题：
1. 检查 Vercel 部署日志
2. 查看浏览器控制台错误
3. 检查 Supabase 数据库连接
4. 确认所有环境变量正确设置

## 🎉 部署成功！

部署成功后，你的应用将可以通过以下方式访问：
- Vercel 域名: `https://your-app.vercel.app`
- 自定义域名（如果配置）: `https://yourdomain.com`

享受你的健身应用吧！💪
