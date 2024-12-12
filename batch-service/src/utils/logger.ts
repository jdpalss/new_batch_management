export class Logger {
  private logs: Map<string, any[]>;

  constructor() {
    this.logs = new Map();
  }

  info(message: string, metadata?: Record<string, any>, batchId?: string): void {
    this.log('info', message, metadata, batchId);
    console.log(`[INFO] ${message}`, metadata || '');
  }

  error(message: string, error?: Error | unknown, batchId?: string): void {
    const metadata = error instanceof Error ? {
      error: error.message,
      stack: error.stack
    } : { error };
    
    this.log('error', message, metadata, batchId);
    console.error(`[ERROR] ${message}`, error);
  }

  warn(message: string, metadata?: Record<string, any>, batchId?: string): void {
    this.log('warn', message, metadata, batchId);
    console.warn(`[WARN] ${message}`, metadata || '');
  }

  getLogs(batchId: string): any[] {
    return this.logs.get(batchId) || [];
  }

  clearLogs(batchId: string): void {
    this.logs.delete(batchId);
  }

  private log(
    level: 'info' | 'error' | 'warn',
    message: string,
    metadata?: Record<string, any>,
    batchId?: string
  ): void {
    if (!batchId) return;

    const entry = {
      timestamp: new Date(),
      level,
      message,
      metadata
    };

    const batchLogs = this.logs.get(batchId) || [];
    batchLogs.push(entry);
    this.logs.set(batchId, batchLogs);
  }
}