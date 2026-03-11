import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import sequelize from '@/lib/sequelize';
import Todo from '@/models/Todo';

describe('Todo Model - Complete Unit Tests', () => {
  beforeAll(async () => {
    // 同步数据库以创建表结构
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

  it('should create a todo with valid data', async () => {
    const todo = await Todo.create({
      text: 'Complete the testing phase'
    });

    expect(todo.text).toBe('Complete the testing phase');
    expect(todo.completed).toBe(false);
    expect(todo.id).toBeDefined();
    expect(todo.createdAt).toBeInstanceOf(Date);
    expect(todo.text.length).toBeGreaterThan(0);
  });

  it('should generate unique ID for each todo', async () => {
    const todo1 = await Todo.create({ text: 'First todo' });
    const todo2 = await Todo.create({ text: 'Second todo' });

    expect(todo1.id).not.toBe(todo2.id);
    expect(todo1.id).toMatch(/^\d+[0-9a-z]+$/); // 时间戳 + 随机字符格式
    expect(todo2.id).toMatch(/^\d+[0-9a-z]+$/);
  });

  it('should trim whitespace from text automatically', async () => {
    const todo = await Todo.create({
      text: '   Text with leading and trailing spaces   '
    });

    expect(todo.text).toBe('Text with leading and trailing spaces');
  });

  it('should validate required text field', async () => {
    await expect(
      Todo.create({})
    ).rejects.toThrow();

    await expect(
      Todo.create({ text: '' })
    ).rejects.toThrow('Validation error');

    await expect(
      Todo.create({ text: null as any })
    ).rejects.toThrow();
  });

  it('should enforce text length validation (1-1000 characters)', async () => {
    // 测试最小长度
    await expect(
      Todo.create({ text: 'A' }) // 1 character
    ).resolves.not.toBeNull();

    // 测试最大长度
    const maxText = 'A'.repeat(1000);
    await expect(
      Todo.create({ text: maxText })
    ).resolves.not.toBeNull();

    // 测试超过最大长度
    const tooLongText = 'A'.repeat(1001);
    await expect(
      Todo.create({ text: tooLongText })
    ).rejects.toThrow('Validation error');

    // 测试空文本
    await expect(
      Todo.create({ text: '' })
    ).rejects.toThrow('Validation error');
  });

  it('should default completed to false', async () => {
    const todo = await Todo.create({
      text: 'Should be incomplete by default'
    });

    expect(todo.completed).toBe(false);
  });

  it('should allow explicit completion status', async () => {
    const completedTodo = await Todo.create({
      text: 'Marked as completed',
      completed: true
    });

    expect(completedTodo.completed).toBe(true);

    const incompleteTodo = await Todo.create({
      text: 'Explicitly marked as incomplete',
      completed: false
    });

    expect(incompleteTodo.completed).toBe(false);
  });

  it('should auto-set createdAt timestamp', async () => {
    const beforeCreation = new Date();
    const todo = await Todo.create({ text: 'Auto timestamp test' });
    const afterCreation = new Date();

    expect(todo.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
    expect(todo.createdAt.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
  });

  it('should provide custom instance methods', async () => {
    const todo = await Todo.create({ text: 'Test methods' });

    // 验证方法存在
    expect(typeof todo.toggleCompleted).toBe('function');
    expect(typeof todo.markAsCompleted).toBe('function');
    expect(typeof todo.markAsIncomplete).toBe('function');
    expect(typeof todo.getDisplayText).toBe('function');
    expect(typeof todo.getCreatedTime).toBe('function');

    // 测试 toggleCompleted
    const originalStatus = todo.completed;
    todo.toggleCompleted();
    await todo.reload(); // 重新加载从数据库获取最新状态
    expect(todo.completed).toBe(!originalStatus);

    // 测试 markAsCompleted
    todo.markAsCompleted();
    await todo.reload();
    expect(todo.completed).toBe(true);

    // 测试 markAsIncomplete
    todo.markAsIncomplete();
    await todo.reload();
    expect(todo.completed).toBe(false);

    // 测试 getDisplayText
    expect(todo.getDisplayText()).toBe(todo.text.trim());

    // 测试 getCreatedTime
    expect(todo.getCreatedTime()).toBe(todo.createdAt.getTime());
  });

  it('should query todos correctly', async () => {
    // 创建测试数据
    await Todo.bulkCreate([
      { text: 'Active todo 1', completed: false },
      { text: 'Active todo 2', completed: false },
      { text: 'Completed todo 1', completed: true },
      { text: 'Completed todo 2', completed: true }
    ]);

    // 测试查询所有 todo
    const allTodos = await Todo.findAll();
    expect(allTodos.length).toBe(4);

    // 测试查询活跃 todo
    const activeTodos = await Todo.findAll({ where: { completed: false } });
    expect(activeTodos.length).toBe(2);
    activeTodos.forEach(todo => expect(todo.completed).toBe(false));

    // 测试查询已完成 todo
    const completedTodos = await Todo.findAll({ where: { completed: true } });
    expect(completedTodos.length).toBe(2);
    completedTodos.forEach(todo => expect(todo.completed).toBe(true));

    // 测试按创建时间排序
    const orderedTodos = await Todo.findAll({
      order: [['createdAt', 'DESC']]
    });
    expect(orderedTodos.length).toBe(4);
    // 最后一个创建的应该是第一个返回的（降序）
    expect(orderedTodos[0].text).toBe('Completed todo 2');
  });

  it('should find todo by ID correctly', async () => {
    const createdTodo = await Todo.create({ text: 'Find me' });

    const foundTodo = await Todo.findByPk(createdTodo.id);
    expect(foundTodo).toBeDefined();
    expect(foundTodo?.id).toBe(createdTodo.id);
    expect(foundTodo?.text).toBe('Find me');

    // 测试查找不存在的 todo
    const notFound = await Todo.findByPk('non-existent-id');
    expect(notFound).toBeNull();
  });

  it('should update todo correctly', async () => {
    const todo = await Todo.create({ text: 'Original text', completed: false });

    // 更新文本
    await todo.update({ text: 'Updated text' });
    await todo.reload();
    expect(todo.text).toBe('Updated text');

    // 更新完成状态
    await todo.update({ completed: true });
    await todo.reload();
    expect(todo.completed).toBe(true);

    // 同时更新多个字段
    await todo.update({
      text: 'Fully updated',
      completed: false
    });
    await todo.reload();
    expect(todo.text).toBe('Fully updated');
    expect(todo.completed).toBe(false);
  });

  it('should delete todo correctly', async () => {
    const todo = await Todo.create({ text: 'To be deleted' });

    const id = todo.id;
    await todo.destroy();

    // 验证已删除
    const foundTodo = await Todo.findByPk(id);
    expect(foundTodo).toBeNull();
  });

  it('should handle bulk operations', async () => {
    // 批量创建
    const todosData = [
      { text: 'Bulk todo 1' },
      { text: 'Bulk todo 2' },
      { text: 'Bulk todo 3' }
    ];

    const createdTodos = await Todo.bulkCreate(todosData);
    expect(createdTodos.length).toBe(3);

    // 批量更新
    await Todo.update(
      { completed: true },
      { where: { text: { [require('sequelize').Op.in]: ['Bulk todo 1', 'Bulk todo 2'] } } }
    );

    const bulkUpdated = await Todo.findAll({
      where: { text: { [require('sequelize').Op.in]: ['Bulk todo 1', 'Bulk todo 2'] } }
    });
    expect(bulkUpdated.every(t => t.completed)).toBe(true);

    // 批量删除
    await Todo.destroy({
      where: { text: { [require('sequelize').Op.in]: ['Bulk todo 2', 'Bulk todo 3'] } }
    });

    const remaining = await Todo.count();
    expect(remaining).toBe(1); // 应该只剩 Bulk todo 1
  });

  it('should maintain data integrity', async () => {
    // 创建多个 todo
    const todo1 = await Todo.create({ text: 'First', completed: false });
    const todo2 = await Todo.create({ text: 'Second', completed: true });

    // 验证数据完整性
    expect(todo1.id).toBeDefined();
    expect(todo1.text).toBe('First');
    expect(todo1.completed).toBe(false);
    expect(todo1.createdAt).toBeInstanceOf(Date);

    expect(todo2.id).toBeDefined();
    expect(todo2.text).toBe('Second');
    expect(todo2.completed).toBe(true);
    expect(todo2.createdAt).toBeInstanceOf(Date);

    // 验证两个 todo 有不同的 ID
    expect(todo1.id).not.toBe(todo2.id);
  });
});