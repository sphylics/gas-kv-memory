/// <reference path="./google-apps-script.d.ts" />

/**
 * gas-kv-memory API設定
 * @typedef {Object} MemoryAPIConfig
 * @property {string} BASE_URL - API base URL
 * @property {string} TOKEN - API authentication token
 * @property {string} DEFAULT_MEMORY - Default memory namespace
 */
interface MemoryAPIConfig {
  BASE_URL: string;
  TOKEN: string;
  DEFAULT_MEMORY: string;
}

/**
 * APIリクエストを送信
 * @param config - API設定
 * @param endpoint - エンドポイント（例: '/get'）
 * @param method - HTTPメソッド
 * @param payload - リクエストボディ
 * @returns APIレスポンス
 */
function callMemoryAPI_(
  config: MemoryAPIConfig,
  endpoint: string,
  method: 'get' | 'post' | 'delete',
  payload: Record<string, unknown>
): Record<string, unknown> {
  const options = {
    method: method.toUpperCase(),
    contentType: 'application/json',
    payload: JSON.stringify({
      ...payload,
      token: config.TOKEN,
    }),
    muteHttpExceptions: true,
  };

  const response = UrlFetchApp.fetch(config.BASE_URL + endpoint, options as any);
  const result = JSON.parse(response.getContentText());

  if (!result.ok) {
    throw new Error(`API Error: ${result.error.code} - ${result.error.message}`);
  }

  return result;
}

/**
 * 値を取得
 * @param config - API設定
 * @param key - キー
 * @param memory - メモリ名
 * @returns 値
 */
function getValue(config: MemoryAPIConfig, key: string, memory?: string): string | null {
  const result = callMemoryAPI_(config, '/get', 'post', {
    key,
    memory: memory || config.DEFAULT_MEMORY,
  });
  return (result.content as any)?.value || null;
}

/**
 * 値を保存
 * @param config - API設定
 * @param key - キー
 * @param value - 値
 * @param memory - メモリ名
 */
function setValue(config: MemoryAPIConfig, key: string, value: string, memory?: string): void {
  callMemoryAPI_(config, '/set', 'post', {
    key,
    value,
    memory: memory || config.DEFAULT_MEMORY,
  });
}

/**
 * キーを削除
 * @param config - API設定
 * @param key - キー
 * @param memory - メモリ名
 */
function deleteKey(config: MemoryAPIConfig, key: string, memory?: string): void {
  callMemoryAPI_(config, '/delete', 'delete', {
    key,
    memory: memory || config.DEFAULT_MEMORY,
  });
}

/**
 * キーの存在確認
 * @param config - API設定
 * @param key - キー
 * @param memory - メモリ名
 * @returns 存在する場合true
 */
function existsKey(config: MemoryAPIConfig, key: string, memory?: string): boolean {
  const result = callMemoryAPI_(config, '/exists', 'post', {
    key,
    memory: memory || config.DEFAULT_MEMORY,
  });
  return (result.content as any) === true;
}

/**
 * 複数の値を一括取得
 * @param config - API設定
 * @param keys - キーの配列
 * @param memory - メモリ名
 * @returns キーと値のオブジェクト
 */
function getMultiple(config: MemoryAPIConfig, keys: string[], memory?: string): Record<string, string | null> {
  const result = callMemoryAPI_(config, '/mget', 'post', {
    key: keys,
    memory: memory || config.DEFAULT_MEMORY,
  });
  return (result.content as any) || {};
}

/**
 * 複数の値を一括保存
 * @param config - API設定
 * @param keyValues - キーと値のオブジェクト
 * @param memory - メモリ名
 */
function setMultiple(config: MemoryAPIConfig, keyValues: Record<string, string>, memory?: string): void {
  callMemoryAPI_(config, '/mset', 'post', {
    key: keyValues,
    memory: memory || config.DEFAULT_MEMORY,
  });
}

/**
 * 全キーと値を取得
 * @param config - API設定
 * @param memory - メモリ名
 * @returns 全キーと値のオブジェクト
 */
function getAllKeys(config: MemoryAPIConfig, memory?: string): Record<string, string | null> {
  const result = callMemoryAPI_(config, '/keys', 'post', {
    memory: memory || config.DEFAULT_MEMORY,
  });
  return (result.content as any) || {};
}

/**
 * 複数のキーを一括削除
 * @param config - API設定
 * @param keys - キーの配列
 * @param memory - メモリ名
 */
function deleteMultiple(config: MemoryAPIConfig, keys: string[], memory?: string): void {
  callMemoryAPI_(config, '/mdelete', 'delete', {
    value: keys,
    memory: memory || config.DEFAULT_MEMORY,
  });
}

/**
 * 安全にAPIを呼び出す
 * @param config - API設定
 * @param key - キー
 * @param memory - メモリ名
 * @param defaultValue - デフォルト値
 * @returns 値またはデフォルト値
 */
function safeGetValue(
  config: MemoryAPIConfig,
  key: string,
  memory?: string,
  defaultValue: string | null = null
): string | null {
  try {
    const value = getValue(config, key, memory);
    return value !== null ? value : defaultValue;
  } catch (e) {
    console.error(`Error getting value for key ${key}: ${(e as any).message}`);
    return defaultValue;
  }
}

/**
 * リトライ付きでAPIを呼び出す
 * @param config - API設定
 * @param key - キー
 * @param memory - メモリ名
 * @param maxRetries - 最大リトライ回数
 * @returns 値
 */
function getValueWithRetry(
  config: MemoryAPIConfig,
  key: string,
  memory?: string,
  maxRetries: number = 3
): string | null {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return getValue(config, key, memory);
    } catch (e) {
      lastError = e as Error;
      console.log(`Retry ${i + 1}/${maxRetries}: ${lastError.message}`);
      Utilities.sleep(1000 * Math.pow(2, i)); // 指数バックオフ
    }
  }

  throw lastError;
}

/**
 * キャッシュ付きで値を取得
 * @param config - API設定
 * @param key - キー
 * @param cacheTtl - キャッシュの有効期限（秒）
 * @returns 値
 */
function getValueWithCache(config: MemoryAPIConfig, key: string, cacheTtl: number = 300): string | null {
  const cache = CacheService.getScriptCache();
  const cacheKey = `kv:${key}`;

  // キャッシュを確認
  let value = cache.get(cacheKey);
  if (value !== null) {
    return value;
  }

  // KVから取得
  value = getValue(config, key);
  if (value !== null) {
    cache.put(cacheKey, value, cacheTtl);
  }

  return value;
}

/**
 * 値を保存（キャッシュも更新）
 * @param config - API設定
 * @param key - キー
 * @param value - 値
 */
function setValueWithCache(config: MemoryAPIConfig, key: string, value: string): void {
  const cache = CacheService.getScriptCache();
  const cacheKey = `kv:${key}`;

  // KVに保存
  setValue(config, key, value);

  // キャッシュを更新
  cache.put(cacheKey, value, 300);
}

// Export for use in GAS
export {
  MemoryAPIConfig,
  callMemoryAPI_,
  getValue,
  setValue,
  deleteKey,
  existsKey,
  getMultiple,
  setMultiple,
  getAllKeys,
  deleteMultiple,
  safeGetValue,
  getValueWithRetry,
  getValueWithCache,
  setValueWithCache,
};
