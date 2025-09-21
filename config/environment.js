// 环境检测和配置统一
const isVercel = process.env.VERCEL === '1';
const isLocal = !isVercel;

// 数据库配置
const getDatabaseConfig = () => {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  return {
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false,
      require: true
    },
    max: isVercel ? 2 : 5, // Vercel限制连接数
    idleTimeoutMillis: isVercel ? 30000 : 60000,
    connectionTimeoutMillis: isVercel ? 30000 : 60000,
    acquireTimeoutMillis: isVercel ? 30000 : 60000,
    createTimeoutMillis: isVercel ? 30000 : 60000,
    destroyTimeoutMillis: isVercel ? 5000 : 10000,
    reapIntervalMillis: isVercel ? 1000 : 2000,
    createRetryIntervalMillis: isVercel ? 500 : 1000,
    retryDelayMs: isVercel ? 1000 : 2000,
    retryAttempts: isVercel ? 3 : 5,
  };
};

// API基础URL配置
const getApiBaseUrl = () => {
  if (isVercel) {
    return process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://momo-test.vercel.app';
  }
  return 'http://localhost:3000';
};

// 端口配置
const getPort = () => {
  return isVercel ? 0 : (process.env.PORT || 3000);
};

// 日志配置
const getLogLevel = () => {
  return isVercel ? 'error' : 'info';
};

module.exports = {
  isVercel,
  isLocal,
  getDatabaseConfig,
  getApiBaseUrl,
  getPort,
  getLogLevel
};
