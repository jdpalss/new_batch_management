import { format, formatDistance } from 'date-fns';

export const formatDate = (date: Date | string) => {
  const d = new Date(date);
  return format(d, 'yyyy-MM-dd');
};

export const formatDateTime = (date: Date | string) => {
  const d = new Date(date);
  return format(d, 'yyyy-MM-dd HH:mm:ss');
};

export const formatRelativeTime = (date: Date | string) => {
  const d = new Date(date);
  return formatDistance(d, new Date(), { addSuffix: true });
};

export const getLocalISOString = (date: Date) => {
  const offset = date.getTimezoneOffset() * 60000;
  const localISOTime = (new Date(date.getTime() - offset)).toISOString();
  return localISOTime.slice(0, 16); // Remove seconds and milliseconds
};