import Datastore from 'nedb-promises';
import path from 'path';
import config from '../config';
import { BatchConfig } from '../types/batch';

// 배치 데이터베이스 초기화
const batchStore = Datastore.create({
  filename: path.join(config.database.path, 'batches.db'),
  autoload: true
});

// 배치 목록 조회
export async function loadBatches(): Promise<BatchConfig[]> {
  try {
    return await batchStore.find({}) as BatchConfig[];
  } catch (error) {
    throw new Error(`Failed to load batches: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// 특정 배치 조회
export async function getBatch(id: string): Promise<BatchConfig | null> {
  try {
    return await batchStore.findOne({ id }) as BatchConfig | null;
  } catch (error) {
    throw new Error(`Failed to get batch ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// 배치 상태 업데이트
export async function updateBatchStatus(id: string, status: string): Promise<void> {
  try {
    await batchStore.update(
      { id },
      { $set: { status, updatedAt: new Date() } }
    );
  } catch (error) {
    throw new Error(`Failed to update batch status ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// 배치 실행 이력 저장
export async function saveBatchExecution(id: string, execution: any): Promise<void> {
  try {
    const batch = await getBatch(id);
    if (!batch) throw new Error(`Batch ${id} not found`);

    await batchStore.update(
      { id },
      { 
        $set: { 
          lastExecutedAt: new Date(),
          lastExecutionResult: execution,
          updatedAt: new Date()
        }
      }
    );
  } catch (error) {
    throw new Error(`Failed to save batch execution ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// 배치 활성화/비활성화
export async function setBatchActive(id: string, isActive: boolean): Promise<void> {
  try {
    await batchStore.update(
      { id },
      { $set: { isActive, updatedAt: new Date() } }
    );
  } catch (error) {
    throw new Error(`Failed to ${isActive ? 'activate' : 'deactivate'} batch ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}