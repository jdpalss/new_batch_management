import { Browser, chromium } from 'playwright';
import { BatchConfig, BatchResult, BatchContext } from '../models/batch';
import { Logger } from '../utils/logger';

export class BatchExecutor {
  private browser: Browser | null = null;
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  async initialize(): Promise<void> {
    try {
      this.browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-dev-shm-usage']
      });
      this.logger.info('Browser initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize browser', error);
      throw error;
    }
  }

  async executeBatch(config: BatchConfig, dataset: any): Promise<BatchResult> {
    if (!this.browser) {
      throw new Error('Browser not initialized');
    }

    const context = await this.browser.newContext({
      userAgent: 'BatchAutomation/1.0',
      viewport: { width: 1920, height: 1080 }
    });

    const page = await context.newPage();
    const startTime = Date.now();

    const batchContext: BatchContext = {
      page,
      data: dataset,
      log: (message: string) => this.logger.info(`[Batch ${config.id}] ${message}`),
      error: (message: string, error?: Error) => this.logger.error(`[Batch ${config.id}] ${message}`, error)
    };

    try {
      // Evaluate the script in a safe context
      const scriptFunction = new Function('context', config.script);
      await scriptFunction(batchContext);

      const executionTime = Date.now() - startTime;
      
      return {
        id: config.id,
        success: true,
        executionTime,
        timestamp: new Date(),
        logs: this.logger.getLogs(config.id)
      };
    } catch (error) {
      // Capture screenshot on error
      await page.screenshot({
        path: `error-${config.id}-${Date.now()}.png`,
        fullPage: true
      });

      return {
        id: config.id,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: Date.now() - startTime,
        timestamp: new Date(),
        logs: this.logger.getLogs(config.id)
      };
    } finally {
      await context.close();
    }
  }

  async shutdown(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}