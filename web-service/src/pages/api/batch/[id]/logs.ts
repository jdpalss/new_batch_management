import { NextApiRequest, NextApiResponse } from 'next';
import { stores, ensureDBInitialized } from '../../../../lib/db';
import { logger } from '../../../../utils/logger';
import { BatchLog } from '../../../../types/batch';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: '유효하지 않은 배치 ID입니다.' });
  }

  try {
    // DB 초기화 확인
    await ensureDBInitialized();

    if (!stores.batchLogs) {
      return res.status(500).json({ 
        error: 'Database not initialized properly' 
      });
    }

    const logs = await new Promise<BatchLog[]>((resolve, reject) => {
      stores.batchLogs.find({ batchId: id })
        .sort({ timestamp: -1 })
        .exec((err: Error | null, docs: any[]) => {
          if (err) {
            reject(err);
            return;
          }

          // 로그 데이터 정제
          const cleanLogs = docs.map(doc => ({
            id: doc.id,
            batchId: doc.batchId,
            executionId: doc.executionId,
            timestamp: doc.timestamp ? new Date(doc.timestamp).toISOString() : null,
            level: doc.level,
            message: doc.message,
            metadata: doc.metadata || null
          }));

          resolve(cleanLogs);
        });
    });

    return res.status(200).json(logs);

  } catch (error) {
    logger.error('API Error:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : '서버 오류가 발생했습니다.' 
    });
  }
}