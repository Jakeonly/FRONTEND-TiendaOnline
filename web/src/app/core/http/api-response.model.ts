export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string | null;
}

export interface ApiErrorDetail {
  code: string;
  message: string;
  details: Record<string, unknown> | unknown[] | null;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorDetail;
}

export const isApiResponse = <T>(value: unknown): value is ApiResponse<T> => {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return 'success' in v && 'data' in v;
};

export const isApiErrorResponse = (value: unknown): value is ApiErrorResponse => {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return v['success'] === false && typeof v['error'] === 'object' && v['error'] !== null;
};
