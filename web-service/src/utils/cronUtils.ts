import { parseExpression } from 'cron-parser';

/**
 * Cron 표현식을 사람이 읽기 쉬운 형태로 설명
 */
export const describeCronExpression = (expression: string): string => {
  try {
    const parts = expression.split(' ');
    if (parts.length !== 5 && parts.length !== 6) {
      return '유효하지 않은 Cron 표현식';
    }

    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

    const descriptions: string[] = [];

    // 분 설명
    if (minute === '*') {
      descriptions.push('매분');
    } else if (minute.includes('/')) {
      const [, interval] = minute.split('/');
      descriptions.push(`${interval}분 간격으로`);
    } else {
      descriptions.push(`${minute}분`);
    }

    // 시간 설명
    if (hour === '*') {
      descriptions.push('매시');
    } else if (hour.includes('/')) {
      const [, interval] = hour.split('/');
      descriptions.push(`${interval}시간 간격으로`);
    } else {
      descriptions.push(`${hour}시`);
    }

    // 일 설명
    if (dayOfMonth === '*') {
      descriptions.push('매일');
    } else {
      descriptions.push(`${dayOfMonth}일`);
    }

    // 월 설명
    if (month === '*') {
      descriptions.push('매월');
    } else {
      const months = {
        '1': '1월', '2': '2월', '3': '3월', '4': '4월',
        '5': '5월', '6': '6월', '7': '7월', '8': '8월',
        '9': '9월', '10': '10월', '11': '11월', '12': '12월'
      };
      descriptions.push(months[month as keyof typeof months] || month);
    }

    // 요일 설명
    if (dayOfWeek !== '*') {
      const days = {
        '0': '일요일', '1': '월요일', '2': '화요일', '3': '수요일',
        '4': '목요일', '5': '금요일', '6': '토요일',
        'MON': '월요일', 'TUE': '화요일', 'WED': '수요일',
        'THU': '목요일', 'FRI': '금요일', 'SAT': '토요일', 'SUN': '일요일'
      };

      if (dayOfWeek.includes('-')) {
        const [start, end] = dayOfWeek.split('-');
        descriptions.push(`${days[start as keyof typeof days]}부터 ${days[end as keyof typeof days]}까지`);
      } else if (dayOfWeek.includes(',')) {
        const selectedDays = dayOfWeek.split(',')
          .map(d => days[d as keyof typeof days])
          .join(', ');
        descriptions.push(`${selectedDays}에`);
      } else {
        descriptions.push(days[dayOfWeek as keyof typeof days] || dayOfWeek);
      }
    }

    return descriptions.join(' ');
  } catch (error) {
    return '유효하지 않은 Cron 표현식';
  }
};

/**
 * Cron 표현식의 다음 실행 시간을 계산
 */
export const getNextExecutionTime = (cronExpression: string): Date | null => {
  try {
    const interval = parseExpression(cronExpression);
    return interval.next().toDate();
  } catch (error) {
    return null;
  }
};

/**
 * 주어진 날짜가 Cron 표현식의 실행 시간과 일치하는지 확인
 */
export const matchesCronExpression = (cronExpression: string, date: Date): boolean => {
  try {
    const interval = parseExpression(cronExpression);
    const prev = interval.prev().toDate();
    const next = interval.next().toDate();
    
    return date >= prev && date <= next;
  } catch (error) {
    return false;
  }
};

/**
 * Cron 표현식이 유효한지 검증
 */
export const isValidCronExpression = (cronExpression: string): boolean => {
  try {
    parseExpression(cronExpression);
    return true;
  } catch (error) {
    return false;
  }
};

// 자주 사용되는 Cron 표현식 템플릿
export const CRON_TEMPLATES = {
  EVERY_MINUTE: '* * * * *',
  EVERY_HOUR: '0 * * * *',
  EVERY_DAY_MIDNIGHT: '0 0 * * *',
  EVERY_MONDAY: '0 0 * * 1',
  EVERY_FIRST_DAY: '0 0 1 * *',
  WEEKDAYS_9AM: '0 9 * * 1-5',
  WEEKENDS_9AM: '0 9 * * 0,6'
};