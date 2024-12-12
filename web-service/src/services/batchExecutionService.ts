import { Browser, chromium } from 'playwright';
import { Logger } from '../utils/logger';

interface ExecutionContext {
  script: string;
  data: Record<string, any>;
}

interface ExecutionResult {
  success: boolean;
  error?: string;
  executionTime: number;
  logs: Array<{
    level: 'info' | 'error' | 'warn';
    message: string;
    timestamp: string;
    metadata?: any;
  }>;
}

export class BatchExecutionService {
  private logger: Logger;
  private browser: Browser | null = null;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  private async initBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-dev-shm-usage']
      });
    }
    return this.browser;
  }

  async executeTest(context: ExecutionContext): Promise<ExecutionResult> {
    const browser = await this.initBrowser();
    const browserContext = await browser.newContext();
    const page = await browserContext.newPage();
    const logs: ExecutionResult['logs'] = [];
    const startTime = Date.now();

    try {
      const scriptContext = {
        page,
        data: context.data,
        log: (message: string, metadata?: any) => {
          logs.push({
            level: 'info',
            message,
            timestamp: new Date().toISOString(),
            metadata
          });
        },
        error: (message: string, error?: Error) => {
          logs.push({
            level: 'error',
            message: error ? `${message}: ${error.message}` : message,
            timestamp: new Date().toISOString(),
            metadata: error?.stack ? { stack: error.stack } : undefined
          });
        }
      };

      // Evaluate script in a safe context
      const scriptFunction = new Function('context', context.script);
      await scriptFunction(scriptContext);

      return {
        success: true,
        executionTime: Date.now() - startTime,
        logs
      };
    } catch (error) {
      // Capture screenshot on error
      try {
        await page.screenshot({
          path: `error-${Date.now()}.png`,
          fullPage: true
        });
      } catch {
        // Ignore screenshot errors
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: Date.now() - startTime,
        logs
      };
    } finally {
      await browserContext.close();
    }
  }

  async shutdown(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}