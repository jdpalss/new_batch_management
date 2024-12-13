import { NextApiRequest, NextApiResponse } from 'next';
import { stores } from '../../../lib/db';
import { BatchStatus } from '../../../types/batch';
import { Logger } from '../../../utils/logger';

interface DashboardStats {
  totalTemplates: number;
  totalDatasets: number;
  totalBatches: number;
  activeBatches: number;
  successRate: number;
  lastExecutionTime?: Date;
  nextScheduledRun?: Date;
}

const logger = new Logger();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DashboardStats | { error: string }>
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Count documents
    const [
      templates,
      datasets,
      batches,
      batchResults
    ] = await Promise.all([
      stores.templates.find({}),
      stores.datasets.find({}),
      stores.batches.find({}),
      stores.batchResults.find({})
    ]);

    // Calculate stats
    const totalTemplates = templates.length;
    const totalDatasets = datasets.length;
    const totalBatches = batches.length;
    const activeBatches = batches.filter(b => b.isActive).length;

    // Calculate success rate
    const totalExecutions = batchResults.length;
    const successfulExecutions = batchResults.filter(
      r => r.status === BatchStatus.SUCCESS
    ).length;
    const successRate = totalExecutions > 0
      ? (successfulExecutions / totalExecutions) * 100
      : 0;

    // Get latest execution time and next scheduled run
    let lastExecutionTime: Date | undefined;
    let nextScheduledRun: Date | undefined;

    if (batchResults.length > 0) {
      const latestResult = batchResults.reduce((latest, current) => 
        new Date(current.timestamp) > new Date(latest.timestamp) ? current : latest
      );
      lastExecutionTime = new Date(latestResult.timestamp);
    }

    const activeBatchList = batches.filter(b => b.isActive);
    if (activeBatchList.length > 0) {
      const nextBatch = activeBatchList.reduce((earliest, current) => {
        if (!earliest.nextRun) return current;
        if (!current.nextRun) return earliest;
        return new Date(current.nextRun) < new Date(earliest.nextRun)
          ? current
          : earliest;
      });
      if (nextBatch.nextRun) {
        nextScheduledRun = new Date(nextBatch.nextRun);
      }
    }

    const stats: DashboardStats = {
      totalTemplates,
      totalDatasets,
      totalBatches,
      activeBatches,
      successRate,
      lastExecutionTime,
      nextScheduledRun
    };

    return res.status(200).json(stats);

  } catch (error) {
    logger.error('Failed to fetch dashboard stats:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal Server Error'
    });
  }
}