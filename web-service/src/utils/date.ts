/**
 * 날짜를 yyyy-MM-dd HH:mm:ss 형식의 문자열로 변환
 */
export const formatDateTime = (date: Date | string | number): string => {
  const d = new Date(date);
  return d.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

/**
 * 날짜를 yyyy-MM-dd 형식의 문자열로 변환
 */
export const formatDate = (date: Date | string | number): string => {
  const d = new Date(date);
  return d.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

/**
 * 시간을 HH:mm:ss 형식의 문자열로 변환
 */
export const formatTime = (date: Date | string | number): string => {
  const d = new Date(date);
  return d.toLocaleString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

/**
 * 밀리초를 사람이 읽기 쉬운 형식으로 변환 (예: 1시간 30분 20초)
 */
export const formatDuration = (ms: number): string => {
  if (ms < 1000) return '1초 미만';

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  const remainingMinutes = minutes % 60;
  const remainingSeconds = seconds % 60;

  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours}시간`);
  }
  if (remainingMinutes > 0) {
    parts.push(`${remainingMinutes}분`);
  }
  if (remainingSeconds > 0) {
    parts.push(`${remainingSeconds}초`);
  }

  return parts.join(' ');
};

/**
 * 현재 시점과의 상대적인 시간 차이를 표시 (예: 5분 전, 1시간 전)
 */
export const formatRelativeTime = (date: Date | string | number): string => {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}일 전`;
  }
  if (hours > 0) {
    return `${hours}시간 전`;
  }
  if (minutes > 0) {
    return `${minutes}분 전`;
  }
  if (seconds > 0) {
    return `${seconds}초 전`;
  }
  return '방금 전';
};

/**
 * 날짜가 유효한지 확인
 */
export const isValidDate = (date: any): boolean => {
  if (!date) return false;
  const d = new Date(date);
  return d instanceof Date && !isNaN(d.getTime());
};