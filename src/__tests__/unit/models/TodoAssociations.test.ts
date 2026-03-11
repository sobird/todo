import { describe, it, expect } from 'vitest';
import sequelize from '@/lib/sequelize';
import Todo from '@/models/Todo';

describe('Todo Model Associations', () => {
  beforeAll(async () => {
    // 同步数据库
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    // 关闭连接
    await sequelize.close();
  });

  it('should define model associations correctly', async () => {
    // 验证模型定义
    expect(Todo).toBeDefined();
    expect(Todo.tableName).toBe('todos');

    // 验证索引配置
    const indexes = Todo.options.indexes || [];
    const completedIndex = indexes.find(idx => idx.name === 'idx_todos_completed');
    const createdAtIndex = indexes.find(idx => idx.name === 'idx_todos_created_at');
    const compositeIndex = indexes.find(idx => idx.name === 'idx_todos_completed_created_at');

    expect(completedIndex).toBeDefined();
    expect(createdAtIndex).toBeDefined();
    expect(compositeIndex).toBeDefined();
  });

  it('should have proper field definitions', async () => {
    // 验证字段类型
    const fields = Todo.rawAttributes;

    expect(fields.id.type.toString()).toContain('STRING');
    expect(fields.text.type.toString()).toContain('TEXT');
    expect(fields.completed.type.toString()).toContain('BOOLEAN');
    expect(fields.createdAt.type.toString()).toContain('DATE');

    // 验证约束
    expect(fields.id.allowNull).toBe(false);
    expect(fields.text.allowNull).toBe(false);
    expect(fields.completed.defaultValue).toBe(false);
  });

  it('should have proper validation rules', async () => {
    // 验证文本长度约束
    const textField = Todo.rawAttributes.text;
    const validation = textField.validate as any;
    expect(validation.len.args).toEqual([1, 1000]);
  });

  it('should have hooks configured', async () => {
    // 验证钩子配置
    const hooks = Todo.options.hooks;
    expect(hooks.beforeCreate).toBeDefined();
    expect(hooks.beforeUpdate).toBeDefined();
  });
});