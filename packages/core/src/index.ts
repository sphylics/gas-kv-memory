import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type {
  Env,
  GetRequest,
  SetRequest,
  DeleteRequest,
  ExistsRequest,
  MGetRequest,
  MSetRequest,
  KeysRequest,
  MDeleteRequest,
} from './types';
import { ErrorCode } from './types';
import { success, noop, error } from './response';

const app = new Hono<{ Bindings: Env }>();

// CORS設定
app.use('*', cors());

/**
 * トークン認証ヘルパー
 */
async function validateToken(env: Env, token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const tokenExists = await env.API_TOKEN.get(token);
  return tokenExists !== null;
}

/**
 * メモリネームスペースを取得
 */
function getMemoryNamespace(env: Env, memoryName: string): KVNamespace | null {
  const bindingName = `${memoryName}_MEMORY`;
  const namespace = env[bindingName];
  if (namespace && typeof namespace === 'object' && 'get' in namespace) {
    return namespace as KVNamespace;
  }
  return null;
}

// ============================================
// API Routes - /v1/zone
// ============================================

const zone = new Hono<{ Bindings: Env }>();

/**
 * POST /get - 単一の値を取得
 */
zone.post('/get', async (c) => {
  try {
    const body = await c.req.json<GetRequest>();

    if (!await validateToken(c.env, body.token)) {
      return c.json(error(ErrorCode.INVALID_TOKEN, 'Invalid API token'), 401);
    }

    if (!body.key || !body.memory) {
      return c.json(error(ErrorCode.INVALID_REQUEST, 'key and memory are required'), 400);
    }

    const kv = getMemoryNamespace(c.env, body.memory);
    if (!kv) {
      return c.json(error(ErrorCode.MEMORY_NOT_FOUND, `Memory namespace '${body.memory}' not found`), 404);
    }

    const value = await kv.get(body.key);
    if (value === null) {
      return c.json(noop({ value: null }));
    }

    return c.json(success({ value }));
  } catch (e) {
    return c.json(error(ErrorCode.INVALID_REQUEST, 'Invalid JSON body'), 400);
  }
});

/**
 * POST /set - 単一の値を保存
 */
zone.post('/set', async (c) => {
  try {
    const body = await c.req.json<SetRequest>();

    if (!await validateToken(c.env, body.token)) {
      return c.json(error(ErrorCode.INVALID_TOKEN, 'Invalid API token'), 401);
    }

    if (!body.key || body.value === undefined || !body.memory) {
      return c.json(error(ErrorCode.INVALID_REQUEST, 'key, value, and memory are required'), 400);
    }

    const kv = getMemoryNamespace(c.env, body.memory);
    if (!kv) {
      return c.json(error(ErrorCode.MEMORY_NOT_FOUND, `Memory namespace '${body.memory}' not found`), 404);
    }

    await kv.put(body.key, body.value);
    return c.json(success({ value: body.value }));
  } catch (e) {
    return c.json(error(ErrorCode.INVALID_REQUEST, 'Invalid JSON body'), 400);
  }
});

/**
 * DELETE /delete - 単一のキーを削除
 */
zone.delete('/delete', async (c) => {
  try {
    const body = await c.req.json<DeleteRequest>();

    if (!await validateToken(c.env, body.token)) {
      return c.json(error(ErrorCode.INVALID_TOKEN, 'Invalid API token'), 401);
    }

    if (!body.key || !body.memory) {
      return c.json(error(ErrorCode.INVALID_REQUEST, 'key and memory are required'), 400);
    }

    const kv = getMemoryNamespace(c.env, body.memory);
    if (!kv) {
      return c.json(error(ErrorCode.MEMORY_NOT_FOUND, `Memory namespace '${body.memory}' not found`), 404);
    }

    await kv.delete(body.key);
    return c.json(success(null));
  } catch (e) {
    return c.json(error(ErrorCode.INVALID_REQUEST, 'Invalid JSON body'), 400);
  }
});

/**
 * POST /exists - キーの存在確認
 */
zone.post('/exists', async (c) => {
  try {
    const body = await c.req.json<ExistsRequest>();

    if (!await validateToken(c.env, body.token)) {
      return c.json(error(ErrorCode.INVALID_TOKEN, 'Invalid API token'), 401);
    }

    if (!body.key || !body.memory) {
      return c.json(error(ErrorCode.INVALID_REQUEST, 'key and memory are required'), 400);
    }

    const kv = getMemoryNamespace(c.env, body.memory);
    if (!kv) {
      return c.json(error(ErrorCode.MEMORY_NOT_FOUND, `Memory namespace '${body.memory}' not found`), 404);
    }

    const value = await kv.get(body.key);
    return c.json(success(value !== null));
  } catch (e) {
    return c.json(error(ErrorCode.INVALID_REQUEST, 'Invalid JSON body'), 400);
  }
});

