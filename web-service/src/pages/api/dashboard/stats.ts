import { NextApiRequest, NextApiResponse } from 'next';
import { DataStore } from 'nedb-promises';
import { BatchStatus } from '../../../types/batch';
import { Logger } from '../../../utils/logger';

const logger = new Logger();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const dbPath = process.env.DATABASE_PATH || './data';

    // Initialize databases
    const templatesDb = DataStore.create({
      filename: `${dbPath}/templates.db`,
      autoload: true
    });

    const datasetsDb = DataStore.create({
      filename: `${dbPath}/datasets.db`,
      autoload: true
    });

    const batchesDb = DataStore.create({
      filename: `${dbPath}/batches.db`,
      autoload: true
    });

    const resultsDb = DataStore.create({
      filename: `${dbPath}/batch-results.db`,
      autoload: true
    });

    // Fetch stats
    const [
      totalTemplates,
      totalDatasets,
      totalBatches,
      activeBatches,
      results
    ] = await Promise.all([
      templatesDb.count({}),
      datasetsDb.count({}),
      batchesDb.count({}),
      batchesDb.count({ isActive: true }),
      resultsDb.find({})
    ]);

    // Calculate success rate
    const totalExecutions = results.length;
    const successfulExecutions = results.filter(
      r => r.status === BatchStatus.SUCCESS
    ).length;
    const successRate = totalExecutions > 0
      ? (successfulExecutions / totalExecutions) * 100
      : 0;

    // Get latest execution time
    const latestResult = results.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0];

    // Get next scheduled execution
    const nextBatch = await batchesDb.findOne(
      { isActive: true },
      { sort: { nextRun: 1 } }
    );

    return res.status(200).json({
      totalTemplates,
      totalDatasets,
      totalBatches,
      activeBatches,
      successRate,
      lastExecutionTime: latestResult?.timestamp,
      nextScheduledRun: nextBatch?.nextRun
    });
  } catch (error) {
    logger.error('Failed to fetch dashboard stats', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch stats'
    });
  }
}