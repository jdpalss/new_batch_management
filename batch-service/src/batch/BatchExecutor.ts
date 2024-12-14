import { chromium, Browser, ChromiumBrowser } from 'playwright';
import path from 'path';
import Datastore from 'nedb-promises';
import config from '../config';
import { BatchConfig, BatchResult, BatchStatus, BatchLog } from '../types/batch';
import { Logger } from '../utils/logger';

export class BatchExecutor {
  private browser: ChromiumBrowser | null = null;
  private logger: Logger;
  private batchLogsDb: Datastore;
  private batchResultsDb: Datastore;
  private templatesDb: Datastore;

  constructor(logger: Logger) {
    this.logger = logger;
    this.batchLogsDb = Datastore.create({
      filename: path.join(config.database.path, 'batch-logs.db'),
      autoload: true
    });
    this.batchResultsDb = Datastore.create({
      filename: path.join(config.database.path, 'batch-results.db'),
      autoload: true
    });
    this.templatesDb = Datastore.create({
      filename: path.join(config.database.path, 'templates.db'),
      autoload: true
    });
  }

  async initialize(): Promise<void> {
    try {
      this.browser = await chromium.launch(config.playwright);
      this.logger.info('Browser initialized with config:', config.playwright);
    } catch (error) {
      this.logger.error('Failed to initialize browser', error);
      throw error;
    }
  }

  async executeBatch(config: BatchConfig, data: any): Promise<BatchResult> {
    const executionId = Date.now().toString();
    const startTime = new Date();
    let context;
    let page;

    try {
      if (!this.browser) {
        throw new Error('Browser not initialized');
      }

      // 템플릿 조회
      const template = await this.templatesDb.findOne({ id: config.templateId });
      if (!template) {
        throw new Error(`Template not found: ${config.templateId}`);
      }

      if (!template.script) {
        throw new Error('No script defined in template');
      }

      this.logger.info('Starting batch execution:', {
        batchId: config.id,
        template: template.id,
        scriptPreview: template.script.substring(0, 200)
      });

      // 브라우저 컨텍스트 생성
      context = await this.browser.newContext({
        viewport: { width: 1920, height: 1080 }
      });

      page = await context.newPage();

      // 로깅 컨텍스트 생성
      const logContext = {
        log: async (message: string, metadata?: any) => {
          await this.saveLog({
            id: Date.now().toString(),
            batchId: config.id,
            executionId,
            timestamp: new Date(),
            level: 'info',
            message: `[Script] ${message}`,
            metadata
          });
          this.logger.info(`[Script Log] ${message}`, metadata);
        },
        error: async (message: string, error?: any) => {
          await this.saveLog({
            id: Date.now().toString(),
            batchId: config.id,
            executionId,
            timestamp: new Date(),
            level: 'error',
            message: `[Script] ${message}`,
            metadata: { error }
          });
          this.logger.error(`[Script Error] ${message}`, error);
        }
      };

      // context 객체 구성
      const runContext = {
        page,
        data,
        log: logContext.log.bind(logContext),
        error: logContext.error.bind(logContext)
      };

      // 실행 시작 로그
      await logContext.log('Executing script with data:', data);

      // 스크립트 실행
      const result = await this.executeScript(template.script, runContext);

      const endTime = new Date();
      const executionTime = endTime.getTime() - startTime.getTime();

      // 성공 결과 저장
      const batchResult: BatchResult = {
        id: executionId,
        batchId: config.id,
        status: BatchStatus.SUCCESS,
        startTime,
        endTime,
        executionTime,
        success: true,
        data: result
      };

      await this.saveResult(batchResult);
      await logContext.log('Batch execution completed successfully', result);

      return batchResult;

    } catch (error) {
      const endTime = new Date();
      const executionTime = endTime.getTime() - startTime.getTime();

      const errorResult: BatchResult = {
        id: executionId,
        batchId: config.id,
        status: BatchStatus.FAILURE,
        startTime,
        endTime,
        executionTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
        metadata: {
          errorStack: error instanceof Error ? error.stack : undefined
        }
      };

      await this.saveResult(errorResult);
      this.logger.error('Batch execution failed:', error);

      throw error;

    } finally {
      // 디버깅을 위해 브라우저 유지
      if (page) {
        try {
          // await page.close();
          await new Promise(() => {}); // 브라우저 유지
        } catch (error) {
          this.logger.error('Error while keeping browser open:', error);
        }
      }
      // if (context) await context.close();
    }
  }

  private async executeScript(script: string, context: any): Promise<any> {
    try {
      // 스크립트가 runScript 함수를 포함하고 있는 경우
      if (script.includes('function runScript')) {
        const scriptWithContext = `
          ${script}
          return runScript(context);
        `;
        const fn = new Function('context', scriptWithContext);
        return await fn(context);
      }
      
      // 일반 스크립트인 경우
      const wrappedScript = `
        async (context) => {
          const { page, data, log } = context;
          ${script}
        }
      `;
      
      const fn = eval(wrappedScript);
      return await fn(context);

    } catch (error) {
      this.logger.error('Script execution error:', error);
      context.error('Script execution failed', error);
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.logger.info('Browser shutdown completed');
    }
  }

  private async saveLog(log: BatchLog): Promise<void> {
    await this.batchLogsDb.insert(log);
  }

  private async saveResult(result: BatchResult): Promise<void> {
    await this.batchResultsDb.insert(result);
  }
}