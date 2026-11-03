export const MAX_PG_INT = 2147483647;

export const parsePgInt = (
  value: any,
  defaultValue?: number
): number | undefined => {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }
  const parsed = parseInt(String(value), 10);
  if (isNaN(parsed) || parsed < 1 || parsed > MAX_PG_INT) {
    return undefined;
  }
  return parsed;
};

export const isValidPgInt = (id: any): boolean => {
  if (typeof id !== 'number' && typeof id !== 'string') return false;
  const num = typeof id === 'number' ? id : parseInt(String(id), 10);
  return !isNaN(num) && Number.isInteger(num) && num >= 1 && num <= MAX_PG_INT;
};
