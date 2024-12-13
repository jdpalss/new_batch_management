import { NextApiRequest, NextApiResponse } from 'next';
import { stores } from '../../../lib/db';
import { logger } from '../../../utils/logger';
import { Template } from '../../../types/template';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: '유효하지 않은 템플릿 ID입니다.' });
  }

  try {
    switch (req.method) {
      case 'GET':
        const template = await new Promise<Template | null>((resolve, reject) => {
          stores.templates.findOne({ id }, (err: Error | null, doc: Template | null) => {
            if (err) reject(err);
            // DB 인스턴스 제외한 순수 데이터만 반환
            if (doc) {
              const cleanTemplate = {
                id: doc.id,
                name: doc.name,
                description: doc.description,
                fields: doc.fields,
                script: doc.script,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt
              };
              resolve(cleanTemplate);
            } else {
              resolve(null);
            }
          });
        });

        if (!template) {
          return res.status(404).json({ error: '템플릿을 찾을 수 없습니다.' });
        }

        return res.status(200).json(template);

      case 'PUT':
        if (!req.body || typeof req.body !== 'object') {
          return res.status(400).json({ error: '잘못된 요청 데이터입니다.' });
        }

        const updatedTemplate = await new Promise((resolve, reject) => {
          stores.templates.update(
            { id },
            { $set: { ...req.body, updatedAt: new Date() } },
            { returnUpdatedDocs: true },
            (err: Error | null, numAffected: number, doc: Template) => {
              if (err) reject(err);
              if (numAffected === 0) resolve(null);
              // DB 인스턴스 제외한 순수 데이터만 반환
              const cleanTemplate = {
                id: doc.id,
                name: doc.name,
                description: doc.description,
                fields: doc.fields,
                script: doc.script,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt
              };
              resolve(cleanTemplate);
            }
          );
        });

        if (!updatedTemplate) {
          return res.status(404).json({ error: '템플릿을 찾을 수 없습니다.' });
        }

        logger.info(`Updated template ${id}`);
        return res.status(200).json(updatedTemplate);

      case 'DELETE':
        await new Promise((resolve, reject) => {
          stores.templates.remove({ id }, {}, (err: Error | null, numRemoved: number) => {
            if (err) reject(err);
            resolve(numRemoved);
          });
        });

        logger.info(`Deleted template ${id}`);
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