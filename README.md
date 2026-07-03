# 在线邮件推广系统


## Traditional mail promotion system.  not good for my ai marketing.  discard this route.  Choose ai generation.



B/S 架构：Vue 3 前端 + Node.js 后端 + MySQL 数据库。

## 架构

```
frontend/src/              backend/src/
├── views/                 ├── index.js           # 入口
├── api/index.ts           ├── db.js              # MySQL 连接
├── stores/auth.ts         ├── auth.js            # JWT + 鉴权
└── router/index.ts        └── routes/
                               ├── auth.js
                               ├── customers.js
                               └── notifications.js
```

## 环境要求

- Node.js 18+
- MySQL 8.0

## 快速开始

### 1. 初始化数据库

```bash
cd backend
npm install
cp .env.example .env
# 默认与 parking-guidance-system 相同：root / localdev

npm run db:init
```

### 2. 启动后端

```bash
npm run dev
```

### 3. 启动前端

```bash
cd frontend
npm install
npm run dev
```

- 前端：http://localhost:5173
- 后端：http://localhost:8000
- 默认账号：`admin` / `admin123`

## 已实现

- 登录认证
- 客户 Excel 导入与列表
- 客户分组
- 消息中心
- 数据看板
