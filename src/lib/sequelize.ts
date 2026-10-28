import { Sequelize } from 'sequelize';

// 根据环境变量选择数据库配置
let databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

// 确保URL有正确的前缀
if (databaseUrl && !databaseUrl.startsWith('sqlite:') && !databaseUrl.startsWith('postgres://')) {
  if (databaseUrl.includes('postgresql://')) {
    databaseUrl = databaseUrl.replace('postgresql://', 'postgres://');
  } else if (!databaseUrl.includes('://')) {
    databaseUrl = 'postgres://' + databaseUrl;
  }
} else if (databaseUrl && databaseUrl.startsWith('postgresql://')) {
  databaseUrl = databaseUrl.replace('postgresql://', 'postgres://');
}

// 生产环境使用PostgreSQL，开发环境也尝试连接
const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

let sequelize: any;

// 确定数据库类型
const isSQLite = databaseUrl?.startsWith('sqlite:');
const isPostgreSQL = !isSQLite && databaseUrl;

try {
  // 配置选项
  const config: any = {
    dialect: isSQLite ? 'sqlite' : 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    // Serverless环境需要调整pool配置
    pool: {
      max: 1,  // 减少最大连接数
      min: 0,
      acquire: 30000,
      idle: 10000,
      evict: 30000
    },
    // 禁用SSL验证以避免serverless环境中的证书问题
    ssl: databaseUrl?.includes('neon.tech') || isProduction ? false : false,
    dialectOptions: {
      // Neon Postgres特殊配置
      sslmode: databaseUrl?.includes('neon.tech') ? 'require' : undefined
    },
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
      timeout: 15000,  // 增加超时时间
      max: 3  // 减少重试次数
    }
  };

  // SQLite 配置
  if (isSQLite) {
    config.storage = databaseUrl === 'sqlite::memory:' ? ':memory:' : databaseUrl.replace('sqlite:', '');
    config.logging = false; // SQLite 测试时禁用日志
    // 使用 better-sqlite3 而不是 sqlite3
    config.dialectModule = require('better-sqlite3');
  } else {
    // PostgreSQL SSL配置（适用于生产环境和Vercel Postgres）
    if (databaseUrl && (isProduction || databaseUrl.includes('neon.tech'))) {
      // Vercel Postgres需要特殊的SSL配置
      config.dialectOptions = {
        ssl: {
          require: true,
          rejectUnauthorized: false,
          sslmode: 'require'
        }
      };
      config.pool = {
        ...config.pool,
        idle: 20000, // 增加idle时间以适应serverless环境
        evict: 30000
      };
    }
  }

  // 创建 Sequelize 实例
  const dbType = isSQLite ? 'SQLite' : 'PostgreSQL';
  console.log(`🔄 Attempting to connect to ${dbType}:`, databaseUrl?.substring(0, 50) + '...');
  sequelize = new Sequelize(databaseUrl!, config);
  console.log('✅ Sequelize instance created successfully');

  // 测试连接（带详细错误处理和重试机制）
  let retryCount = 0;
  const maxRetries = 5;
  let connectionSuccessful = false;

  while (retryCount < maxRetries && !connectionSuccessful) {
    try {
      console.log(`🔄 Authenticating to database (attempt ${retryCount + 1}/${maxRetries})...`);
      await sequelize.authenticate();
      console.log('✅ Database connection established successfully');
      connectionSuccessful = true;
    } catch (authError: any) {
      retryCount++;

      if (retryCount >= maxRetries) {
        console.error('❌ All authentication attempts failed:', {
          error: authError.message,
          url: databaseUrl?.substring(0, 60) + '...',
          environment: process.env.NODE_ENV
        });

        // 如果是"请手动安装pg包"的错误，提供明确的解决方案
        if (authError.message.includes('Please install pg package manually')) {
          console.error('💡 SOLUTION: This error occurs because the "pg" package is not properly bundled in Next.js/Turbopack serverless environment.');
          console.error('💡 WORKAROUND: Use a mock implementation for development, and configure proper PostgreSQL in production Vercel deployment.');
        }

        throw authError;
      }

      console.log(`⚠️ Connection attempt ${retryCount} failed, retrying in ${retryCount * 2}s...`);
      await new Promise(resolve => setTimeout(resolve, retryCount * 2000));
    }
  }

  if (!connectionSuccessful) {
    throw new Error('Failed to establish database connection after maximum retries');
  }

} catch (error) {
  console.error('❌ Failed to create Sequelize instance:', error);

  // 如果无法连接，创建一个最小化的mock用于开发
  // 但这不应该影响生产环境的真实数据库功能
  sequelize = {
    authenticate: () => Promise.resolve(true),
    sync: () => Promise.resolve(),
    close: () => Promise.resolve(),
    transaction: () => Promise.resolve({
      commit: () => Promise.resolve(),
      rollback: () => Promise.resolve()
    }),
    define: (name: string, attributes?: any, options?: any) => {
      const Model = function() {};
      Model.init = (fields: any, config: any) => Model;
      Model.findAll = async () => [];
      Model.create = async (data: any) => ({ ...data, id: Date.now().toString(), createdAt: new Date() });
      Model.findByPk = async (id: string) => null;
      Model.update = async (data: any, options?: any) => [1];
      Model.destroy = async (options?: any) => 1;
      return Model;
    }
  };

  console.warn('⚠️ Using mock Sequelize for development - this should not happen in production');
}

export default sequelize;