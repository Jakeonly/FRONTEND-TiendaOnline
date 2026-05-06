export function normalizeSearchText(value: unknown): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function appendSearchValue(bucket: string[], value: unknown, key?: string): void {
  if (value === null || value === undefined || value === '') {
    return;
  }

  if (value instanceof Date) {
    return;
  }

  if (typeof value === 'object') {
    for (const [childKey, childValue] of Object.entries(value as Record<string, unknown>)) {
      appendSearchValue(bucket, childValue, childKey);
    }
    return;
  }

  const text = String(value);

  const normalizedKey = String(key ?? '').toLowerCase();
  const looksLikeDate =
    normalizedKey.includes('fecha') ||
    normalizedKey.includes('date') ||
    /^\d{4}-\d{2}-\d{2}/.test(text) ||
    /^\d{4}\/\d{2}\/\d{2}/.test(text);

  if (looksLikeDate) {
    return;
  }

  bucket.push(text);
}

export function buildSearchCorpus(value: unknown): string {
  const bucket: string[] = [];
  appendSearchValue(bucket, value);
  return bucket.join(' ');
}

interface SearchState {
  text: string;
  date: string;
}

export function serializeSearchState(text: string, date: string): string {
  return JSON.stringify({ text, date });
}

function parseSearchState(filter: string): SearchState {
  try {
    const parsed = JSON.parse(filter) as Partial<SearchState>;
    return {
      text: typeof parsed.text === 'string' ? parsed.text : filter,
      date: typeof parsed.date === 'string' ? parsed.date : '',
    };
  } catch {
    return { text: filter, date: '' };
  }
}

export function normalizeDateSelection(value: string | null | undefined): string {
  const text = String(value ?? '').trim();
  if (!text) {
    return '';
  }

  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function dateToLocalKey(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function matchesSelectedDate(values: unknown[], selectedDate: string): boolean {
  const normalizedSelectedDate = normalizeDateSelection(selectedDate);
  if (!normalizedSelectedDate) {
    return true;
  }

  return values.some((value) => dateToLocalKey(value) === normalizedSelectedDate);
}

export function createTextAndDateFilterPredicate<T>(
  getDateValues: (row: T) => unknown[],
  getExtraText?: (row: T) => string,
): (row: T, filter: string) => boolean {
  return (row: T, filter: string) => {
    const { text, date } = parseSearchState(filter);
    const normalizedFilter = normalizeSearchText(text);
    const textMatches = !normalizedFilter || normalizeSearchText([buildSearchCorpus(row), getExtraText?.(row) ?? ''].join(' ')).includes(normalizedFilter);
    const dateMatches = matchesSelectedDate(getDateValues(row), date);

    return textMatches && dateMatches;
  };
}

export function createTextFilterPredicate<T>(getExtraText?: (row: T) => string): (row: T, filter: string) => boolean {
  return (row: T, filter: string) => {
    const normalizedFilter = normalizeSearchText(filter);
    if (!normalizedFilter) {
      return true;
    }

    const rowText = normalizeSearchText([buildSearchCorpus(row), getExtraText?.(row) ?? ''].join(' '));
    return rowText.includes(normalizedFilter);
  };
}