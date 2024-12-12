import { parseExpression, CronExpression } from 'cron-parser';
import cronstrue from 'cronstrue';

export const parseCronExpression = (expression: string): CronExpression => {
  return parseExpression(expression, {
    currentDate: new Date(),
    iterator: true,
  });
};

export const getNextExecutionTimes = (expression: string, count: number = 5): Date[] => {
  const interval = parseCronExpression(expression);
  const times: Date[] = [];

  for (let i = 0; i < count; i++) {
    times.push(interval.next().toDate());
  }

  return times;
};

export const describeCronExpression = (expression: string): string => {
  try {
    return cronstrue.toString(expression);
  } catch (error) {
    return 'Invalid cron expression';
  }
};

export const validateCronExpression = (expression: string): boolean => {
  try {
    parseExpression(expression);
    return true;
  } catch (error) {
    return false;
  }
};

export const generateCommonCronExpressions = () => [
  { label: 'Every minute', value: '* * * * *' },
  { label: 'Every hour', value: '0 * * * *' },
  { label: 'Every day at midnight', value: '0 0 * * *' },
  { label: 'Every day at noon', value: '0 12 * * *' },
  { label: 'Every Monday at 9:00', value: '0 9 * * 1' },
  { label: 'Every weekday at 9:00', value: '0 9 * * 1-5' },
  { label: 'First day of month at 00:00', value: '0 0 1 * *' },
];

export const calculateNextRandomExecution = (
  baseTime: Date,
  maxDelayMinutes: number = 30
): Date => {
  const delayMs = Math.floor(Math.random() * maxDelayMinutes * 60 * 1000);
  return new Date(baseTime.getTime() + delayMs);
};