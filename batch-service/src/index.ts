import 'dotenv/config';
import { BatchExecutor } from './batch/BatchExecutor';
import { BatchScheduler } from './batch/BatchScheduler';
import { DatasetService } from './services/datasetService';
import { Logger } from './utils/logger';

const logger = new Logger();
const batchExecutor = new BatchExecutor(logger);
const datasetService = new DatasetService(process.env.DATABASE_PATH || './data', logger);
const batchScheduler = new BatchScheduler(batchExecutor, datasetService, logger);

async function start() {
  try {
    logger.info('Starting batch service...');
    
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