import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

const LOG_DIR = './logs';

export class Logger {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      defaultMeta: { service: 'batch-automation' },
      transports: [
        // 에러 로그는 별도 파일로 관리
        new DailyRotateFile({
          filename: path.join(LOG_DIR, 'error-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          maxFiles: '30d'
        }),
        // 일반 로그
        new DailyRotateFile({
          filename: path.join(LOG_DIR, 'combined-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          maxFiles: '30d'
        }),
        // 배치 실행 로그
        new DailyRotateFile({
          filename: path.join(LOG_DIR, 'batch-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          maxFiles: '30d'
        })
      ]
    });

    // 개발 환경에서는 콘솔에도 출력
    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(new winston.transports.Console({
        format: winston.format.simple()
      }));
    }
  }

  info(message: string, meta?: any) {
    this.logger.info(message, meta);
  }

  warn(message: string, meta?: any) {
    this.logger.warn(message, meta);
  }

  error(message: string, meta?: any) {
    this.logger.error(message, meta);
  }

  // 배치 실행 관련 로그
  logBatchExecution(batchId: string, message: string, meta?: any) {
    this.logger.info(message, { 
      batchId,
      type: 'BATCH_EXECUTION',
      ...meta
    });
  }

  // 에러 발생시 상세 정보 로깅
  logError(error: Error, context?: any) {
    this.logger.error('Error occurred', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      context
    });
  }
}

export const logger = new Logger();
