import 'dotenv/config';
import { BatchExecutor } from './batch/BatchExecutor';
import { BatchScheduler } from './batch/BatchScheduler';
import { DatasetService } from './services/datasetService';
import { Logger } from './utils/logger';

// 서비스 인스턴스
const logger = new Logger();
const datasetService = new DatasetService({ logger });
const batchExecutor = new BatchExecutor(logger);
const batchScheduler = new BatchScheduler(batchExecutor, datasetService, logger);

// 이전 실행 중이던 프로세스 정리
let isShuttingDown = false;
async function cleanup() {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info('Cleaning up and shutting down...');
  try {
    await batchScheduler.shutdown();
    await batchExecutor.shutdown();
    logger.info('Cleanup completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during cleanup:', error);
    process.exit(1);
  }
}

// 종료 시그널 처리
process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup);
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
  cleanup();
});

// 서비스 시작
async function start() {
  try {
    logger.info('Starting batch service...');
    
    // 서비스 초기화
    await datasetService.initialize();
    await batchExecutor.initialize();
    
    // 배치 스케줄러 시작 (10초 간격으로 체크)
    await batchScheduler.startPeriodicCheck(10);
    
    logger.info('Batch service started successfully');
  } catch (error) {
    logger.error('Failed to start batch service:', error);
    await cleanup();
  }
}

// 시작
start();