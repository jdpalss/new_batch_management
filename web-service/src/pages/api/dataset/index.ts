import { NextApiRequest, NextApiResponse } from 'next';
import { stores } from '../../../lib/db';
import { Dataset } from '../../../types';
import { logger } from '../../../utils/logger';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case 'GET':
        const { templateId } = req.query;
        const query = templateId ? { templateId } : {};

        const datasets = await new Promise<Dataset[]>((resolve, reject) => {
          stores.datasets.find(query, (err: any, docs: Dataset[]) => {
            if (err) reject(err);
            // DB 인스턴스 제외한 순수 데이터만 반환
            const cleanDatasets = docs.map(doc => ({
              id: doc.id,
              name: doc.name,
              templateId: doc.templateId,
              data: doc.data,
              createdAt: doc.createdAt,
              updatedAt: doc.updatedAt
            }));
            resolve(cleanDatasets);
          });
        });

        return res.status(200).json(datasets);

      case 'POST':
        if (!req.body || typeof req.body !== 'object') {
          return res.status(400).json({ error: '잘못된 요청 데이터입니다.' });
        }

        try {
          const newDataset: Dataset = {
            id: Date.now().toString(),
            ...req.body,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          await new Promise((resolve, reject) => {
            stores.datasets.insert(newDataset, (err: any, doc: Dataset) => {
              if (err) reject(err);
              resolve(doc);
            });
          });

          logger.info('Created new dataset', { datasetId: newDataset.id });
          return res.status(201).json(newDataset);
        } catch (error) {
          logger.error('Error creating dataset', error);
          return res.status(400).json({ 
            error: error instanceof Error ? error.message : '데이터셋 생성 중 오류가 발생했습니다.'
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