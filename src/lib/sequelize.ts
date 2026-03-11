import { Sequelize } from 'sequelize';

// 根据环境变量选择数据库配置
const isProduction = process.env.NODE_ENV === 'production';
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL or POSTGRES_URL environment variable is required');
}

// 创建 Sequelize 实例
const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  // PostgreSQL 特定配置
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  dialectOptions: {
    // 生产环境的 SSL 配置
    ...(isProduction && {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    })
  },
  // 连接重试配置
  retry: {
    match: [
      /ETIMEDOUT/,
      /EHOSTUNREACH/,
      /ECONNRESET/,
      /ECONNREFUSED/,
      /ETIMEDOUT/,
      /ESOCKETTIMEDOUT/,
    ],
    name: 'QueryTimedOutError',
    backoffBase: 100,
    backoffExponent: 1.5,
    timeout: 10000,
    max: 5,
  }
});

export default sequelize;