import * as cronParser from 'cron-parser';

export const cronValidator = {
  isValidCron: (expression: string): boolean => {
    try {
      cronParser.parseExpression(expression);
      return true;
    } catch (error) {
      return false;
    }
  },

  getNextExecutionDates: (expression: string, count: number = 5): Date[] => {
    try {
      const interval = cronParser.parseExpression(expression);
      const dates: Date[] = [];
      
      for (let i = 0; i < count; i++) {
        dates.push(interval.next().toDate());
      }
      
      return dates;
    } catch (error) {
      return [];
    }
  },

  // Cron 표현식 도우미 함수들
  presets: {
    everyMinute: '* * * * *',
    everyHour: '0 * * * *',
    everyDay: '0 0 * * *',
    everyWeek: '0 0 * * 0',
    everyMonth: '0 0 1 * *',
  },

  // 사람이 읽기 쉬운 형태로 변환
  humanizeExpression: (expression: string): string => {
    const parts = expression.split(' ');
    if (parts.length !== 5) return '잘못된 Cron 표현식';

    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

    if (expression === cronValidator.presets.everyMinute) return '매분';
    if (expression === cronValidator.presets.everyHour) return '매시 정각';
    if (expression === cronValidator.presets.everyDay) return '매일 자정';
    if (expression === cronValidator.presets.everyWeek) return '매주 일요일 자정';
    if (expression === cronValidator.presets.everyMonth) return '매월 1일 자정';

    const descriptions = [];
    
    // 분 해석
    if (minute === '*') descriptions.push('매분');
    else if (minute.includes('/')) descriptions.push(`${minute.split('/')[1]}분 간격`);
    else descriptions.push(`${minute}분`);

    // 시간 해석
    if (hour === '*') descriptions.push('매시');
    else descriptions.push(`${hour}시`);

    // 날짜 해석
    if (dayOfMonth !== '*') descriptions.push(`${dayOfMonth}일`);
    if (dayOfWeek !== '*') {
      const days = ['일', '월', '화', '수', '목', '금', '토'];
      const dayNames = dayOfWeek.split(',').map(d => days[parseInt(d)]);
      descriptions.push(`${dayNames.join(',')}요일`);
    }

    return descriptions.join(' ');
  }
};

export const validateCronExpression = (expression: string): { 
  isValid: boolean; 
  error?: string;
  nextExecutions?: Date[];
} => {
  try {
    if (!expression.trim()) {
      return { isValid: false, error: 'Cron 표현식을 입력해주세요' };
    }

    const interval = cronParser.parseExpression(expression);
    const nextExecutions = [];
    
    // 다음 5번의 실행 시간 계산
    for (let i = 0; i < 5; i++) {
      nextExecutions.push(interval.next().toDate());
    }

    return { 
      isValid: true,
      nextExecutions 
    };
  } catch (error) {
    return { 
      isValid: false, 
      error: '유효하지 않은 Cron 표현식입니다' 
    };
  }
};

export const getCronHelp = () => {
  return {
    format: '분 시 일 월 요일',
    examples: [
      { expression: '0 0 * * *', description: '매일 자정' },
      { expression: '0 9 * * 1-5', description: '평일 오전 9시' },
      { expression: '0 */2 * * *', description: '2시간 마다' },
      { expression: '0 9-17 * * *', description: '매일 오전 9시부터 오후 5시까지 1시간 간격' },
      { expression: '0 0 1,15 * *', description: '매월 1일과 15일 자정' }
    ],
    specialCharacters: [
      { char: '*', description: '모든 값' },
      { char: ',', description: '값 리스트 구분' },
      { char: '-', description: '범위 지정' },
      { char: '/', description: '간격 지정' }
    ],
    constraints: {
      minutes: '0-59',
      hours: '0-23',
      dayOfMonth: '1-31',
      month: '1-12',
      dayOfWeek: '0-6 (0: 일요일)'
    }
  };
};
