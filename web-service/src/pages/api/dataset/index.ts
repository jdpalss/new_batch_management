import { NextApiRequest, NextApiResponse } from 'next';
import { stores } from '../../../lib/db';
import { Logger } from '../../../utils/logger';

const logger = new Logger();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case 'GET': {
        const { templateId } = req.query;
        const query = templateId ? { templateId } : {};
        const datasets = await stores.datasets.find(query);
        
        // Sort by creation date, newest first
        datasets.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        return res.status(200).json(datasets);
      }

      case 'POST': {
        const { templateId, name, description, data } = req.body;

        if (!templateId || !data) {
          return res.status(400).json({
            error: 'Template ID and data are required'
          });
        }

        // Verify template exists
        const template = await stores.templates.findOne({ id: templateId });
        if (!template) {
          return res.status(404).json({
            error: 'Template not found'
          });
        }

        const dataset = {
          id: Date.now().toString(),
          templateId,
          name: name || 'Unnamed Dataset',
          description,
          data,
          version: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        await stores.datasets.insert(dataset);
        logger.info(`Created dataset ${dataset.id} for template ${templateId}`);

        return res.status(201).json(dataset);
      }

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    logger.error('Dataset API Error:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal Server Error' 
    });
  }
}