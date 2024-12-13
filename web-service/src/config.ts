import path from 'path';
import * as dotenv from 'dotenv';

// 프로젝트 루트의 .env 파일 로드
dotenv.config({ path: path.join(__dirname, '../../.env') });

const config = {
  database: {
    path: path.resolve(process.env.DATABASE_PATH || './../data')
  },
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'
  }
};

export default config;