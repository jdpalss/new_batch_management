import { NextApiRequest, NextApiResponse } from 'next';
import { BatchExecutionService } from '../../../services/batchExecutionService';
import { DatasetService } from '../../../services/datasetService';
import { Logger } from '../../../utils/logger';

const logger = new Logger();
const datasetService = new DatasetService(process.env.DATABASE_PATH || './data', logger);
const executionService = new BatchExecutionService(logger);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { script, datasetId } = req.body;

  if (!script || !datasetId) {
    return res.status(400).json({
      error: 'Script and datasetId are required'
    });
  }

  try {
    // 데이터셋 로드
    const dataset = await datasetService.getDataset(datasetId);

    // 임시 테스트 구성으로 실행
    const result = await executionService.executeTest({
      script,
      data: dataset.data
    });

    return res.status(200).json(result);
  } catch (error) {
    logger.error('Failed to execute test', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to execute test'
    });
  }
}