import { Sequelize } from 'sequelize';

// 根据环境变量选择数据库配置
const isProduction = process.env.NODE_ENV === 'production';
let databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

// 确保URL有正确的前缀
if (databaseUrl && !databaseUrl.startsWith('sqlite:') && !databaseUrl.startsWith('postgres://')) {
  if (databaseUrl.includes('postgresql://')) {
    databaseUrl = databaseUrl.replace('postgresql://', 'postgres://');
  } else if (!databaseUrl.includes('://')) {
    databaseUrl = 'postgres://' + databaseUrl;
  }
}

// 在构建时跳过数据库验证
const isBuildTime = process.env.NEXT_BUILD;
let sequelize;

if (isBuildTime) {
  // 构建期间创建虚拟实例
  sequelize = {
    authenticate: () => Promise.resolve(true),
    sync: () => Promise.resolve(),
    close: () => Promise.resolve(),
    transaction: () => Promise.resolve({ commit: () => {}, rollback: () => {} })
  };
} else {
  if (!databaseUrl) {
    console.warn('DATABASE_URL or POSTGRES_URL not set, using mock for development');
    databaseUrl = 'sqlite::memory:';
  }

  // 根据URL自动检测方言
  const getDialectFromUrl = (url: string): string => {
    if (url.startsWith('sqlite:')) {
      return 'sqlite';
    }
    return 'postgres'; // 默认使用PostgreSQL
  };

  const dialect = getDialectFromUrl(databaseUrl);

  // 配置选项
  const config: any = {
    dialect: dialect,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    // 连接重试配置
    retry: {
      match: [
        /ETIMEDOUT/,
        /EHOSTUNREACH/,
        /ECONNRESET/,
        /ECONNREFUSED/,
        /ESOCKETTIMEDOUT/,
      ],
      name: 'QueryTimedOutError',
      backoffBase: 100,
      backoffExponent: 1.5,
      timeout: 10000,
      max: 5,
    }
  };

  // SQLite 特定配置
  if (dialect === 'sqlite') {
    config.storage = databaseUrl.replace('sqlite:', '');
  } else {
    // PostgreSQL 特定配置
    if (!isProduction) {
      config.ssl = false;
    } else {
      config.ssl = { rejectUnauthorized: false };
      config.dialectOptions = {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      };
    }
  }

  try {
    // 创建 Sequelize 实例
    sequelize = new Sequelize(databaseUrl, config);
  } catch (error) {
    console.error('Failed to create Sequelize instance:', error);
    // 降级到简单mock
    sequelize = {
      authenticate: () => Promise.resolve(true),
      sync: () => Promise.resolve(),
      close: () => Promise.resolve(),
      transaction: () => Promise.resolve({ commit: () => {}, rollback: () => {} })
    };
  }
}

export default sequelize;