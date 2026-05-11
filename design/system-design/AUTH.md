# DocAI 认证系统规格 - 无数据库 JWT 版本

## 一、设计原则

### 1.1 核心理念

> **极简优先**：MVP 阶段不需要持久化用户数据，不需要数据库依赖，一键启动

### 1.2 方案对比

| 方案              | 数据库 | 用户持久化 | 复杂度 | 适合场景           |
| ----------------- | ------ | ---------- | ------ | ------------------ |
| **纯 JWT**        | ❌ 无  | ❌ 仅会话  | ⭐     | MVP 演示、面试展示 |
| **Prisma 适配器** | ✅     | ✅ 永久    | ⭐⭐⭐ | 正式上线           |

---

## 二、技术架构

### 2.1 整体流程

```
┌─────────────────┐
│  用户访问 /chat │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Middleware     │ 未登录 302 重定向
│  路由守卫       │
└────────┬────────┘
         │ 未登录
         ▼
┌─────────────────┐
│  /login 页面    │
│  Google 按钮    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Google OAuth   │ 账号选择 + 授权
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Callback       │ Auth.js 处理
│  签发 JWT       │ name/email/avatar 加密写入 Cookie
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  进入 /chat     │
│  Server 端      │ auth() 获取会话
└─────────────────┘
```

### 2.2 会话存储

```
Cookie: authjs.session-token
├── 内容: JWT (加密)
├── 用户信息: { id, name, email, picture }
├── 有效期: 30 天
└── 加密算法: A256GCM
```

---

## 三、文件清单

| 路径                                   | 作用             | 代码行数 |
| -------------------------------------- | ---------------- | -------- |
| `/auth.ts`                             | Auth.js 核心配置 | 35 行    |
| `/middleware.ts`                       | 路由守卫         | 8 行     |
| `/app/api/auth/[...nextauth]/route.ts` | API 端点         | 2 行     |
| `/app/login/page.tsx`                  | 登录页面         | 70 行    |
| `/app/chat/page.tsx`                   | 会话消费 + 登出  | 100 行   |

---

## 四、核心配置说明

### 4.1 Provider 配置

```typescript
Google({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  authorization: {
    params: {
      prompt: "consent", // 每次都显示账号选择
      access_type: "offline", // 获取 refresh_token
      response_type: "code",
    },
  },
})
```

### 4.2 Callback 流程

```typescript
callbacks: {
  // JWT 写入：用户信息加密到 Token
  async jwt({ token, user }) {
    if (user) {
      token.id = user.id;
      token.name = user.name;
      token.email = user.email;
      token.picture = user.image;
    }
    return token;
  },

  // 会话读出：传给 Server Component
  async session({ session, token }) {
    session.user.id = token.id;
    return session;
  },
}
```

### 4.3 Middleware 路由保护

```typescript
export const config = {
  matcher: [
    "/chat/:path*", // 聊天页需要登录
    "/((?!api|_next|login).*)", // 其他页面
  ],
}
```

---

## 五、环境变量清单

```env
# ==================================================
# 必填 - 运行前必须配置
# ==================================================

# 生成命令: openssl rand -hex 32
NEXTAUTH_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 开发/生产域名
NEXTAUTH_URL=http://localhost:3000

# Google OAuth 控制台获取: https://console.cloud.google.com/
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxxxxxxxxx
```

---

## 六、Google Cloud 配置步骤

### 6.1 控制台配置

```
1. 打开 Google Cloud Console → 新建项目
2. 搜索 "API 和服务" → "凭据"
3. 创建凭据 → OAuth 客户端 ID
4. 应用类型: Web 应用
5. 已获授权的 JavaScript 来源:
   ✅ http://localhost:3000
6. 已获授权的重定向 URI:
   ✅ http://localhost:3000/api/auth/callback/google
```

### 6.2 生产环境额外配置

```
✅ 添加域名: https://你的域名.com
✅ 发布应用 (否则用户会看到未验证警告)
✅ 配置 OAuth 同意屏幕
```

---

## 七、API 使用指南

### 7.1 Server Component - 推荐！

```tsx
// 零成本！不需要任何客户端代码
import { auth } from "@/auth"

export default async function ChatPage() {
  const session = await auth()
  const user = session?.user

  return (
    <div>
      欢迎: {user?.name}
      邮箱: {user?.email}
      头像: {user?.image}
    </div>
  )
}
```

### 7.2 登出 - Server Action

```tsx
// 纯服务端，不需要客户端 JS
<form
  action={async () => {
    "use server"
    await signOut({ redirectTo: "/login" })
  }}
>
  <Button type="submit">退出登录</Button>
</form>
```

### 7.3 登录

```typescript
// 客户端跳转
window.location.href = "/api/auth/signin/google"
```

---

## 八、验收标准

| 测试项           | 预期结果                    |
| ---------------- | --------------------------- |
| 直接访问 `/chat` | 自动重定向到 `/login`       |
| 点击 Google 按钮 | 跳转到 Google 账号选择页    |
| 授权完成         | 成功进入 `/chat`            |
| 右上角显示       | 用户头像、姓名、邮箱        |
| 点击退出         | 清除会话，返回登录页        |
| 浏览器 Cookie    | 存在 `authjs.session-token` |
| Cookie 有效期    | 30 天                       |

---

## 九、局限性与扩展

### 9.1 当前版本局限性

| 限制项         | 说明                            |
| -------------- | ------------------------------- |
| 用户数据持久化 | ❌ 无法查询历史用户列表         |
| 多账号关联     | ❌ 无法同一用户绑定多个登录方式 |
| 用户角色系统   | ❌ 无 RBAC                      |
| 会话吊销       | ❌ 无法单独吊销某台设备         |

### 9.2 后续升级路径

> **零成本平滑升级**：未来加数据库只需要加 2 行代码

```typescript
// 未来升级 Prisma 适配器只需要：
// 1. npm install @auth/prisma-adapter
// 2. auth.ts 加 adapter 配置
// 3. 现有代码完全不用改！

import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),  // + 这一行
  providers: [Google(...)],
  // session.strategy 自动变成 "database"
});
```

---

## 十、安全说明

1. **JWT 内容**：仅存储 id/name/email/avatar，不存储敏感信息
2. **加密算法**：Auth.js 默认使用 A256GCM 加密，客户端无法解密
3. **Cookie 属性**：HttpOnly + Secure + SameSite=Lax
4. **CSRF 保护**：Auth.js 内置所有 OAuth 流程的 CSRF 防护

---

## 十一、启动命令

```bash
# 1. 复制环境变量
cp .env.example .env.local

# 2. 生成密钥
openssl rand -hex 32

# 3. 填写 Google OAuth 凭据

# 4. 启动
pnpm dev

# 5. 测试: http://localhost:3000/chat
```
