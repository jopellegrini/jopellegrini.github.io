export const PARTIAL_DATE_PATTERN = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/;

type Precision = 'year' | 'month' | 'day';

interface PartialDate {
  year: number;
  month: number;
  day: number;
  precision: Precision;
}

const monthFormatter = new Intl.DateTimeFormat('fr-FR', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

const DAY_MS = 24 * 60 * 60 * 1000;

function parse(value: string): PartialDate {
  const match = PARTIAL_DATE_PATTERN.exec(value);
  if (!match) {
    throw new Error(`Invalid date: ${value}`);
  }
  const [, year, month, day] = match;
  return {
    year: Number(year),
    month: month ? Number(month) : 1,
    day: day ? Number(day) : 1,
    precision: day ? 'day' : month ? 'month' : 'year',
  };
}

function today(precision: Precision): PartialDate {
  const now = new Date();
  return {
    year: now.getUTCFullYear(),
    month: now.getUTCMonth() + 1,
    day: now.getUTCDate(),
    precision,
  };
}

function toUtc({ year, month, day }: PartialDate): number {
  return Date.UTC(year, month - 1, day);
}

function count(n: number, singular: string, plural: string): string {
  return `${n} ${n > 1 ? plural : singular}`;
}

function formatMonths(start: PartialDate, end: PartialDate): string {
  const months = (end.year - start.year) * 12 + end.month - start.month + 1;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return [years > 0 && count(years, 'an', 'ans'), rest > 0 && count(rest, 'mois', 'mois')]
    .filter(Boolean)
    .join(' ');
}

function formatDuration(start: PartialDate, end: PartialDate): string {
  switch (start.precision) {
    case 'year':
      return count(Math.max(1, end.year - start.year), 'an', 'ans');
    case 'month':
      return formatMonths(start, end);
    case 'day': {
      const days = Math.round((toUtc(end) - toUtc(start)) / DAY_MS) + 1;
      if (days < 7) {
        return count(days, 'jour', 'jours');
      }
      if (days < 63) {
        return count(Math.round(days / 7), 'semaine', 'semaines');
      }
      return formatMonths(start, end);
    }
  }
}

function formatLabel(date: PartialDate): string {
  return date.precision === 'year' ? String(date.year) : monthFormatter.format(toUtc(date));
}

export function describePeriod(startDate: string, endDate?: string) {
  const start = parse(startDate);
  const end = endDate ? parse(endDate) : today(start.precision);
  const startLabel = formatLabel(start);
  const endLabel = endDate ? formatLabel(end) : 'aujourd’hui';
  return {
    range: startLabel === endLabel ? startLabel : `${startLabel} - ${endLabel}`,
    duration: formatDuration(start, end),
  };
}
