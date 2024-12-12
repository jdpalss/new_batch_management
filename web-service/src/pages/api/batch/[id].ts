import { NextApiRequest, NextApiResponse } from 'next';
import { BatchService } from '../../../services/batchService';
import { Logger } from '../../../utils/logger';

const logger = new Logger();
const batchService = new BatchService(process.env.DATABASE_PATH || './data', logger);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  
  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid batch ID' });
  }

  try {
    switch (req.method) {
      case 'GET':
        const batch = await batchService.getBatch(id);
        return res.status(200).json(batch);

      case 'PUT':
        const updatedBatch = await batchService.updateBatch(id, req.body);
        return res.status(200).json(updatedBatch);

      case 'DELETE':
        await batchService.deleteBatch(id);
        return res.status(204).end();

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    logger.error(`API Error for batch ${id}`, error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({ error: 'Batch not found' });
    }
    
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal Server Error' 
    });
  }
}