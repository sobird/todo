# Sequelize ORM 重构计划

## 背景

当前应用使用 SQLite + better-sqlite3 进行数据存储，存在平台锁定问题。需要迁移到 Sequelize ORM 并适配 Vercel Postgres 数据库。

## 当前架构分析总结

### 现有优势
1. **良好的代码分离**: API层与数据库操作清晰分离
2. **安全的SQL注入防护**: 使用预编译SQL语句
3. **一致的错误处理模式**: 统一的try-catch结构和标准化响应格式
4. **完整的输入验证**: 服务器端和客户端双重验证
5. **清晰的类型定义**: TypeScript接口定义完整

### 重构关键考虑点
1. **保持API契约不变**: 确保现有接口继续工作
2. **增强错误处理**: 添加更丰富的错误类型和事务支持
3. **完善测试覆盖**: 建立全面的测试基础设施
4. **提升数据一致性**: 引入事务管理和并发控制

## 实施阶段（基于测试优先策略）

### 阶段 0: 测试基础设施搭建 (45分钟)
- 安装Vitest和相关依赖
- 配置测试环境
- 建立基础测试目录结构
- 设置覆盖率报告

### 阶段 1: 环境准备 (30分钟)
- 安装 Sequelize 和相关依赖
- 创建 Sequelize 配置文件
- 配置环境变量

### 阶段 2: 模型定义 (45分钟)
- 创建 Todo 模型
- 定义字段类型和约束
- 设置关联关系

### 阶段 3: 数据库层重构 (60分钟)
- 移除旧的 db.ts
- 创建新的 Sequelize 集成
- 实现表结构同步
- 添加事务管理

### 阶段 4: API 层重构 (60分钟)
- 更新 todos API 路由
- 更新单个 todo API
- 增强错误处理和验证
- 添加日志记录

### 阶段 5: 测试覆盖 (90分钟)
- 模型单元测试
- API集成测试
- E2E端到端测试
- 覆盖率监控

### 阶段 6: 部署准备 (30分钟)
- 配置 Vercel 环境变量
- 更新构建脚本
- 文档更新

## 关键文件修改路径

1. `src/lib/db.ts` - 数据库连接层重构
2. `src/models/Todo.ts` - 新模型定义
3. `src/models/index.ts` - 模型导出
4. `src/app/api/todos/route.ts` - GET/POST 方法
5. `src/app/api/todos/[id]/route.ts` - PUT/DELETE 方法
6. `src/__tests__/` - 完整的测试套件

## 测试架构设计

### 推荐技术栈
- **测试框架**: Vitest (原生TypeScript支持，性能优秀)
- **覆盖率工具**: @vitest/coverage-v8
- **HTTP测试**: supertest
- **数据库测试**: 内存SQLite + 独立测试数据库

### 目录结构
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

## 增强的错误处理策略

### 错误类型体系
```typescript
class ApiError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

// 具体错误类型
- ValidationError (400)
- UniqueConstraintError (409)
- DatabaseError (500)
```

### 事务管理
```typescript
const updateTodoWithTransaction = async (id: string, updates: any) => {
  const transaction = await sequelize.transaction();
  try {
    const todo = await Todo.findByPk(id, { transaction });
    // ... 业务逻辑
    await transaction.commit();
    return todo;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
```

## 数据库迁移策略

### 数据迁移脚本
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
```

### 零停机迁移步骤
1. 备份现有数据库
2. 在新环境中部署Sequelize版本
3. 运行数据迁移脚本
4. 切换环境变量到PostgreSQL
5. 验证功能完整性
6. 逐步回滚旧系统

## 风险评估和缓解

### 数据丢失风险
**缓解**: 迁移前备份，使用事务确保数据完整性，实现回滚机制

### 性能风险
**缓解**: 添加适当索引，监控查询性能，使用Sequelize优化功能

### 时间成本
**缓解**: 采用增量重构，并行开发和测试

## 预期收益

1. **跨平台兼容性**: 现在可以在任何支持PostgreSQL的环境中运行
2. **更好的类型安全性**: TypeScript集成更好，减少运行时错误
3. **更丰富的功能**: 事务、关联、复杂查询等
4. **更好的维护性**: 标准化的ORM模式，更好的代码组织
5. **云原生**: 完美适配Vercel的Serverless架构
6. **全面测试覆盖**: 85%+的测试覆盖率确保质量

## 回滚策略

保留旧系统直到新系统通过完整测试，确保零停机迁移。

---

**总预计时间**: 5-6小时（含测试基础设施）
**优先级**: 高 (解决平台锁定问题)
**测试覆盖率目标**: ≥85%
**依赖关系**: 无