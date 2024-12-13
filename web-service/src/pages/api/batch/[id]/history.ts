import { NextApiRequest, NextApiResponse } from 'next';
import { stores, ensureDBInitialized } from '../../../../lib/db';
import { logger } from '../../../../utils/logger';
import { BatchResult } from '../../../../types/batch';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: '유효하지 않은 배치 ID입니다.' });
  }

  try {
    // DB 초기화 확인
    await ensureDBInitialized();

    if (!stores.batchResults) {
      return res.status(500).json({ 
        error: 'Database not initialized properly' 
      });
    }

    const results = await new Promise<BatchResult[]>((resolve, reject) => {
      stores.batchResults.find({ batchId: id })
        .sort({ startTime: -1 })
        .exec((err: Error | null, docs: any[]) => {
          if (err) {
            reject(err);
            return;
          }

          // 결과 데이터 정제
          const cleanResults = docs.map(doc => ({
            id: doc.id,
            batchId: doc.batchId,
            status: doc.status,
            startTime: doc.startTime ? new Date(doc.startTime).toISOString() : null,
            endTime: doc.endTime ? new Date(doc.endTime).toISOString() : null,
            executionTime: doc.executionTime || 0,
            error: doc.error || null,
            success: !!doc.success,
            data: doc.data || null,
            metadata: doc.metadata || null
          }));

          resolve(cleanResults);
        });
    });

    return res.status(200).json(results);

  } catch (error) {
    logger.error('API Error:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : '서버 오류가 발생했습니다.' 
    });
  }
}