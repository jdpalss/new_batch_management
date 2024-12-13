import { NextApiRequest, NextApiResponse } from 'next';
import { stores } from '../../../lib/db';
import { logger } from '../../../utils/logger';
import { BatchConfig } from '../../../types/batch';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: '유효하지 않은 배치 ID입니다.' });
  }

  try {
    switch (req.method) {
      case 'GET':
        const batch = await new Promise<BatchConfig | null>((resolve, reject) => {
          stores.batches.findOne({ id }, (err: Error | null, doc: BatchConfig | null) => {
            if (err) reject(err);
            // DB 인스턴스 제외한 순수 데이터만 반환
            if (doc) {
              const cleanBatch = {
                id: doc.id,
                title: doc.title,
                description: doc.description,
                templateId: doc.templateId,
                datasetId: doc.datasetId,
                isActive: doc.isActive,
                schedule: doc.schedule,
                status: doc.status,
                lastExecutedAt: doc.lastExecutedAt,
                nextExecutionAt: doc.nextExecutionAt,
                lastExecutionResult: doc.lastExecutionResult,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt
              };
              resolve(cleanBatch);
            } else {
              resolve(null);
            }
          });
        });

        if (!batch) {
          return res.status(404).json({ error: '배치를 찾을 수 없습니다.' });
        }

        return res.status(200).json(batch);

      case 'PUT':
        if (!req.body || typeof req.body !== 'object') {
          return res.status(400).json({ error: '잘못된 요청 데이터입니다.' });
        }

        const updatedBatch = await new Promise((resolve, reject) => {
          stores.batches.update(
            { id },
            { $set: { ...req.body, updatedAt: new Date() } },
            { returnUpdatedDocs: true },
            (err: Error | null, numAffected: number, doc: BatchConfig) => {
              if (err) reject(err);
              if (numAffected === 0) resolve(null);
              // DB 인스턴스 제외한 순수 데이터만 반환
              const cleanBatch = {
                id: doc.id,
                title: doc.title,
                description: doc.description,
                templateId: doc.templateId,
                datasetId: doc.datasetId,
                isActive: doc.isActive,
                schedule: doc.schedule,
                status: doc.status,
                lastExecutedAt: doc.lastExecutedAt,
                nextExecutionAt: doc.nextExecutionAt,
                lastExecutionResult: doc.lastExecutionResult,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt
              };
              resolve(cleanBatch);
            }
          );
        });

        if (!updatedBatch) {
          return res.status(404).json({ error: '배치를 찾을 수 없습니다.' });
        }

        logger.info(`Updated batch ${id}`);
        return res.status(200).json(updatedBatch);

      case 'DELETE':
        await new Promise((resolve, reject) => {
          stores.batches.remove({ id }, {}, (err: Error | null, numRemoved: number) => {
            if (err) reject(err);
            resolve(numRemoved);
          });
        });

        // 관련 데이터도 삭제
        await Promise.all([
          new Promise((resolve, reject) => {
            stores.batchResults.remove({ batchId: id }, { multi: true }, (err: Error | null) => {
              if (err) reject(err);
              resolve(true);
            });
          }),
          new Promise((resolve, reject) => {
            stores.batchLogs.remove({ batchId: id }, { multi: true }, (err: Error | null) => {
              if (err) reject(err);
              resolve(true);
            });
          })
        ]);

        logger.info(`Deleted batch ${id}`);
        return res.status(204).end();

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    logger.error('API Error:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : '서버 오류가 발생했습니다.' 
    });
  }
}