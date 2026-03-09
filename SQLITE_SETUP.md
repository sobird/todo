# 🗄 SQLite 数据存储设置指南

## 🎉 升级完成！

您的代办事项应用现在已经升级为使用 SQLite 数据库存储！

## 📊 架构变更

### 之前的架构 (localStorage)
- ✅ 数据存储在浏览器本地
- ✅ 简单易用
- ❌ 仅限于单个浏览器
- ❌ 存储容量有限
- ❌ 无法进行复杂查询

### 新架构 (SQLite + API)
- ✅ 数据存储在服务器端 SQLite 数据库
- ✅ 支持更复杂的查询和过滤
- ✅ 更好的性能和扩展性
- ✅ 支持事务处理
- ✅ 数据完整性更好

## 🗂 文件结构变更

```
src/
├── app/
│   ├── api/
│   │   ├── todos/route.ts          # GET, POST
│   │   ├── todos/[id]/route.ts     # PUT, DELETE
│   │   └── todos/completed/route.ts # DELETE completed
│   ├── page.tsx                   # 主页面 (已更新)
│   └── layout.tsx                 # 应用布局
├── lib/
│   └── db.ts                      # 数据库连接和操作
├── hooks/
│   └── useTodos.ts               # 自定义 Hook (已更新)
└── types/
    └── todo.ts                   # 类型定义
```

## 🗄 数据库结构

```sql
CREATE TABLE todos (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🚀 API 端点

### 获取代办事项
- **GET** `/api/todos`
- **GET** `/api/todos?filter=active`
- **GET** `/api/todos?filter=completed`

### 创建代办事项
- **POST** `/api/todos`
- Body: `{ "text": "任务内容" }`

### 更新代办事项
- **PUT** `/api/todos/[id]`
- Body: `{ "text": "新内容", "completed": true }`

### 删除代办事项
- **DELETE** `/api/todos/[id]`

### 清除已完成事项
- **DELETE** `/api/todos/completed`

## 🔄 数据迁移

### 自动迁移
如果您之前使用过 localStorage 版本，需要手动迁移数据：

1. 打开浏览器开发者工具 (F12)
2. 切换到 Console 标签
3. 复制并运行 `migrate-data.js` 中的代码

### 迁移脚本
```javascript
// 在浏览器控制台运行此脚本
const migrateFromLocalStorage = async () => {
  const storedTodos = localStorage.getItem('todos');
  if (storedTodos) {
    const todos = JSON.parse(storedTodos);
    // 迁移逻辑...
  }
};
migrateFromLocalStorage();
```

## 🛠 技术细节

### 数据库文件位置
- **路径**: `./data/todos.db`
- **格式**: SQLite 3
- **自动创建**: 首次运行时自动创建

### 依赖包
- `better-sqlite3`: SQLite 数据库驱动
- `@types/better-sqlite3`: TypeScript 类型定义

### 性能优化
- **预编译 SQL**: 所有 SQL 语句都已预编译
- **连接池**: 单例数据库连接
- **事务支持**: 支持原子操作

## 🔧 配置选项

### 数据库路径
在 `src/lib/db.ts` 中修改：
```typescript
const dbPath = path.join(process.cwd(), 'data', 'todos.db');
```

### 数据库选项
可以在 `db.ts` 中添加更多 SQLite 配置：
```typescript
const db = new Database(dbPath, {
  verbose: console.log, // 启用 SQL 日志
  fileMustExist: false  // 自动创建文件
});
```

## 🚨 注意事项

### 开发环境
- SQLite 文件存储在项目根目录的 `data/` 文件夹中
- 开发时数据会持久化保存
- 可以使用 SQLite 浏览器工具查看数据

### 生产环境
- 确保部署环境支持文件系统写入
- 考虑定期备份数据库文件
- 对于高并发场景，考虑使用 PostgreSQL 或 MySQL

### 数据备份
```bash
# 备份数据库
cp data/todos.db data/todos.db.backup

# 恢复数据库
cp data/todos.db.backup data/todos.db
```

## 🔍 调试技巧

### 查看数据库内容
```bash
# 安装 SQLite 命令行工具
npm install -g sqlite3

# 查看数据库
sqlite3 data/todos.db

# SQL 查询示例
SELECT * FROM todos ORDER BY created_at DESC;
SELECT COUNT(*) as total, COUNT(CASE WHEN completed = 1 THEN 1 END) as completed FROM todos;
```

### API 测试
```bash
# 获取所有 todos
curl http://localhost:3000/api/todos

# 创建新 todo
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"text": "测试任务"}'

# 更新 todo
curl -X PUT http://localhost:3000/api/todos/[id] \
  -H "Content-Type: application/json" \
  -d '{"text": "更新后的任务", "completed": true}'
```

## 🚀 下一步建议

### 功能扩展
1. **用户系统**: 添加用户认证，支持多用户
2. **数据同步**: 实现跨设备数据同步
3. **导入导出**: 支持 CSV/JSON 格式
4. **搜索功能**: 添加全文搜索
5. **分类标签**: 支持任务分类和标签

### 性能优化
1. **缓存层**: 添加 Redis 缓存
2. **分页**: 大数据集分页加载
3. **索引优化**: 为常用查询添加数据库索引

### 部署考虑
1. **数据库迁移**: 考虑迁移到 PostgreSQL
2. **容器化**: 使用 Docker 部署
3. **监控**: 添加数据库性能监控

## 📚 参考资源

- [better-sqlite3 文档](https://github.com/WiseLibs/better-sqlite3)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/router-handlers)
- [SQLite 官方文档](https://www.sqlite.org/docs.html)

---

**享受您的新 SQLite 驱动的代办事项应用！** 🎉

*升级时间: 2026年3月10日*