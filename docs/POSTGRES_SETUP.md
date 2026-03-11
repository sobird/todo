# 🗄 PostgreSQL 数据库配置指南

## 📋 概述

由于 Vercel 不支持 SQLite，本指南将帮助您将项目从 SQLite 迁移到 PostgreSQL。

## 🚀 快速开始

### 1. 创建 Vercel Postgres 数据库

```bash
# 安装 Vercel CLI (如果还没有)
npm install -g vercel

# 登录 Vercel
vercel login

# 在项目目录中初始化 Postgres
cd todo-app
vercel postgres create
```

### 2. 获取连接信息

Vercel 将提供以下信息：
- **Connection String**: `postgresql://user:password@host:port/database`
- **Database Name**: 数据库名称
- **Username**: 数据库用户名
- **Password**: 数据库密码

## 🔧 配置步骤

### 1. 安装依赖

```bash
pnpm add @neondatabase/serverless
pnpm add @types/pg
```

### 2. 更新环境变量

在 `.env.local` 文件中添加：

```env
# PostgreSQL 配置
DATABASE_URL=postgresql://user:password@host:port/database
POSTGRES_URL=postgresql://user:password@host:port/database
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 3. 更新数据库模块

修改 `src/lib/db.ts`:

```typescript
import { Client } from '@neondatabase/serverless';

// 使用连接字符串
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL or POSTGRES_URL environment variable is required');
}

const client = new Client({ connectionString });

export interface TodoRow {
  id: string;
  text: string;
  completed: boolean; // PostgreSQL 中 BOOLEAN 映射为 boolean
  created_at: Date;
}

export const dbOperations = {
  async getAllTodos(): Promise<TodoRow[]> {
    try {
      await client.connect();
      const result = await client.query(`
        SELECT id, text, completed, created_at
        FROM todos
        ORDER BY created_at DESC
      `);
      return result.rows;
    } finally {
      await client.end();
    }
  },

  async createTodo(id: string, text: string): Promise<void> {
    try {
      await client.connect();
      await client.query(
        'INSERT INTO todos (id, text, completed, created_at) VALUES ($1, $2, false, NOW())',
        [id, text]
      );
    } finally {
      await client.end();
    }
  },

  async updateTodo(id: string, text: string, completed: boolean): Promise<void> {
    try {
      await client.connect();
      await client.query(
        'UPDATE todos SET text = $1, completed = $2 WHERE id = $3',
        [text, completed, id]
      );
    } finally {
      await client.end();
    }
  },

  async deleteTodo(id: string): Promise<void> {
    try {
      await client.connect();
      await client.query('DELETE FROM todos WHERE id = $1', [id]);
    } finally {
      await client.end();
    }
  },

  async clearCompleted(): Promise<void> {
    try {
      await client.connect();
      await client.query('DELETE FROM todos WHERE completed = true');
    } finally {
      await client.end();
    }
  }
};
```

### 4. 更新 API 路由

确保所有 API 端点都正确处理 PostgreSQL 响应：

```typescript
// src/app/api/todos/route.ts
import { dbOperations } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const todos = await dbOperations.getAllTodos();
    return NextResponse.json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch todos' },
      { status: 500 }
    );
  }
}
```

## 🗃️ 数据库表结构

### PostgreSQL 表定义

```sql
-- 创建 todos 表
CREATE TABLE IF NOT EXISTS todos (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_completed ON todos(completed);
CREATE INDEX IF NOT EXISTS idx_created_at ON todos(created_at);

-- 插入示例数据（可选）
INSERT INTO todos (id, text, completed) VALUES
  ('1', '完成项目文档', false),
  ('2', '修复 bug #123', true),
  ('3', '优化性能', false);
```

## ⚡ 性能优化

### 1. 连接池管理

```typescript
// src/lib/db-pool.ts
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // 最大连接数
  idleTimeoutMillis: 30000, // 空闲连接超时
});

export default pool;
```

### 2. 缓存策略

```typescript
// src/lib/cache.ts
import { LRUCache } from 'lru-cache';

const cache = new LRUCache<string, any>({
  max: 1000,
  ttl: 1000 * 60 * 5, // 5 分钟
});

