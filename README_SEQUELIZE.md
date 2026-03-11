# Sequelize ORM 重构说明

## 概述

这个文档记录了从 SQLite + better-sqlite3 迁移到 Sequelize ORM 的完整计划。

## 为什么需要重构？

### 当前问题
- **平台锁定**: 只能在本地运行，无法部署到 Vercel
- **缺乏高级功能**: 没有事务支持、关联查询等
- **维护困难**: 手动 SQL 语句，难以扩展
- **类型安全不足**: 需要手动类型转换

### 预期收益
- **云原生适配**: 完美支持 Vercel Serverless 架构
- **更好的类型安全**: TypeScript 集成更好
- **丰富的 ORM 功能**: 事务、关联、复杂查询
- **更好的维护性**: 标准化的数据库操作模式

## 重构步骤

### 1. 环境准备
```bash
pnpm add sequelize pg pg-hstore
pnpm add -D @types/sequelize typescript
```

### 2. 创建 Sequelize 配置
```typescript
// src/lib/sequelize.ts
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
  process.env.POSTGRES_URL || '',
  {
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

export default sequelize;
```

### 3. 创建 Todo 模型
```typescript
// src/models/Todo.ts
import { DataTypes, Model } from 'sequelize';
import sequelize from '../lib/sequelize';

class Todo extends Model {
  public id!: string;
  public text!: string;
  public completed!: boolean;
  public createdAt!: Date;

  static associate(models: any) {
    // 定义关联关系
  }
}

Todo.init({
  id: {
    type: DataTypes.STRING(36),
    primaryKey: true,
    allowNull: false
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  tableName: 'todos',
  timestamps: false,
  underscored: false
});

export default Todo;
```

### 4. 更新 API 路由
```typescript
// src/app/api/todos/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { models } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';

    let todos;
    if (filter === 'active') {
      todos = await models.Todo.findAll({
        where: { completed: false },
        order: [['createdAt', 'DESC']]
      });
    } else if (filter === 'completed') {
      todos = await models.Todo.findAll({
        where: { completed: true },
        order: [['createdAt', 'DESC']]
      });
    } else {
      todos = await models.Todo.findAll({
        order: [['createdAt', 'DESC']]
      });
    }

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

## 环境变量配置

### 开发环境
```env
# 开发环境使用 SQLite
DATABASE_URL=file:./data/todos.db
POSTGRES_URL=postgresql://username:password@host:port/database
```

### 生产环境
```env
# 生产环境使用 PostgreSQL
DATABASE_URL=postgresql://username:password@host:port/database
POSTGRES_URL=postgresql://username:password@host:port/database
```

## 测试策略

### 推荐依赖
```json
{
  "devDependencies": {
    "vitest": "^1.0.0",
    "@vitest/coverage-v8": "^1.0.0",
    "supertest": "^6.3.0",
    "@types/supertest": "^2.0.12",
    "sequelize-test-helpers": "^1.0.7"
  }
}
```

### 测试目录结构
```
src/
  __tests__/
    unit/
      models/
        Todo.test.ts
      services/
        TodoService.test.ts
    integration/
      api/
        todos.test.ts
      database/
        sequelize.test.ts
    e2e/
      todo-workflow.test.ts
```

## 迁移脚本

```typescript
// scripts/migrate-data.ts
import Database from 'better-sqlite3';
import { sequelize, models } from '../src/lib/db';

async function migrateData() {
  const sqliteDb = new Database('./data/todos.db');

  const todos = sqliteDb.prepare('SELECT * FROM todos').all();

  for (const todo of todos) {
    await models.Todo.create({
      id: todo.id,
      text: todo.text,
      completed: Boolean(todo.completed),
      createdAt: new Date(todo.created_at)
    });
  }

  console.log(`Migrated ${todos.length} todos`);
}

migrateData().catch(console.error);
```

## 注意事项

1. **备份数据**: 在迁移前务必备份现有数据库
2. **测试覆盖**: 确保有充分的测试用例覆盖所有功能
3. **回滚机制**: 保留旧系统直到新系统稳定运行
4. **性能监控**: 监控数据库查询性能和连接池使用情况

## 后续优化

- [ ] 添加数据库索引优化查询性能
- [ ] 实现缓存层提高读取速度
- [ ] 添加详细的日志记录和监控
- [ ] 优化错误处理和用户反馈
- [ ] 实现数据导入导出功能