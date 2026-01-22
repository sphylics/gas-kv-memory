/**
 * APIレスポンスの型定義
 */

export type ResponseStatus = 'SUCCESS' | 'NOOP' | 'ERROR';
export type ResponseDecision = 'CONTINUE' | 'STOP';

export interface SuccessResponse<T> {
  ok: true;
  status: 'SUCCESS' | 'NOOP';
  decision: 'CONTINUE';
  content: T;
}

export interface ErrorResponse {
  ok: false;
  status: 'ERROR';
  decision: 'STOP';
  content: null;
  error: {
    code: string;
    message: string;
  };
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

/**
 * エラーコード
 */
export const ErrorCode = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  INVALID_REQUEST: 'INVALID_REQUEST',
  MEMORY_NOT_FOUND: 'MEMORY_NOT_FOUND',
  KEY_NOT_FOUND: 'KEY_NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];

/**
 * リクエストボディの型定義
 */
export interface BaseRequest {
  memory: string;
  token: string;
}

export interface GetRequest extends BaseRequest {
  key: string;
}

export interface SetRequest extends BaseRequest {
  key: string;
  value: string;
}

export interface DeleteRequest extends BaseRequest {
  key: string;
}

export interface ExistsRequest extends BaseRequest {
  key: string;
}

export interface MGetRequest extends BaseRequest {
  key: string[];
}

export interface MSetRequest extends BaseRequest {
  key: Record<string, string>;
}

export interface KeysRequest extends BaseRequest {}

export interface MDeleteRequest extends BaseRequest {
  value: string[];
}

/**
 * KV Namespace bindings
 */
export interface Env {
  API_TOKEN: KVNamespace;
  MEMORY_LIST: KVNamespace;
  [key: string]: KVNamespace | unknown;
}
