
后端仓库 README 写：

```md
# Instant Messaging Backend

基于 NestJS、MySQL、Sequelize、JWT、Socket.IO 和 DeepSeek API 开发的即时通讯平台后端。

本仓库为后端项目，前端仓库请访问：

[Instant Messaging Frontend](https://github.com/aiheshuyi/instant-messaging-frontend)

## 在线服务

- 后端地址：[Railway Backend](https://instant-messaging-backend-production.up.railway.app)
- Swagger：[API Documentation](https://instant-messaging-backend-production.up.railway.app/api)
- 前端地址：[Vercel Frontend](https://instant-messaging-frontend.vercel.app)

## 技术栈

- Node.js
- NestJS
- TypeScript
- MySQL
- Sequelize
- JWT / Passport
- bcrypt
- Socket.IO
- SSE
- DeepSeek API
- Swagger

## 功能介绍

### 用户与认证

- 用户注册与登录
- bcrypt 密码哈希
- JWT Token 生成与解析
- 用户信息和头像持久化
- Swagger 接口文档

### 即时通讯

- 消息写入 MySQL
- 查询双方历史聊天记录
- 聊天记录分页加载
- Socket.IO 好友消息实时通知
- 用户在线状态同步
- 支持在线、忙碌、请勿打扰和离开状态
- 支持同一用户多标签页连接

### DeepSeek AI 助手

- 封装 DeepSeek `chat/completions` 接口
- 通过 SSE 向前端输出流式响应
- 保存用户问题和 AI 回答
- 支持 AI 多会话管理
- 支持会话新建、查询、重命名和删除
- 根据用户和会话 ID 隔离数据
- 携带最近历史消息实现上下文记忆
- 处理 API Key 缺失、网络异常和流式解析失败

### 数据持久化

项目主要包含以下数据模型：

```text
users
├── 用户名
├── 密码
└── 头像

messages
├── 发送者
├── 接收者
├── 消息内容
└── 发送时间

ai_conversations
├── 所属用户
├── 会话标题
└── 最后消息时间

ai_messages
├── 所属用户
├── 会话 ID
├── 消息角色
└── 消息内容
```

## 相较原项目的主要改进

| 模块 | 改进内容 |
| --- | --- |
| 消息查询 | 增加聊天记录分页接口 |
| 实时通信 | 增加在线状态、个人状态和未读通知事件 |
| WebSocket | 与 NestJS HTTP 服务共享同一部署端口 |
| AI 能力 | 接入 DeepSeek SSE 流式回复 |
| AI 数据 | 增加 AI 会话和消息数据表 |
| 会话管理 | 支持新建、重命名、删除和上下文记忆 |
| 头像系统 | 支持保存预设头像和用户上传头像 |
| 部署配置 | 适配 Railway PORT 和 MySQL 环境变量 |

## 本地运行

### 1. 安装依赖

```bash
npm install
```

### 2. 创建 MySQL 数据库

```sql
CREATE DATABASE instant_messaging
DEFAULT CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

### 3. 配置环境变量

在项目根目录创建 `.env`：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=你的MySQL密码
DB_NAME=instant_messaging

DEEPSEEK_API_KEY=你的DeepSeek API Key
DEEPSEEK_API_URL=https://api.deepseek.com/chat/completions
DEEPSEEK_MODEL=deepseek-chat

PORT=3000
```

> 不要将 `.env`、数据库密码或 DeepSeek API Key 上传到 GitHub。

### 4. 启动开发环境

```bash
npm run start:dev
```

后端地址：

```text
http://localhost:3000
```

Swagger 地址：

```text
http://localhost:3000/api
```

Socket.IO 地址：

```text
http://localhost:3000
```

## 生产构建

```bash
npm run build
npm run start:prod
```

## 主要接口

### 用户接口

```text
POST /auth/register
POST /auth/login
POST /user/all
POST /user/avatar
```

### 消息接口

```text
POST /message/send
POST /message/list
GET  /messages
```

### AI 接口

```text
GET    /ai/config/status
GET    /ai/conversations
POST   /ai/conversations
GET    /ai/conversations/:id/messages
PATCH  /ai/conversations/:id
DELETE /ai/conversations/:id
POST   /ai/chat/stream
```

### Socket.IO 事件

```text
connection        用户加入个人房间
presence:update   更新个人状态
presence:request  获取用户状态
presence:list     广播用户状态
sendMessage       发送消息通知
showMessage       接收消息通知
```

## Railway 部署变量

后端服务需要配置：

```env
DB_HOST=${{MySQL.MYSQLHOST}}
DB_PORT=${{MySQL.MYSQLPORT}}
DB_USER=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
DB_NAME=${{MySQL.MYSQLDATABASE}}

DEEPSEEK_API_KEY=你的DeepSeek API Key
DEEPSEEK_API_URL=https://api.deepseek.com/chat/completions
DEEPSEEK_MODEL=deepseek-chat
```

Railway 会自动提供 `PORT`，应用通过以下方式监听：

```ts
await app.listen(Number(process.env.PORT || 3000), '0.0.0.0')
```

## 部署架构

```text
Vercel Frontend
       │
       ├── HTTP
       ├── Socket.IO
       └── SSE
             │
      Railway Backend
             │
      Railway MySQL
             │
       DeepSeek API
```

## 安全说明

- 密码使用 bcrypt 哈希后存储
- DeepSeek API Key 仅保存在后端
- 数据库配置通过环境变量管理
- 前端不会直接访问 DeepSeek API
- `.env` 文件不得提交至 GitHub

## 项目来源

本项目基于开源即时通讯项目进行二次开发，主要用于学习 NestJS、MySQL、JWT、Socket.IO、SSE、AI 接口接入及生产环境部署。

原项目地址：[Instant-messaging-React18](https://github.com/BoyYangzai/Instant-messaging-React18)
