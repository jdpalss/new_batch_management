import { NextApiRequest, NextApiResponse } from 'next';
import { stores } from '../../../lib/db';
import { BatchConfig } from '../../../types/batch';
import { logger } from '../../../utils/logger';
import { validateBatchConfig } from '../../../utils/validation';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case 'GET':
        const batches = await new Promise<BatchConfig[]>((resolve, reject) => {
          stores.batches.find({}, (err: any, docs: BatchConfig[]) => {
            if (err) reject(err);
            // DB 인스턴스 제외한 순수 데이터만 반환
            const cleanBatches = docs.map(doc => ({
              id: doc.id,
              title: doc.title,
              description: doc.description,
              templateId: doc.templateId,
              datasetId: doc.datasetId,
              isActive: doc.isActive,
              schedule: doc.schedule,
              lastExecutedAt: doc.lastExecutedAt,
              nextExecutionAt: doc.nextExecutionAt,
              createdAt: doc.createdAt,
              updatedAt: doc.updatedAt
            }));
            resolve(cleanBatches);
          });
        });

        return res.status(200).json(batches);

      case 'POST':
        if (!req.body || typeof req.body !== 'object') {
          return res.status(400).json({ error: '잘못된 요청 데이터입니다.' });
        }

        try {
          // 배치 설정 유효성 검사
          await validateBatchConfig(req.body);

          const newBatch: BatchConfig = {
            id: Date.now().toString(),
            ...req.body,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          const savedBatch = await new Promise((resolve, reject) => {
            stores.batches.insert(newBatch, (err: any, doc: BatchConfig) => {
              if (err) reject(err);
              // DB 인스턴스 제외한 순수 데이터만 반환
              const cleanBatch = {
                id: doc.id,
                title: doc.title,
                description: doc.description,
                templateId: doc.templateId,
                datasetId: doc.datasetId,
                isActive: doc.isActive,
                schedule: doc.schedule,
                lastExecutedAt: doc.lastExecutedAt,
                nextExecutionAt: doc.nextExecutionAt,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt
              };
              resolve(cleanBatch);
            });
          });

          logger.info('Created new batch', { batchId: newBatch.id });
          return res.status(201).json(savedBatch);
          
        } catch (error) {
          logger.error('Error creating batch', error);
          return res.status(400).json({ 
            error: error instanceof Error ? error.message : '배치 생성 중 오류가 발생했습니다.'
          });
        }

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    logger.error('API error', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : '서버 오류가 발생했습니다.'
    });
  }
}