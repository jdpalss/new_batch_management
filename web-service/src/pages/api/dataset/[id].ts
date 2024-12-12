import { NextApiRequest, NextApiResponse } from 'next';
import { stores } from '../../../lib/db';
import { Logger } from '../../../utils/logger';

const logger = new Logger();

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
      case 'GET': {
        const dataset = await stores.datasets.findOne({ id });
        if (!dataset) {
          return res.status(404).json({ error: 'Dataset not found' });
        }
        return res.status(200).json(dataset);
      }

      case 'PUT': {
        const { name, description, data } = req.body;
        const dataset = await stores.datasets.findOne({ id });
        
        if (!dataset) {
          return res.status(404).json({ error: 'Dataset not found' });
        }

        if (!data) {
          return res.status(400).json({ error: 'Dataset data is required' });
        }

        const updatedDataset = {
          ...dataset,
          name: name || dataset.name,
          description: description || dataset.description,
          data,
          version: dataset.version + 1,
          updatedAt: new Date()
        };

        await stores.datasets.update({ id }, updatedDataset);
        logger.info(`Updated dataset ${id}`);
        
        return res.status(200).json(updatedDataset);
      }

      case 'DELETE': {
        const dataset = await stores.datasets.findOne({ id });
        if (!dataset) {
          return res.status(404).json({ error: 'Dataset not found' });
        }

        // Check if dataset is in use by any batches
        const batchExists = await stores.batches.findOne({ datasetId: id });
        if (batchExists) {
          return res.status(400).json({ 
            error: 'Cannot delete dataset that is in use by batches' 
          });
        }

        await stores.datasets.remove({ id });
        logger.info(`Deleted dataset ${id}`);
        
        return res.status(204).end();
      }

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    logger.error(`Dataset API Error for ${id}:`, error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal Server Error' 
    });
  }
}