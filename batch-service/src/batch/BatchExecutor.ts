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
      this.logger.info('Browser initialized');
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

      await this.saveLog({
        id: Date.now().toString(),
        batchId: config.id,
        executionId,
        timestamp: new Date(),
        level: 'info',
        message: 'Starting batch execution with template script',
        metadata: {
          templateId: config.templateId,
          datasetId: config.datasetId,
          data: data,
          scriptPreview: template.script.substring(0, 200)
        }
      });

      // 브라우저 컨텍스트 생성
      context = await this.browser.newContext({
        viewport: { width: 1920, height: 1080 }
      });
      
      page = await context.newPage();

      // 스크립트 실행 컨텍스트 생성
      const scriptContext = {
        page,
        data,
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
        }
      };

      // 스크립트 실행
      const scriptResult = await this.executeScript(template.script, data, page, scriptContext);

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
        data: scriptResult
      };

      await this.saveResult(batchResult);
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
      throw error;

    } finally {
      // 디버깅을 위해 브라우저는 수동으로 닫도록 함
      if (page) {
        try {
          await new Promise(() => {}); // 브라우저 유지
        } catch (error) {
          this.logger.error('Error keeping browser open', error);
        }
      }
    }
  }

  private async executeScript(script: string, data: any, page: any, context: any): Promise<any> {
    try {
      if (!script?.trim()) {
        throw new Error('Empty script');
      }

      // 스크립트가 runScript 함수를 포함하고 있는지 확인
      if (script.includes('function runScript')) {
        await context.log('Executing predefined runScript function');
        const scriptFunction = new Function('context', `
          ${script}
          return runScript(context);
        `);
        return await scriptFunction({ page, data, log: context.log, error: context.error });
      } else {
        // 일반 스크립트를 실행 가능한 형태로 변환
        await context.log('Executing plain script');
        const wrappedScript = `
          async (context) => {
            const { page, data, log, error } = context;
            try {
              ${script}
            } catch (e) {
              error('Script execution error:', e);
              throw e;
            }
          }
        `;
        const scriptFunction = eval(wrappedScript);
        return await scriptFunction({ page, data, log: context.log, error: context.error });
      }

    } catch (error) {
      await context.error('Script execution failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
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