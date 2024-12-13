import { NextApiRequest, NextApiResponse } from 'next';
import { stores } from '../../../lib/db';
import { Template } from '../../../types';
import { logger } from '../../../utils/logger';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case 'GET':
        const templates = await new Promise<Template[]>((resolve, reject) => {
          stores.templates.find({}, (err: any, docs: Template[]) => {
            if (err) reject(err);
            // DB 인스턴스 제외한 순수 데이터만 반환
            const cleanTemplates = docs.map(doc => ({
              id: doc.id,
              name: doc.name,
              description: doc.description,
              fields: doc.fields,
              script: doc.script,
              createdAt: doc.createdAt,
              updatedAt: doc.updatedAt
            }));
            resolve(cleanTemplates);
          });
        });

        return res.status(200).json(templates);

      case 'POST':
        if (!req.body || typeof req.body !== 'object') {
          return res.status(400).json({ error: '잘못된 요청 데이터입니다.' });
        }

        try {
          const newTemplate: Template = {
            id: Date.now().toString(),
            ...req.body,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          await new Promise((resolve, reject) => {
            stores.templates.insert(newTemplate, (err: any, doc: Template) => {
              if (err) reject(err);
              resolve(doc);
            });
          });

          logger.info('Created new template', { templateId: newTemplate.id });
          return res.status(201).json(newTemplate);
        } catch (error) {
          logger.error('Error creating template', error);
          return res.status(400).json({ 
            error: error instanceof Error ? error.message : '템플릿 생성 중 오류가 발생했습니다.'
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