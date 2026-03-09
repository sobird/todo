import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// 确保数据库目录存在
const dbDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// 数据库文件路径
const dbPath = path.join(dbDir, 'todos.db');

// 创建数据库连接
const db = new Database(dbPath);

// 初始化数据库表
db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id TEXT PRIMARY KEY,
    text TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// 准备 SQL 语句
const statements = {
  // 获取所有 todos
  getAllTodos: db.prepare(`
    SELECT id, text, completed, created_at as createdAt
    FROM todos
    ORDER BY created_at DESC
  `),

  // 根据过滤条件获取 todos
  getFilteredTodos: db.prepare(`
    SELECT id, text, completed, created_at as createdAt
    FROM todos
    WHERE
      CASE ?
        WHEN 'active' THEN completed = 0
        WHEN 'completed' THEN completed = 1
        ELSE 1=1
      END
    ORDER BY created_at DESC
  `),

  // 创建新 todo
  createTodo: db.prepare(`
    INSERT INTO todos (id, text, completed, created_at)
    VALUES (?, ?, ?, ?)
  `),

  // 更新 todo
  updateTodo: db.prepare(`
    UPDATE todos
    SET text = ?, completed = ?
    WHERE id = ?
  `),

  // 删除 todo
  deleteTodo: db.prepare(`
    DELETE FROM todos
    WHERE id = ?
  `),

  // 清除已完成的 todos
  clearCompleted: db.prepare(`
    DELETE FROM todos
    WHERE completed = 1
  `),

  // 获取统计信息
  getStats: db.prepare(`
    SELECT
      COUNT(*) as total,
      COUNT(CASE WHEN completed = 0 THEN 1 END) as active,
      COUNT(CASE WHEN completed = 1 THEN 1 END) as completed
    FROM todos
  `)
};

export interface TodoRow {
  id: string;
  text: string;
  completed: number; // SQLite 返回数字
  createdAt: string;
}

export interface TodoStats {
  total: number;
  active: number;
  completed: number;
}

export const dbOperations = {
  // 获取所有 todos
  getAllTodos: (): TodoRow[] => {
    return statements.getAllTodos.all() as TodoRow[];
  },

  // 根据过滤条件获取 todos
  getFilteredTodos: (filter: string): TodoRow[] => {
    return statements.getFilteredTodos.all(filter) as TodoRow[];
  },

  // 创建新 todo
  createTodo: (id: string, text: string, createdAt: Date) => {
    return statements.createTodo.run(id, text, 0, createdAt.toISOString());
  },

  // 更新 todo
  updateTodo: (id: string, text: string, completed: boolean) => {
    return statements.updateTodo.run(text, completed ? 1 : 0, id);
  },

  // 删除 todo
  deleteTodo: (id: string) => {
    return statements.deleteTodo.run(id);
  },

  // 清除已完成的 todos
  clearCompleted: () => {
    return statements.clearCompleted.run();
  },

  // 获取统计信息
  getStats: (): TodoStats => {
    return statements.getStats.get() as TodoStats;
  }
};

export default db;