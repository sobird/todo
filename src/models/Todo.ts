import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../lib/sequelize';

// Todo 接口定义
export interface TodoAttributes {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

// 用于创建新 Todo 的接口（可选字段）
export interface TodoCreationAttributes extends Optional<TodoAttributes, 'id' | 'completed' | 'createdAt'> {}

// Todo Sequelize 模型类
class Todo extends Model<TodoAttributes, TodoCreationAttributes> implements TodoAttributes {
  public id!: string;
  public text!: string;
  public completed!: boolean;
  public createdAt!: Date;

  // 自定义实例方法
  public toggleCompleted(): void {
    this.completed = !this.completed;
    this.save();
  }

  public markAsCompleted(): void {
    this.completed = true;
    this.save();
  }

  public markAsIncomplete(): void {
    this.completed = false;
    this.save();
  }

  // 格式化文本内容
  public getDisplayText(): string {
    return this.text.trim();
  }

  // 获取创建时间的时间戳
  public getCreatedTime(): number {
    return this.createdAt.getTime();
  }
}

// 初始化 Todo 模型
Todo.init({
  id: {
    type: DataTypes.STRING(36),
    primaryKey: true,
    allowNull: false,
    defaultValue: () => {
      // 生成唯一ID
      return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Todo text cannot be empty'
      },
      len: {
        args: [1, 1000],
        msg: 'Todo text must be between 1 and 1000 characters'
      }
    }
  },
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  }
}, {
  sequelize,
  tableName: 'todos',
  timestamps: false, // 因为我们已经有 createdAt
  underscored: false,
  indexes: [
    // 创建复合索引用于查询优化
    {
      fields: ['completed'],
      name: 'idx_todos_completed'
    },
    {
      fields: ['createdAt'],
      name: 'idx_todos_created_at'
    },
    {
      fields: ['completed', 'createdAt'],
      name: 'idx_todos_completed_created_at'
    }
  ],
  hooks: {
    beforeCreate: (todo: Todo) => {
      // 确保文本内容没有多余空格
      if (todo.text) {
        todo.text = todo.text.trim();
      }
    },
    beforeUpdate: (todo: Todo) => {
      // 更新时也清理文本
      if (todo.changed('text') && todo.text) {
        todo.text = todo.text.trim();
      }
    }
  }
});

export default Todo;