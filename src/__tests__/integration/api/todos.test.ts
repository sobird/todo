import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createNextApiHandler } from '@trpc/server/adapters/next';
import { appRouter } from '@/server/router';

describe('Todos API Integration Tests', () => {
  let server: any;

  beforeEach(() => {
    // 设置测试服务器
    server = createNextApiHandler({
      router: appRouter,
      createContext: () => ({}),
    });
  });

  it('should handle GET /api/todos', async () => {
    const response = await request(server)
      .get('/api/todos')
      .expect(200);

    expect(response.body).toBeDefined();
  });

  it('should handle POST /api/todos', async () => {
    const response = await request(server)
      .post('/api/todos')
      .send({ text: 'New todo item' })
      .expect(201);

    expect(response.body.text).toBe('New todo item');
    expect(response.body.completed).toBe(false);
  });

  it('should validate required fields', async () => {
    const response = await request(server)
      .post('/api/todos')
      .send({})
      .expect(400);

    expect(response.body.error).toBeDefined();
  });
});