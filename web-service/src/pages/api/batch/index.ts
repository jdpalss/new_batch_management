import { NextApiRequest, NextApiResponse } from 'next';
import { collections, initializeDatabase } from '../../../lib/db-client';
import { logger } from '../../../utils/logger';
import { validateBatchConfig } from '../../../utils/validation';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // DB 초기화 확인
    await initializeDatabase();

    switch (req.method) {
      case 'GET':
        const batches = await collections.batches.find(req.query);
        return res.status(200).json(batches);

      case 'POST':
        if (!req.body || typeof req.body !== 'object') {
          return res.status(400).json({ error: '잘못된 요청 데이터입니다.' });
        }

        try {
          // 배치 설정 유효성 검사
          await validateBatchConfig(req.body);

          // 새 배치 생성
          const newBatch = await collections.batches.insert(req.body);
          logger.info(`Created new batch: ${newBatch.id}`);
          
          return res.status(201).json(newBatch);
        } catch (error) {
          logger.error('Error creating batch:', error);
          return res.status(400).json({ 
            error: error instanceof Error ? error.message : '배치 생성 중 오류가 발생했습니다.'
          });
        }

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    logger.error('API Error:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : '서버 오류가 발생했습니다.'
    });
  }
}