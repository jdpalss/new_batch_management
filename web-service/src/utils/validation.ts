import { stores } from '../lib/db';
import { BatchConfig, Template, Dataset } from '../types';
import * as cronValidator from 'cron-validator';

export async function validateBatchConfig(config: Partial<BatchConfig>): Promise<void> {
  const errors: string[] = [];

  // Required fields validation
  if (!config.title?.trim()) {
    errors.push('배치명은 필수입니다');
  }

  // Template validation
  let template: Template | null = null;
  if (!config.templateId) {
    errors.push('템플릿을 선택해주세요');
  } else {
    template = await new Promise((resolve, reject) => {
      stores.templates.findOne({ id: config.templateId }, (err: any, doc: Template | null) => {
        if (err) reject(err);
        resolve(doc);
      });
    });
    
    if (!template) {
      errors.push('존재하지 않는 템플릿입니다');
    }
  }

  // Dataset validation
  if (!config.datasetId) {
    errors.push('데이터셋을 선택해주세요');
  } else {
    const dataset = await new Promise<Dataset | null>((resolve, reject) => {
      stores.datasets.findOne({ id: config.datasetId }, (err: any, doc: Dataset | null) => {
        if (err) reject(err);
        resolve(doc);
      });
    });

    if (!dataset) {
      errors.push('존재하지 않는 데이터셋입니다');
    } else if (template && dataset.templateId !== template.id) {
      errors.push('템플릿과 데이터셋이 일치하지 않습니다');
    }
  }

  // Schedule validation
  if (!config.schedule) {
    errors.push('스케줄 설정은 필수입니다');
  } else {
    if (!['periodic', 'specific'].includes(config.schedule.type)) {
      errors.push('유효하지 않은 스케줄 유형입니다');
    }

    if (config.schedule.type === 'periodic') {
      if (!config.schedule.cronExpression) {
        errors.push('Cron 표현식을 입력해주세요');
      } else if (!cronValidator.isValidCron(config.schedule.cronExpression)) {
        errors.push('유효하지 않은 Cron 표현식입니다');
      }
    }

    if (config.schedule.type === 'specific') {
      if (!Array.isArray(config.schedule.executionDates) || 
          config.schedule.executionDates.length === 0) {
        errors.push('최소 하나의 실행 일시를 선택해주세요');
      } else {
        config.schedule.executionDates.forEach((date, index) => {
          if (isNaN(new Date(date).getTime())) {
            errors.push(`${index + 1}번째 실행 일시가 유효하지 않습니다`);
          }
        });
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(errors.join(', '));
  }
}