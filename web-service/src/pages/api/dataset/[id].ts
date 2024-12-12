import { NextApiRequest, NextApiResponse } from 'next';
import { DatasetService } from '../../../services/datasetService';
import { Logger } from '../../../utils/logger';

const logger = new Logger();
const datasetService = new DatasetService(process.env.DATABASE_PATH || './data', logger);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  
  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid dataset ID' });
  }

  try {
    switch (req.method) {
      case 'GET':
        const dataset = await datasetService.getDataset(id);
        return res.status(200).json(dataset);

      case 'PUT':
        const updatedDataset = await datasetService.updateDataset(id, req.body.data);
        return res.status(200).json(updatedDataset);

      case 'DELETE':
        await datasetService.deleteDataset(id);
        return res.status(204).end();

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    logger.error(`API Error for dataset ${id}`, error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({ error: 'Dataset not found' });
    }
    
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal Server Error'
    });
  }
}