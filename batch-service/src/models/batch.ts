import Datastore from 'nedb-promises';
import path from 'path';
import config from '../config';

// 배치 데이터베이스 초기화
const batchStore = Datastore.create({
  filename: path.join(config.database.path, 'batches.db'),
  autoload: true,
});

// 배치 목록 조회 (실행 가능한 배치만)
export async function loadBatches(): Promise<any[]> {
  try {
    return await batchStore.find({ isActive: true });
  } catch (error) {
    throw new Error(`Failed to load batches: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// 특정 배치 조회
export async function getBatch(id: string): Promise<any | null> {
  try {
    return await batchStore.findOne({ id });
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

// 배치 실행 기록 업데이트
export async function updateBatchExecution(id: string, lastExecutedAt: Date): Promise<void> {
  try {
    await batchStore.update(
      { id },
      { 
        $set: { 
          lastExecutedAt,
          updatedAt: new Date()
        }
      }
    );
  } catch (error) {
    throw new Error(`Failed to update batch execution ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}