/**
 * POST /mget - 複数の値を取得
 */
zone.post('/mget', async (c) => {
  try {
    const body = await c.req.json<MGetRequest>();

    if (!await validateToken(c.env, body.token)) {
      return c.json(error(ErrorCode.INVALID_TOKEN, 'Invalid API token'), 401);
    }

    if (!body.key || !Array.isArray(body.key) || !body.memory) {
      return c.json(error(ErrorCode.INVALID_REQUEST, 'key (array) and memory are required'), 400);
    }

    const kv = getMemoryNamespace(c.env, body.memory);
    if (!kv) {
      return c.json(error(ErrorCode.MEMORY_NOT_FOUND, `Memory namespace '${body.memory}' not found`), 404);
    }

    const result: Record<string, string | null> = {};
    await Promise.all(
      body.key.map(async (key) => {
        result[key] = await kv.get(key);
      })
    );

    return c.json(success(result));
  } catch (e) {
    return c.json(error(ErrorCode.INVALID_REQUEST, 'Invalid JSON body'), 400);
  }
});

/**
 * POST /mset - 複数の値を保存
 */
zone.post('/mset', async (c) => {
  try {
    const body = await c.req.json<MSetRequest>();

    if (!await validateToken(c.env, body.token)) {
      return c.json(error(ErrorCode.INVALID_TOKEN, 'Invalid API token'), 401);
    }

    if (!body.key || typeof body.key !== 'object' || !body.memory) {
      return c.json(error(ErrorCode.INVALID_REQUEST, 'key (object) and memory are required'), 400);
    }

    const kv = getMemoryNamespace(c.env, body.memory);
    if (!kv) {
      return c.json(error(ErrorCode.MEMORY_NOT_FOUND, `Memory namespace '${body.memory}' not found`), 404);
    }

    await Promise.all(
      Object.entries(body.key).map(([key, value]) => kv.put(key, value))
    );

    return c.json(success(null));
  } catch (e) {
    return c.json(error(ErrorCode.INVALID_REQUEST, 'Invalid JSON body'), 400);
  }
});

/**
 * POST /keys - 全キーと値を取得
 */
zone.post('/keys', async (c) => {
  try {
    const body = await c.req.json<KeysRequest>();

    if (!await validateToken(c.env, body.token)) {
      return c.json(error(ErrorCode.INVALID_TOKEN, 'Invalid API token'), 401);
    }

    if (!body.memory) {
      return c.json(error(ErrorCode.INVALID_REQUEST, 'memory is required'), 400);
    }

    const kv = getMemoryNamespace(c.env, body.memory);
    if (!kv) {
      return c.json(error(ErrorCode.MEMORY_NOT_FOUND, `Memory namespace '${body.memory}' not found`), 404);
    }

    const result: Record<string, string | null> = {};
    let cursor: string | undefined;

    // KVの全キーを取得（ページネーション対応）
    do {
      const list = await kv.list({ cursor });
      await Promise.all(
        list.keys.map(async ({ name }) => {
          result[name] = await kv.get(name);
        })
      );
      cursor = list.list_complete ? undefined : list.cursor;
    } while (cursor);

    return c.json(success(result));
  } catch (e) {
    return c.json(error(ErrorCode.INVALID_REQUEST, 'Invalid JSON body'), 400);
  }
});

/**
 * DELETE /mdelete - 複数のキーを削除
 */
zone.delete('/mdelete', async (c) => {
  try {
    const body = await c.req.json<MDeleteRequest>();

    if (!await validateToken(c.env, body.token)) {
      return c.json(error(ErrorCode.INVALID_TOKEN, 'Invalid API token'), 401);
    }

    if (!body.value || !Array.isArray(body.value) || !body.memory) {
      return c.json(error(ErrorCode.INVALID_REQUEST, 'value (array) and memory are required'), 400);
    }

    const kv = getMemoryNamespace(c.env, body.memory);
    if (!kv) {
      return c.json(error(ErrorCode.MEMORY_NOT_FOUND, `Memory namespace '${body.memory}' not found`), 404);
    }

    await Promise.all(
      body.value.map((key) => kv.delete(key))
    );

    return c.json(success(null));
  } catch (e) {
    return c.json(error(ErrorCode.INVALID_REQUEST, 'Invalid JSON body'), 400);
  }
});

// ルートをマウント
app.route('/v1/zone', zone);

// ヘルスチェック
app.get('/', (c) => {
  return c.json({ status: 'ok', version: 'v1' });
});

export default app;
