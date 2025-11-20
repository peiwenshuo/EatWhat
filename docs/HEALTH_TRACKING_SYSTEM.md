# 健康数据追踪系统架构设计

## 一、系统概述

企业级健康数据追踪和分析系统，用于记录、分析和可视化用户的健康数据。

## 二、核心功能模块

### 1. 数据采集模块

#### 1.1 体重管理
- **日常记录**：每日体重、体脂率、BMI
- **数据来源**：手动输入、智能体重秤同步
- **记录频率**：每日、每周
- **数据字段**：
  ```typescript
  {
    date: Date,
    weight: number,          // 体重 (kg)
    bodyFat: number?,        // 体脂率 (%)
    muscleMass: number?,     // 肌肉量 (kg)
    visceralFat: number?,    // 内脏脂肪等级
    waterPercentage: number?, // 水分率 (%)
    bmi: number,             // 自动计算
    notes: string?           // 备注
  }
  ```

#### 1.2 训练记录
- **训练日志**：日期、时长、类型、强度
- **详细数据**：
  ```typescript
  {
    date: Date,
    type: 'strength' | 'cardio' | 'flexibility' | 'sports',
    duration: number,        // 分钟
    intensity: 'low' | 'medium' | 'high',
    caloriesBurned: number?, // 消耗卡路里
    exercises: [{
      name: string,
      sets: number?,
      reps: number?,
      weight: number?,
      distance: number?,
      notes: string?
    }],
    feeling: 1-5,            // 训练感受评分
    notes: string?
  }
  ```

#### 1.3 饮食记录
- **每餐记录**：早餐、午餐、晚餐、加餐
- **营养追踪**：
  ```typescript
  {
    date: Date,
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
    time: string,
    foods: [{
      name: string,
      portion: string,
      calories: number?,
      protein: number?,
      carbs: number?,
      fat: number?,
      fiber: number?
    }],
    totalCalories: number,
    photos: string[],        // 照片记录
    notes: string?
  }
  ```

### 2. 数据分析模块

#### 2.1 时间维度分析
- **日视图**：当日数据汇总
- **周视图**：7天趋势分析
- **月视图**：30天对比
- **年视图**：年度总结
- **自定义区间**：任意时间段对比

#### 2.2 指标分析
- **体重趋势**：
  - 体重变化曲线
  - 平均体重
  - 最高/最低体重
  - 变化率

- **训练分析**：
  - 总训练次数
  - 总训练时长
  - 平均训练强度
  - 训练类型分布
  - 消耗卡路里统计

- **饮食分析**：
  - 每日平均摄入
  - 营养素分布
  - 三餐热量占比
  - 营养目标达成率

#### 2.3 相关性分析
- 体重 vs 训练强度
- 体重 vs 饮食摄入
- 训练效果评估
- 目标达成进度

### 3. 数据可视化模块

#### 3.1 图表类型
- **折线图**：趋势变化（体重、体脂等）
- **柱状图**：对比数据（周/月训练量）
- **饼图**：占比分析（训练类型、营养分布）
- **热力图**：活跃度日历
- **雷达图**：综合评分

#### 3.2 仪表板
- **今日概览**：
  - 今日体重
  - 今日训练
  - 今日饮食
  - 今日目标完成度

- **本周总结**：
  - 周体重变化
  - 周训练统计
  - 周饮食平均
  - 周目标达成

### 4. 目标管理模块

#### 4.1 目标设定
- 体重目标（减重/增重）
- 体脂目标
- 训练目标（频率、时长）
- 饮食目标（热量控制）

#### 4.2 进度追踪
- 目标完成百分比
- 预计达成时间
- 每日/每周进度
- 里程碑提醒

### 5. 数据导出模块

#### 5.1 导出格式
- **Excel**：详细数据表
- **PDF**：可视化报告
- **CSV**：原始数据
- **图片**：图表截图

#### 5.2 报告生成
- 周报
- 月报
- 季度报告
- 年度总结

## 三、技术实现

### 3.1 数据库设计

```prisma
// 已有的表
model BodyRecord {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  date      DateTime
  weight    Float
  bodyFat   Float?
  muscleMass Float?
  notes     String?
  createdAt DateTime @default(now())
}

model WorkoutLog {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  date            DateTime
  type            String
  duration        Int
  intensity       String?
  caloriesBurned  Int?
  exercises       Json
  feeling         Int?
  notes           String?
  createdAt       DateTime @default(now())
}

model FoodLog {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  date          DateTime
  mealType      String
  time          String?
  foods         Json
  totalCalories Int
  photos        String[]
  notes         String?
  createdAt     DateTime @default(now())
}
```

### 3.2 前端技术栈
- **图表库**：Recharts / Chart.js
- **日期处理**：date-fns
- **数据导出**：xlsx / jsPDF
- **数据缓存**：React Query

### 3.3 API 设计

```typescript
// 体重记录
POST   /api/health/weight           // 添加体重记录
GET    /api/health/weight           // 获取体重记录
GET    /api/health/weight/stats     // 体重统计

// 训练记录
POST   /api/health/workout          // 添加训练记录
GET    /api/health/workout          // 获取训练记录
GET    /api/health/workout/stats    // 训练统计

// 饮食记录
POST   /api/health/food             // 添加饮食记录
GET    /api/health/food             // 获取饮食记录
GET    /api/health/food/stats       // 饮食统计

// 综合统计
GET    /api/health/dashboard        // 仪表板数据
GET    /api/health/report           // 生成报告
POST   /api/health/export           // 导出数据
```

## 四、用户界面设计

### 4.1 页面结构
```
/health                  // 健康数据中心
  /dashboard             // 数据仪表板
  /weight                // 体重管理
  /workout               // 训练日志
  /food                  // 饮食日志
  /analytics             // 数据分析
  /goals                 // 目标管理
  /reports               // 报告中心
```

### 4.2 核心交互
- 快速记录入口（悬浮按钮）
- 日历视图选择日期
- 滑动切换时间段
- 下拉刷新数据
- 图表交互探索

## 五、实施计划

### Phase 1：基础功能（MVP）
1. 体重记录和查看
2. 简单的数据统计
3. 基础图表展示

### Phase 2：完整记录
1. 训练日志
2. 饮食日志
3. 数据关联

### Phase 3：分析和可视化
1. 多维度统计
2. 高级图表
3. 趋势分析

### Phase 4：高级功能
1. 目标管理
2. 报告生成
3. 数据导出
4. AI 建议

## 六、数据安全

- 数据加密存储
- 定期备份
- 访问权限控制
- 隐私数据脱敏
- 符合 GDPR 标准
