import { NextApiRequest, NextApiResponse } from 'next';
import { BatchService } from '../../../../services/batchService';
import { BatchExecutionService } from '../../../../services/batchExecutionService';
import { Logger } from '../../../../utils/logger';

const logger = new Logger();
const batchService = new BatchService(process.env.DATABASE_PATH || './data', logger);
const executionService = new BatchExecutionService(logger);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { id } = req.query;
  
  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid batch ID' });
  }

  try {
    const batch = await batchService.getBatch(id);
    const result = await executionService.executeBatch(batch);
    
    return res.status(200).json(result);
  } catch (error) {
    logger.error(`Failed to execute batch ${id}`, error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({ error: 'Batch not found' });
    }
    
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal Server Error' 
    });
  }
}