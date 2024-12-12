export class Logger {
  private logs: Map<string, any[]>;

  constructor() {
    this.logs = new Map();
  }

  info(message: string, metadata?: any) {
    console.log(`[INFO] ${message}`, metadata || '');
  }

  error(message: string, error?: any) {
    console.error(`[ERROR] ${message}`, error || '');
    if (error?.stack) {
      console.error(error.stack);
    }
  }

  warn(message: string, metadata?: any) {
    console.warn(`[WARN] ${message}`, metadata || '');
  }

  debug(message: string, metadata?: any) {
    console.debug(`[DEBUG] ${message}`, metadata || '');
  }
}