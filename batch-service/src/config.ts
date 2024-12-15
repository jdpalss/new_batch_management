import path from 'path';
import dotenv from 'dotenv';

// 프로젝트 루트의 .env 파일 로드
dotenv.config();

// batch-automation/data 디렉토리 경로
const dataDir = path.resolve(__dirname, '../../data');

const config = {
  database: {
    path: dataDir
  },
  batch: {
    maxConcurrent: Number(process.env.MAX_CONCURRENT_JOBS) || 5,
    maxRetries: 3,
    timeout: 30 * 60 * 1000, // 30분
    defaultRandomDelay: {
      min: 1000,  // 1초
      max: 5 * 60 * 1000  // 5분
    }
  },
  playwright: {
    headless: false,
    channel: 'chrome',
    args: [
      '--start-maximized',
      '--no-sandbox',
      '--disable-dev-shm-usage'
    ],
    handleSIGINT: false,
    handleSIGTERM: false,
    handleSIGHUP: false
  }
};

export default config;