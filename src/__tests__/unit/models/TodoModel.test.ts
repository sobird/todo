import { describe, it, expect, beforeEach } from 'vitest';
import inMemoryDb from '@/lib/db-memory';

describe('Todo Model - Complete Unit Tests', () => {
  beforeEach(async () => {
    // 在每个测试前清理内存数据库
    await inMemoryDb.destroy({ where: {} });
  });

  it('should create a todo with valid data', async () => {
    const todo = await inMemoryDb.create({
      text: 'Complete the testing phase'
    });

    expect(todo.text).toBe('Complete the testing phase');
    expect(todo.completed).toBe(false);
    expect(todo.id).toBeDefined();
    expect(todo.createdAt).toBeInstanceOf(Date);
    expect(todo.text.length).toBeGreaterThan(0);
  });

  it('should generate unique ID for each todo', async () => {
    const todo1 = await inMemoryDb.create({ text: 'First todo' });
    const todo2 = await inMemoryDb.create({ text: 'Second todo' });

    expect(todo1.id).not.toBe(todo2.id);
    expect(todo1.id).toMatch(/^\d+[0-9a-z]+$/); // 时间戳 + 随机字符格式
    expect(todo2.id).toMatch(/^\d+[0-9a-z]+$/);
  });

  it('should trim whitespace from text automatically', async () => {
    const todo = await inMemoryDb.create({
      text: '   Text with leading and trailing spaces   '
    });

    expect(todo.text).toBe('Text with leading and trailing spaces');
  });

  it('should default completed to false', async () => {
    const todo = await inMemoryDb.create({
      text: 'Should be incomplete by default'
    });

    expect(todo.completed).toBe(false);
  });

  it('should allow explicit completion status', async () => {
    const completedTodo = await inMemoryDb.create({
      text: 'Marked as completed',
      completed: true
    });

    expect(completedTodo.completed).toBe(true);

    const incompleteTodo = await inMemoryDb.create({
      text: 'Explicitly marked as incomplete',
      completed: false
    });

    expect(incompleteTodo.completed).toBe(false);
  });

  it('should auto-set createdAt timestamp', async () => {
    const beforeCreation = new Date();
    const todo = await inMemoryDb.create({ text: 'Auto timestamp test' });
    const afterCreation = new Date();

    expect(todo.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
    expect(todo.createdAt.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
  });

  it('should query todos correctly', async () => {
    // 创建测试数据
    await inMemoryDb.create({ text: 'Active todo 1', completed: false });
    await inMemoryDb.create({ text: 'Active todo 2', completed: false });
    await inMemoryDb.create({ text: 'Completed todo 1', completed: true });
    await inMemoryDb.create({ text: 'Completed todo 2', completed: true });

    // 测试查询所有 todo
    const allTodos = await inMemoryDb.findAll();
    expect(allTodos.length).toBe(4);

    // 测试查询活跃 todo
    const activeTodos = await inMemoryDb.findAll({ where: { completed: false } });
    expect(activeTodos.length).toBe(2);
    activeTodos.forEach(todo => expect(todo.completed).toBe(false));

    // 测试查询已完成 todo
    const completedTodos = await inMemoryDb.findAll({ where: { completed: true } });
    expect(completedTodos.length).toBe(2);
    completedTodos.forEach(todo => expect(todo.completed).toBe(true));
  });

  it('should find todo by ID correctly', async () => {
    const createdTodo = await inMemoryDb.create({ text: 'Find me' });

    const foundTodo = await inMemoryDb.findByPk(createdTodo.id);
    expect(foundTodo).toBeDefined();
    expect(foundTodo?.id).toBe(createdTodo.id);
    expect(foundTodo?.text).toBe('Find me');

    // 测试查找不存在的 todo
    const notFound = await inMemoryDb.findByPk('non-existent-id');
    expect(notFound).toBeNull();
  });

  it('should update todo correctly', async () => {
    const todo = await inMemoryDb.create({ text: 'Original text', completed: false });

    // 更新文本
    await inMemoryDb.update({ id: todo.id, text: 'Updated text' });
    const updatedTodo = await inMemoryDb.findByPk(todo.id);
    expect(updatedTodo?.text).toBe('Updated text');

    // 更新完成状态
    await inMemoryDb.update({ id: todo.id, completed: true });
    const completedTodo = await inMemoryDb.findByPk(todo.id);
    expect(completedTodo?.completed).toBe(true);
  });

  it('should delete todo correctly', async () => {
    const todo = await inMemoryDb.create({ text: 'To be deleted' });

    const id = todo.id;
    await inMemoryDb.destroy({ where: { id } });

    // 验证已删除
    const foundTodo = await inMemoryDb.findByPk(id);
    expect(foundTodo).toBeNull();
  });
});