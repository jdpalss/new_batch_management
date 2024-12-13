import fs from 'fs';
import config from './config';
import { BatchExecutor } from './batch/BatchExecutor';
import { BatchScheduler } from './batch/BatchScheduler';
import { DatasetService } from './services/datasetService';
import { Logger } from './utils/logger';

const logger = new Logger();

// 데이터 디렉토리가 없으면 생성
if (!fs.existsSync(config.database.path)) {
  fs.mkdirSync(config.database.path, { recursive: true });
  logger.info(`Created database directory: ${config.database.path}`);
}

const batchExecutor = new BatchExecutor(logger);
const datasetService = new DatasetService(config.database.path, logger);
const batchScheduler = new BatchScheduler(batchExecutor, datasetService, logger);

async function start() {
  try {
    logger.info('Starting batch service...', { dbPath: config.database.path });
    
    // Initialize Playwright browser
    await batchExecutor.initialize();
    
    // Load and schedule existing batches
    await batchScheduler.loadExistingBatches();
    
    logger.info('Batch service started successfully');
  } catch (error) {
    logger.error('Failed to start batch service', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('Shutting down batch service...');
  await batchScheduler.stopAllBatches();
  await batchExecutor.shutdown();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('Shutting down batch service...');
  await batchScheduler.stopAllBatches();
  await batchExecutor.shutdown();
  process.exit(0);
});

start();