import { BatchExecution, BatchStatus } from '../types/batch';
import { logger } from '../utils/logger';
import { stores } from '../lib/db';

export class BatchRecoveryService {
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 5 * 60 * 1000; // 5분

  async handleFailedExecution(execution: BatchExecution): Promise<void> {
    try {
      // 실패한 실행 기록 조회
      const failedExecutions = await stores.batchExecutions.find({
        batchId: execution.batchId,
        status: BatchStatus.FAILURE
      });

      // 연속 실패 횟수 확인
      const consecutiveFailures = this.getConsecutiveFailures(failedExecutions);

      if (consecutiveFailures <= this.MAX_RETRIES) {
        // 재시도 스케줄링
        await this.scheduleRetry(execution);
        
        logger.info('Scheduled batch retry', {
          batchId: execution.batchId,
          executionId: execution.id,
          retryCount: consecutiveFailures
        });
      } else {
        // 최대 재시도 횟수 초과
        await this.handleMaxRetriesExceeded(execution);
      }
    } catch (error) {
      logger.error('Error in batch recovery', {
        error,
        execution
      });
    }
  }

  private getConsecutiveFailures(executions: BatchExecution[]): number {
    let count = 0;
    for (const execution of executions) {
      if (execution.status === BatchStatus.FAILURE) {
        count++;
      } else {
        break;
      }
    }
    return count;
  }

  private async scheduleRetry(execution: BatchExecution): Promise<void> {
    const retryTime = new Date(Date.now() + this.RETRY_DELAY);

    await stores.batchSchedule.insert({
      batchId: execution.batchId,
      scheduledTime: retryTime,
      isRetry: true,
      originalExecutionId: execution.id
    });

    // 배치 상태 업데이트
    await stores.batches.update(
      { id: execution.batchId },
      { 
        $set: { 
          nextExecutionAt: retryTime,
          retryCount: (execution as any).retryCount + 1 || 1
        } 
      }
    );
  }

  private async handleMaxRetriesExceeded(execution: BatchExecution): Promise<void> {
    // 배치 비활성화
    await stores.batches.update(
      { id: execution.batchId },
      { 
        $set: { 
          isActive: false,
          status: BatchStatus.STOPPED,
          errorMessage: '최대 재시도 횟수 초과'
        } 
      }
    );

    // 알림 발송
    await this.sendNotification({
      type: 'BATCH_DISABLED',
      batchId: execution.batchId,
      reason: 'MAX_RETRIES_EXCEEDED',
      message: '연속 실패로 인해 배치가 비활성화되었습니다.'
    });

    logger.error('Batch disabled due to max retries exceeded', {
      batchId: execution.batchId,
      executionId: execution.id
    });
  }

  private async sendNotification(notification: any): Promise<void> {
    // TODO: 실제 알림 발송 구현 (이메일, 슬랙 등)
    logger.info('Notification sent', { notification });
  }

  // 오류 원인 분석
  private analyzeFailure(execution: BatchExecution): string {
    if (!execution.error) return 'UNKNOWN_ERROR';

    const error = execution.error.toLowerCase();
    
    if (error.includes('timeout')) return 'TIMEOUT';
    if (error.includes('network')) return 'NETWORK_ERROR';
    if (error.includes('memory')) return 'OUT_OF_MEMORY';
    if (error.includes('permission')) return 'PERMISSION_ERROR';
    
    return 'UNKNOWN_ERROR';
  }

  // 복구 전략 결정
  private getRecoveryStrategy(failureType: string): {
    action: 'RETRY' | 'DISABLE' | 'NOTIFY',
    delay?: number
  } {
    switch (failureType) {
      case 'TIMEOUT':
        return { action: 'RETRY', delay: 15 * 60 * 1000 }; // 15분 후 재시도
      case 'NETWORK_ERROR':
        return { action: 'RETRY', delay: 5 * 60 * 1000 }; // 5분 후 재시도
      case 'OUT_OF_MEMORY':
        return { action: 'DISABLE' }; // 배치 비활성화
      case 'PERMISSION_ERROR':
        return { action: 'NOTIFY' }; // 관리자 알림
      default:
        return { action: 'RETRY', delay: this.RETRY_DELAY };
    }
  }
}
