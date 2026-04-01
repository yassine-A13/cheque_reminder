export function formatDisplayDate(value: string, withTime = false) {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    ...(withTime ? { timeStyle: 'short' } : {}),
  }).format(new Date(value));
}

export function isExpiredDate(value: string) {
  return new Date(value).getTime() < Date.now();
}

export function isDueWithinHours(value: string, hours: number) {
  const date = new Date(value).getTime();
  const now = Date.now();
  return date >= now && date <= now + hours * 60 * 60 * 1000;
}
