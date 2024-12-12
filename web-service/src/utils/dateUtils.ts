import { format } from 'date-fns';

export const formatDateTime = (date: Date | string | number): string => {
  const d = new Date(date);
  return format(d, 'yyyy-MM-dd HH:mm:ss');
};

export const formatDate = (date: Date | string | number): string => {
  const d = new Date(date);
  return format(d, 'yyyy-MM-dd');
};

export const formatTime = (date: Date | string | number): string => {
  const d = new Date(date);
  return format(d, 'HH:mm:ss');
};

export const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`;
  
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
};