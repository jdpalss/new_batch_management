import { NextApiRequest, NextApiResponse } from 'next';
import { DatasetService } from '../../../services/datasetService';
import { Logger } from '../../../utils/logger';

const logger = new Logger();
const datasetService = new DatasetService(process.env.DATABASE_PATH || './data', logger);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case 'GET':
        const { templateId } = req.query;
        const datasets = await datasetService.listDatasets(
          typeof templateId === 'string' ? templateId : undefined
        );
        return res.status(200).json(datasets);

      case 'POST':
        const { templateId: tid, data } = req.body;
        if (!tid || !data) {
          return res.status(400).json({
            error: 'Template ID and data are required'
          });
        }
        const newDataset = await datasetService.createDataset(tid, data);
        return res.status(201).json(newDataset);

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(\`Method \${req.method} Not Allowed\`);
    }
  } catch (error) {
    logger.error('API Error', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal Server Error'
    });
  }
}