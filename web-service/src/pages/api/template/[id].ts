import { NextApiRequest, NextApiResponse } from 'next';
import { TemplateService } from '../../../services/templateService';
import { Logger } from '../../../utils/logger';

const logger = new Logger();
const templateService = new TemplateService(logger);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  
  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid template ID' });
  }

  try {
    switch (req.method) {
      case 'GET':
        const template = await templateService.getTemplate(id);
        return res.status(200).json(template);

      case 'PUT':
        const updatedTemplate = await templateService.updateTemplate(id, req.body);
        return res.status(200).json(updatedTemplate);

      case 'DELETE':
        await templateService.deleteTemplate(id);
        return res.status(204).end();

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    logger.error(`API Error for template ${id}:`, error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal Server Error' 
    });
  }
}