export function getCached(key: string, fetcher: () => Promise<any>) {
  if (cache.has(key)) {
    return cache.get(key);
  }

  return fetcher().then(data => {
    cache.set(key, data);
    return data;
  });
}
```

## 🔐 安全最佳实践

### 1. SQL 注入防护

```typescript
// 使用参数化查询
async function safeQuery(userId: string, searchText?: string) {
  const query = `
    SELECT id, text, completed, created_at
    FROM todos
    WHERE user_id = $1 ${searchText ? 'AND text ILIKE $2' : ''}
    ORDER BY created_at DESC
    LIMIT 100
  `;

  const params = searchText ? [userId, `%${searchText}%`] : [userId];
  return await pool.query(query, params);
}
```

### 2. 输入验证

```typescript
function validateTodoInput(text: string): { isValid: boolean; error?: string } {
  if (!text || typeof text !== 'string') {
    return { isValid: false, error: 'Text is required' };
  }

  if (text.length > 500) {
    return { isValid: false, error: 'Text too long (max 500 characters)' };
  }

  if (text.trim().length === 0) {
    return { isValid: false, error: 'Text cannot be empty' };
  }

  return { isValid: true };
}
```

## 🧪 测试和验证

### 1. 本地测试

```bash
# 设置测试环境变量
cp .env.local .env.test
echo "DATABASE_URL=postgresql://test:test@localhost:5432/test_db" >> .env.test

# 运行测试
pnpm test
```

### 2. 生产环境验证

```bash
# 检查数据库连接
curl https://your-app.vercel.app/api/todos

# 预期响应
{
  "data": [
    {"id": "1", "text": "任务1", "completed": false, "created_at": "2026-03-10T10:00:00Z"}
  ]
}
```

## 🚨 常见问题及解决方案

### 问题 1: 连接失败
**症状**: `ECONNREFUSED` 或连接超时
**解决方案**:
```javascript
// 增加重试逻辑
async function connectWithRetry(retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      await client.connect();
      return;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

### 问题 2: 内存泄漏
**症状**: 连接数持续增长
**解决方案**:
```typescript
// 确保每次操作后释放连接
export const dbOperations = {
  async getAllTodos() {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT ...');
      return result.rows;
    } finally {
      client.release(); // 重要！释放连接回连接池
    }
  }
};
```

### 问题 3: 查询性能慢
**症状**: 大数据集查询缓慢
**解决方案**:
```sql
-- 添加更多索引
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_todos_text_gin ON todos USING gin (text gin_trgm_ops);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_todos_user_completed ON todos(user_id, completed) WHERE user_id IS NOT NULL;
```

## 📈 监控和日志

### 1. 查询性能监控

```typescript
// 带性能监控的查询
async function monitoredQuery(sql: string, params: any[] = []) {
  const start = Date.now();
  try {
    const result = await pool.query(sql, params);
    const duration = Date.now() - start;
    console.log(`Query executed in ${duration}ms: ${sql}`);
    return result;
  } catch (error) {
    console.error(`Query failed after ${Date.now() - start}ms:`, error);
    throw error;
  }
}
```

### 2. 错误跟踪

```typescript
// 集成 Sentry 或其他 APM
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});

// 包装数据库操作
async function safeDbOperation<T>(operation: () => Promise<T>): Promise<T> {
  return Sentry.startSpan(
    { name: 'database.operation' },
    operation
  );
}
```

## 🔄 迁移脚本

### 从 SQLite 到 PostgreSQL

```bash
# 1. 备份当前数据
sqlite3 data/todos.db ".dump" > backup.sql

# 2. 转换 SQL 语法
sed -i 's/CREATE TABLE/CREATE TABLE/g' backup.sql
sed -i 's/TEXT/TEXT/g'
sed -i 's/BOOLEAN/BOOLEAN/g'
sed -i 's/DATETIME/TIMESTAMP WITH TIME ZONE/g'
sed -i 's/CURRENT_TIMESTAMP/NOW()/g'

# 3. 导入到 PostgreSQL
psql -h localhost -U username -d database_name -f backup.sql
```

## 🎯 后续优化

### 1. 用户认证和数据隔离
```sql
-- 添加用户系统
ALTER TABLE todos ADD COLUMN user_id UUID REFERENCES users(id);
CREATE INDEX idx_todos_user_id ON todos(user_id);
```

### 2. 高级功能
- [ ] 全文搜索 (使用 PostgreSQL 的 tsvector)
- [ ] JSONB 字段支持 (存储复杂数据)
- [ ] 触发器和函数 (自动化业务逻辑)
- [ ] 物化视图 (预计算统计信息)

---

**PostgreSQL 配置指南更新时间**: 2026年3月10日
**状态**: 准备就绪，等待实际部署使用

*配置指南由 Claude Code 生成，请根据实际环境调整参数*