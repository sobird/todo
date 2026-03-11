import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import sequelize from '@/lib/sequelize';
import Todo from '@/models/Todo';

describe('Database Integration Tests', () => {
  beforeAll(async () => {
    // 同步数据库以创建所有表
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    // 关闭数据库连接
    await sequelize.close();
  });

  beforeEach(async () => {
    // 在每个测试前清理数据
    await Todo.destroy({ where: {}, truncate: true });
  });

  it('should connect to database successfully', async () => {
    await expect(sequelize.authenticate()).resolves.not.toThrow();
  });

  it('should create and retrieve todos with full CRUD operations', async () => {
    // Create
    const todo = await Todo.create({
      text: 'Complete integration testing',
      completed: false
    });

    expect(todo.id).toBeDefined();
    expect(todo.text).toBe('Complete integration testing');
    expect(todo.completed).toBe(false);

    // Read (find)
    const foundTodo = await Todo.findByPk(todo.id);
    expect(foundTodo).toBeDefined();
    expect(foundTodo?.text).toBe(todo.text);
    expect(foundTodo?.completed).toBe(todo.completed);

    // Update
    await todo.update({ completed: true });
    await todo.reload();
    expect(todo.completed).toBe(true);

    // Delete
    await todo.destroy();
    const deletedTodo = await Todo.findByPk(todo.id);
    expect(deletedTodo).toBeNull();
  });

  it('should handle complex queries correctly', async () => {
    // 准备测试数据
    await Todo.bulkCreate([
      { text: 'Active task 1', completed: false },
      { text: 'Active task 2', completed: false },
      { text: 'Completed task 1', completed: true },
      { text: 'Completed task 2', completed: true }
    ]);

    // 查询活跃任务
    const activeTasks = await Todo.findAll({
      where: { completed: false },
      order: [['createdAt', 'DESC']]
    });

    expect(activeTasks.length).toBe(2);
    activeTasks.forEach(task => expect(task.completed).toBe(false));

    // 查询已完成任务
    const completedTasks = await Todo.findAll({
      where: { completed: true },
      order: [['createdAt', 'ASC']]
    });

    expect(completedTasks.length).toBe(2);
    completedTasks.forEach(task => expect(task.completed).toBe(true));

    // 统计总数
    const totalCount = await Todo.count();
    expect(totalCount).toBe(4);
  });

  it('should maintain referential integrity', async () => {
    // 测试数据完整性约束
    const validTodo = { text: 'Valid todo' };
    const invalidTodo = { text: '' };

    // 验证有效数据可以创建
    await expect(Todo.create(validTodo)).resolves.not.toBeNull();

    // 验证无效数据会被拒绝
    await expect(Todo.create(invalidTodo)).rejects.toThrow();

    // 验证空对象也会被拒绝
    await expect(Todo.create({})).rejects.toThrow();
  });

  it('should handle transactions correctly', async () => {
    const transaction = await sequelize.transaction();

    try {
      // 在事务中创建多个 todo
      const todo1 = await Todo.create({
        text: 'Transaction todo 1',
        completed: false
      }, { transaction });

      const todo2 = await Todo.create({
        text: 'Transaction todo 2',
        completed: true
      }, { transaction });

      // 验证事务内数据
      expect(todo1.id).toBeDefined();
      expect(todo2.id).toBeDefined();
      expect(todo1.id).not.toBe(todo2.id);

      // 提交事务
      await transaction.commit();

      // 验证事务后数据仍然存在
      const foundTodo1 = await Todo.findByPk(todo1.id);
      const foundTodo2 = await Todo.findByPk(todo2.id);

      expect(foundTodo1).toBeDefined();
      expect(foundTodo2).toBeDefined();

    } catch (error) {
      // 如果发生错误，回滚事务
      await transaction.rollback();
      throw error;
    }

    // 验证事务回滚后的计数（如果发生错误）
    const finalCount = await Todo.count();
    expect(finalCount).toBeGreaterThanOrEqual(0);
  });

  it('should handle concurrent operations', async () => {
    // 同时创建多个 todo
    const promises = Array.from({ length: 10 }, (_, i) =>
      Todo.create({
        text: `Concurrent todo ${i + 1}`,
        completed: i % 2 === 0
      })
    );

    const todos = await Promise.all(promises);
    expect(todos.length).toBe(10);

    // 验证所有 todo 都有唯一 ID
    const uniqueIds = new Set(todos.map(t => t.id));
    expect(uniqueIds.size).toBe(10);

    // 验证一半是活跃的，一半是已完成的
    const completedCount = todos.filter(t => t.completed).length;
    expect(completedCount).toBe(5);
  });

  it('should enforce database constraints', async () => {
    // 测试 NOT NULL 约束
    await expect(
      Todo.create({ text: null as any })
    ).rejects.toThrow();

    // Test that completed field uses default value when not provided
    await expect(
      Todo.create({ text: 'Test default completed' })
    ).resolves.not.toBeNull();

    // 测试唯一性约束（ID 自动生成，不需要手动设置）
    const firstTodo = await Todo.create({ text: 'First' });
    const secondTodo = await Todo.create({ text: 'Second' });

    expect(firstTodo.id).not.toBe(secondTodo.id);
  });

  it('should handle large datasets efficiently', async () => {
    // 批量创建大量数据
    const bulkData = Array.from({ length: 100 }, (_, i) => ({
      text: `Bulk item ${i + 1}`,
      completed: i < 50 // 前50个未完成，后50个已完成
    }));

    const startTime = Date.now();
    await Todo.bulkCreate(bulkData);
    const creationTime = Date.now() - startTime;

    console.log(`Created 100 todos in ${creationTime}ms`);

    // 验证数据创建成功
    const count = await Todo.count();
    expect(count).toBe(100);

    // 验证查询性能
    const queryStart = Date.now();
    const allTodos = await Todo.findAll();
    const queryTime = Date.now() - queryStart;

    console.log(`Queried 100 todos in ${queryTime}ms`);
    expect(allTodos.length).toBe(100);
    expect(queryTime).toBeLessThan(1000); // 查询应在1秒内完成
  });

  it('should handle edge cases gracefully', async () => {
    // Unicode 文本
    const unicodeText = '测试 Todo 🚀 ñáéíóú';
    const unicodeTodo = await Todo.create({ text: unicodeText });
    expect(unicodeTodo.text).toBe(unicodeText);

    // 长文本（边界情况）
    const longText = 'A'.repeat(1000); // 最大长度
    const longTodo = await Todo.create({ text: longText });
    expect(longTodo.text).toBe(longText);

    // 特殊字符文本
    const specialText = 'Todo with "quotes" and \'apostrophes\' & symbols!@#$%^&*()';
    const specialTodo = await Todo.create({ text: specialText });
    expect(specialTodo.text).toBe(specialText);

    // 混合语言文本
    const mixedText = 'English 中文 العربية Русский Español Français';
    const mixedTodo = await Todo.create({ text: mixedText });
    expect(mixedTodo.text).toBe(mixedText);
  });

  it('should provide accurate timestamps', async () => {
    const beforeCreation = Date.now();

    const todo = await Todo.create({ text: 'Timestamp test' });
    const afterCreation = Date.now();

    // 验证创建时间戳在合理范围内
    expect(todo.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreation);
    expect(todo.createdAt.getTime()).toBeLessThanOrEqual(afterCreation);

    // 验证时间戳格式正确
    expect(todo.createdAt.getFullYear()).toBe(new Date().getFullYear());
    expect(todo.createdAt.getMonth()).toBe(new Date().getMonth());
    expect(todo.createdAt.getDate()).toBe(new Date().getDate());

    // 验证时间戳是有效的日期对象
    expect(isNaN(todo.createdAt.getTime())).toBe(false);
  });
});