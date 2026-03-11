import sequelize from './sequelize';
import models from '../models';

// 数据库连接状态管理
class DatabaseManager {
  private static instance: DatabaseManager;
  private isConnected = false;

  public get sequelize() {
    return sequelize;
  }

  public get models() {
    return models;
  }

  // 检查数据库连接状态
  public async isConnected(): Promise<boolean> {
    try {
      if (!this.isConnected) {
        await sequelize.authenticate();
        this.isConnected = true;
      }
      return true;
    } catch (error) {
      console.error('Database connection error:', error);
      return false;
    }
  }

  // 同步数据库表结构
  public async sync(options: { force?: boolean; alter?: boolean } = {}) {
    try {
      await sequelize.sync(options);
      console.log('✅ Database synchronized successfully');
    } catch (error) {
      console.error('❌ Database synchronization failed:', error);
      throw error;
    }
  }

  // 获取所有模型
  public getAllModels() {
    return models;
  }

  // 事务管理
  public async transaction<T>(
    fn: (transaction: any) => Promise<T>
  ): Promise<T> {
    const transaction = await sequelize.transaction();
    try {
      const result = await fn(transaction);
      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // 批量操作
  public async batchOperation<T>(
    operations: Array<() => Promise<T>>
  ): Promise<T[]> {
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

  // 数据库健康检查
  public async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    message: string;
    timestamp: Date;
  }> {
    try {
      const startTime = Date.now();
      await sequelize.authenticate();
      const endTime = Date.now();

      return {
        status: 'healthy',
        message: `Connection established in ${endTime - startTime}ms`,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      };
    }
  }
}

// 导出单例实例
export default new DatabaseManager();

// 导出常用模型和函数
export { sequelize, models };
export type { TodoAttributes, TodoCreationAttributes } from '../models/Todo';