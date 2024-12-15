import { NextApiRequest, NextApiResponse } from 'next';
import { collections, initializeDatabase } from '../../../../lib/db-client';
import { logger } from '../../../../utils/logger';
import { BatchStatus } from '@batch-automation/shared';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await initializeDatabase();
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: '유효하지 않은 배치 ID입니다.' });
    }

    const batch = await collections.batches.findOne({ id });
    if (!batch) {
      return res.status(404).json({ error: '배치를 찾을 수 없습니다.' });
    }

    if (!batch.isActive) {
      return res.status(400).json({ error: '비활성화된 배치는 실행할 수 없습니다.' });
    }

    // 실행 상태 업데이트
    const startTime = new Date();
    const executionId = Date.now().toString();

    await collections.batchResults.insert({
      id: executionId,
      batchId: batch.id,
      status: BatchStatus.RUNNING,
      startTime,
      success: false
    });

    // 실행 로그 추가
    await collections.batchLogs.insert({
      id: Date.now().toString(),
      batchId: batch.id,
      executionId,
      timestamp: startTime,
      level: 'info',
      message: '배치 실행 시작'
    });

    return res.status(200).json({ 
      executionId,
      message: '배치 실행이 시작되었습니다.'
    });

  } catch (error) {
    logger.error('Error executing batch:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : '서버 오류가 발생했습니다.' 
    });
  }
}