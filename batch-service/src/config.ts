import path from 'path';
import dotenv from 'dotenv';

// .env 파일 로드
dotenv.config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  
  // 데이터베이스 설정
  db: {
    path: process.env.DB_PATH || './data',
    getDbPath: (name: string) => path.join(process.env.DB_PATH || './data', `${name}.db`),
  },
  
  // 배치 설정
  batch: {
    maxConcurrent: parseInt(process.env.MAX_CONCURRENT_BATCHES || '5', 10),
    maxRetries: parseInt(process.env.MAX_BATCH_RETRIES || '3', 10),
    retryDelay: parseInt(process.env.BATCH_RETRY_DELAY || '60000', 10), // 1분
    maxRandomDelay: parseInt(process.env.MAX_RANDOM_DELAY || '1800000', 10), // 30분
  },

  // Playwright 설정
  playwright: {
    browser: process.env.PLAYWRIGHT_BROWSER || 'chromium',
    headless: process.env.PLAYWRIGHT_HEADLESS !== 'false',
    timeout: parseInt(process.env.PLAYWRIGHT_TIMEOUT || '30000', 10), // 30초
  },
  
  // 로깅 설정
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'batch-service.log',
  },
};

export default config;