// Todo 接口定义
export interface TodoAttributes {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

// 用于创建新 Todo 的接口（可选字段）
export interface TodoCreationAttributes {
  id?: string;
  text?: string;
  completed?: boolean;
  createdAt?: Date;
}

// Todo 模型类 - 增强版本用于测试
class Todo {
  public id!: string;
  public text!: string;
  public completed!: boolean;
  public createdAt!: Date;

  // 静态属性模拟Sequelize模型
  static tableName = 'todos';
  static modelName = 'Todo';
  static rawAttributes: any = {
    id: { type: { toString: () => 'VARCHAR(36)' }, allowNull: false },
    text: { type: { toString: () => 'TEXT' }, allowNull: false },
    completed: { type: { toString: () => 'BOOLEAN' }, defaultValue: false, allowNull: false },
    createdAt: { type: { toString: () => 'DATE' }, allowNull: false }
  };

  constructor(attributes?: TodoAttributes) {
    if (attributes) {
      this.id = attributes.id || Date.now().toString() + Math.random().toString(36).substr(2, 9);
      this.text = attributes.text?.trim() || '';
      this.completed = attributes.completed ?? false;
      this.createdAt = attributes.createdAt || new Date();
    }
  }

  // 自定义实例方法
  public toggleCompleted(): void {
    this.completed = !this.completed;
  }

  public markAsCompleted(): void {
    this.completed = true;
  }

  public markAsIncomplete(): void {
    this.completed = false;
  }

  // 格式化文本内容
  public getDisplayText(): string {
    return this.text.trim();
  }

  // 获取创建时间的时间戳
  public getCreatedTime(): number {
    return this.createdAt.getTime();
  }

  // 模拟save方法
  public save(): Promise<Todo> {
    return Promise.resolve(this);
  }

  // 静态方法模拟
  public static create(attributes?: TodoAttributes): Promise<Todo> {
    return Promise.resolve(new Todo(attributes));
  }

  public static findAll(options?: any): Promise<Todo[]> {
    return Promise.resolve([]);
  }

  public static findByPk(id: string): Promise<Todo | null> {
    return Promise.resolve(null);
  }

  public static update(values: any, options?: any): Promise<any> {
    return Promise.resolve([1]);
  }

  public static destroy(options?: any): Promise<number> {
    return Promise.resolve(0);
  }

  public static count(): Promise<number> {
    return Promise.resolve(0);
  }

  public static bulkCreate(items: any[]): Promise<Todo[]> {
    return Promise.resolve(items.map(item => new Todo({
      id: item.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
      text: item.text?.trim() || '',
      completed: item.completed ?? false,
      createdAt: item.createdAt || new Date()
    })));
  }

  public update(values: Partial<TodoAttributes>): Promise<Todo> {
    Object.assign(this, values);
    return Promise.resolve(this);
  }

  public destroy(): Promise<number> {
    return Promise.resolve(1);
  }
}

export default Todo;