import { describe, it, expect } from 'vitest';
import { sequelize } from '@/lib/db';

describe('Sequelize Database Connection', () => {
  it('should connect to database successfully', async () => {
    await expect(sequelize.authenticate()).resolves.not.toThrow();
  });

  it('should define Todo model correctly', async () => {
    const todoModel = sequelize.models.Todo;
    expect(todoModel).toBeDefined();
    expect(todoModel?.name).toBe('Todo');
  });
});