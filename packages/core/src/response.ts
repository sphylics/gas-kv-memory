import type { ApiResponse, ErrorCodeType } from './types';

/**
 * 成功レスポンスを生成
 */
export function success<T>(content: T): ApiResponse<T> {
  return {
    ok: true,
    status: 'SUCCESS',
    decision: 'CONTINUE',
    content,
  };
}

/**
 * NOOP(期待される失敗、継続)レスポンスを生成
 */
export function noop<T>(content: T): ApiResponse<T> {
  return {
    ok: true,
    status: 'NOOP',
    decision: 'CONTINUE',
    content,
  };
}

/**
 * エラーレスポンスを生成
 */
export function error(code: ErrorCodeType, message: string): ApiResponse<never> {
  return {
    ok: false,
    status: 'ERROR',
    decision: 'STOP',
    content: null,
    error: {
      code,
      message,
    },
  };
}
