import { NextApiRequest, NextApiResponse } from 'next';
import { BatchService } from '../../../services/batchService';
import { Logger } from '../../../utils/logger';

const logger = new Logger();
const batchService = new BatchService(process.env.DATABASE_PATH || './data', logger);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case 'GET':
        const batches = await batchService.listBatches(req.query);
        return res.status(200).json(batches);

      case 'POST':
        const newBatch = await batchService.createBatch(req.body);
        return res.status(201).json(newBatch);

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    logger.error('API Error', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal Server Error' 
    });
  }
}