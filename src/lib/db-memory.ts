// 内存数据库实现 - 用于开发环境
class InMemoryDatabase {
  private todos: Array<{
    id: string;
    text: string;
    completed: boolean;
    createdAt: Date;
  }> = [];

  // Get all todos with optional filtering
  async findAll(options: { where?: any; order?: any[] } = {}): Promise<any[]> {
    let filteredTodos = [...this.todos];

    if (options.where) {
      if (options.where.completed !== undefined) {
        filteredTodos = filteredTodos.filter(todo => todo.completed === options.where.completed);
      }
    }

    if (options.order && options.order[0] && options.order[0][0]) {
      const [field, direction] = options.order[0];
      filteredTodos.sort((a, b) => {
        if (direction === 'DESC') {
          return b[field].getTime ? b[field].getTime() - a[field].getTime() : 0;
        } else {
          return a[field].getTime ? a[field].getTime() - b[field].getTime() : 0;
        }
      });
    }

    return filteredTodos;
  }

  // Create a new todo
  async create(data: any): Promise<any> {
    const todo = {
      id: data.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
      text: data.text,
      completed: data.completed ?? false,
      createdAt: data.createdAt || new Date()
    };

    // Clean text content
    todo.text = todo.text.trim();

    this.todos.push(todo);
    return todo;
  }

  // Find todo by ID
  async findByPk(id: string): Promise<any | null> {
    return this.todos.find(todo => todo.id === id) || null;
  }

  // Update todo
  async update(data: any, options?: any): Promise<any[]> {
    const index = this.todos.findIndex(todo => todo.id === data.id);
    if (index !== -1) {
      this.todos[index] = { ...this.todos[index], ...data };
      // Clean text content on update
      if (data.text) {
        this.todos[index].text = data.text.trim();
      }
    }
    return [1]; // Return affected count
  }

  // Delete todo
  async destroy(options?: any): Promise<number> {
    const initialLength = this.todos.length;
    if (options?.where?.id) {
      this.todos = this.todos.filter(todo => todo.id !== options.where.id);
    } else if (Array.isArray(options)) {
      // Handle array of IDs or other complex options
      this.todos = this.todos.filter(todo => !options.some((opt: any) => opt.id === todo.id));
    } else if (options?.where && Object.keys(options.where).length === 0) {
      // Handle empty where clause (clear all)
      this.todos = [];
    } else if (!options || !options.where) {
      // No options or where clause provided, clear all
      this.todos = [];
    }
    return initialLength - this.todos.length;
  }

  // Health check
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    message: string;
    timestamp: Date;
  }> {
    return {
      status: 'healthy',
      message: 'In-memory database is running',
      timestamp: new Date()
    };
  }

  // Sync (no-op for in-memory)
  async sync(options: { force?: boolean; alter?: boolean } = {}): Promise<void> {
    console.log('✅ Database synchronized successfully (in-memory)');
  }

  // Transaction support (simple implementation)
  async transaction<T>(fn: () => Promise<T>): Promise<T> {
    try {
      const result = await fn();
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Batch operations
  async batchOperation<T>(operations: Array<() => Promise<T>>): Promise<T[]> {
    const results: T[] = [];
    for (const operation of operations) {
      try {
        const result = await operation();
        results.push(result);
      } catch (error) {
        console.error('Batch operation failed:', error);
        throw error;
      }
    }
    return results;
  }
}

// Export singleton instance
export default new InMemoryDatabase();