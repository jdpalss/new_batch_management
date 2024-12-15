import { NextApiRequest, NextApiResponse } from 'next';
import { collections, initializeDatabase } from '../../../../lib/db-client';
import { logger } from '../../../../utils/logger';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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

    const logs = await collections.batchLogs.find({ batchId: id }, {
      sort: { timestamp: -1 }
    });

    return res.status(200).json(logs);
  } catch (error) {
    logger.error('Error fetching batch logs:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : '서버 오류가 발생했습니다.' 
    });
  }
}