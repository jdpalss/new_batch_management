import { NextApiRequest, NextApiResponse } from 'next';
import { TemplateService } from '../../../services/templateService';
import { Logger } from '../../../utils/logger';

// Create singleton instances
const logger = new Logger();
const templateService = new TemplateService(logger);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case 'GET':
        const templates = await templateService.listTemplates();
        return res.status(200).json(templates);

      case 'POST':
        const newTemplate = await templateService.createTemplate(req.body);
        return res.status(201).json(newTemplate);

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    logger.error('API Error:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal Server Error' 
    });
  }
}