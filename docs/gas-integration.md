# Google Apps Script 連携ガイド

gas-kv-memoryをGoogle Apps Script (GAS)から使用する方法を説明します。

## 基本的な使い方

### APIクライアント関数

以下のコードをGASプロジェクトに追加します：

```javascript
/**
 * gas-kv-memory API設定
 */
const MEMORY_API = {
  BASE_URL: 'https://memory.math-u-t.workers.dev/v1/zone',
  TOKEN: 'your-api-token',  // 実際のトークンに置き換え
  DEFAULT_MEMORY: 'MAIN'     // デフォルトのメモリ名
};

/**
 * APIリクエストを送信
 * @param {string} endpoint - エンドポイント（例: '/get'）
 * @param {string} method - HTTPメソッド
 * @param {Object} payload - リクエストボディ
 * @returns {Object} APIレスポンス
 */
function callMemoryAPI_(endpoint, method, payload) {
  const options = {
    'method': method,
    'contentType': 'application/json',
    'payload': JSON.stringify({
      ...payload,
      token: MEMORY_API.TOKEN
    }),
    'muteHttpExceptions': true
  };

  const response = UrlFetchApp.fetch(MEMORY_API.BASE_URL + endpoint, options);
  const result = JSON.parse(response.getContentText());

  if (!result.ok) {
    throw new Error(`API Error: ${result.error.code} - ${result.error.message}`);
  }

  return result;
}
```

### 基本操作関数

```javascript
/**
 * 値を取得
 * @param {string} key - キー
 * @param {string} [memory] - メモリ名（省略時はデフォルト）
 * @returns {string|null} 値
 */
function getValue(key, memory) {
  const result = callMemoryAPI_('/get', 'get', {
    key: key,
    memory: memory || MEMORY_API.DEFAULT_MEMORY
  });
  return result.content.value;
}

/**
 * 値を保存
 * @param {string} key - キー
 * @param {string} value - 値
 * @param {string} [memory] - メモリ名（省略時はデフォルト）
 */
function setValue(key, value, memory) {
  callMemoryAPI_('/set', 'post', {
    key: key,
    value: value,
    memory: memory || MEMORY_API.DEFAULT_MEMORY
  });
}

/**
 * キーを削除
 * @param {string} key - キー
 * @param {string} [memory] - メモリ名（省略時はデフォルト）
 */
function deleteKey(key, memory) {
  callMemoryAPI_('/delete', 'delete', {
    key: key,
    memory: memory || MEMORY_API.DEFAULT_MEMORY
  });
}

/**
 * キーの存在確認
 * @param {string} key - キー
 * @param {string} [memory] - メモリ名（省略時はデフォルト）
 * @returns {boolean} 存在する場合true
 */
function existsKey(key, memory) {
  const result = callMemoryAPI_('/exists', 'get', {
    key: key,
    memory: memory || MEMORY_API.DEFAULT_MEMORY
  });
  return result.content;
}
```

### バッチ操作関数

```javascript
/**
 * 複数の値を一括取得
 * @param {string[]} keys - キーの配列
 * @param {string} [memory] - メモリ名
 * @returns {Object} キーと値のオブジェクト
 */
function getMultiple(keys, memory) {
  const result = callMemoryAPI_('/mget', 'get', {
    key: keys,
    memory: memory || MEMORY_API.DEFAULT_MEMORY
  });
  return result.content;
}

/**
 * 複数の値を一括保存
 * @param {Object} keyValues - キーと値のオブジェクト
 * @param {string} [memory] - メモリ名
 */
function setMultiple(keyValues, memory) {
  callMemoryAPI_('/mset', 'post', {
    key: keyValues,
    memory: memory || MEMORY_API.DEFAULT_MEMORY
  });
}

/**
 * 全キーと値を取得
 * @param {string} [memory] - メモリ名
 * @returns {Object} 全キーと値のオブジェクト
 */
function getAllKeys(memory) {
  const result = callMemoryAPI_('/keys', 'get', {
    memory: memory || MEMORY_API.DEFAULT_MEMORY
  });
  return result.content;
}

/**
 * 複数のキーを一括削除
 * @param {string[]} keys - キーの配列
 * @param {string} [memory] - メモリ名
 */
function deleteMultiple(keys, memory) {
  callMemoryAPI_('/mdelete', 'delete', {
    value: keys,
    memory: memory || MEMORY_API.DEFAULT_MEMORY
  });
}
```

## 使用例

### ユーザーデータの管理

```javascript
// ユーザー情報を保存
function saveUser(userId, userData) {
  setValue(`user:${userId}`, JSON.stringify(userData), 'USERS');
}

// ユーザー情報を取得
function getUser(userId) {
  const data = getValue(`user:${userId}`, 'USERS');
  return data ? JSON.parse(data) : null;
}

// 使用例
function testUserManagement() {
  // 保存
  saveUser('123', {
    name: '山田太郎',
    email: 'taro@example.com',
    createdAt: new Date().toISOString()
  });

  // 取得
  const user = getUser('123');
  Logger.log(user.name); // 山田太郎
}
```

### スプレッドシートとの連携

```javascript
/**
 * スプレッドシートのデータをKVに保存
 */
function syncSheetToKV() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const data = sheet.getDataRange().getValues();
  const header = data[0];

  const keyValues = {};
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const id = row[0];
    const record = {};
    for (let j = 1; j < header.length; j++) {
      record[header[j]] = row[j];
    }
    keyValues[`record:${id}`] = JSON.stringify(record);
  }

  setMultiple(keyValues, 'SHEET_DATA');
  Logger.log(`${Object.keys(keyValues).length}件のレコードを同期しました`);
}

/**
 * KVからスプレッドシートにデータを復元
 */
function syncKVToSheet() {
  const allData = getAllKeys('SHEET_DATA');
  const sheet = SpreadsheetApp.getActiveSheet();

  // ヘッダー以外をクリア
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clear();
  }

  let row = 2;
  for (const [key, value] of Object.entries(allData)) {
    if (value && key.startsWith('record:')) {
      const id = key.replace('record:', '');
      const record = JSON.parse(value);
      sheet.getRange(row, 1).setValue(id);
      // 以降の列にデータを設定
      row++;
    }
  }
}
```

### キャッシュとの併用

GASのCacheServiceと組み合わせてパフォーマンスを向上：

```javascript
/**
 * キャッシュ付きで値を取得
 * @param {string} key - キー
 * @param {number} [cacheTtl=300] - キャッシュの有効期限（秒）
 * @returns {string|null} 値
 */
function getValueWithCache(key, cacheTtl) {
  const cache = CacheService.getScriptCache();
  const cacheKey = `kv:${key}`;

  // キャッシュを確認
  let value = cache.get(cacheKey);
  if (value !== null) {
    return value;
  }

  // KVから取得
  value = getValue(key);
  if (value !== null) {
    cache.put(cacheKey, value, cacheTtl || 300);
  }

  return value;
}

/**
 * 値を保存（キャッシュも更新）
 * @param {string} key - キー
 * @param {string} value - 値
 */
function setValueWithCache(key, value) {
  const cache = CacheService.getScriptCache();
  const cacheKey = `kv:${key}`;

  // KVに保存
  setValue(key, value);

  // キャッシュを更新
  cache.put(cacheKey, value, 300);
}
```

## エラーハンドリング

```javascript
/**
 * 安全にAPIを呼び出す
 */
function safeGetValue(key, memory, defaultValue) {
  try {
    const value = getValue(key, memory);
    return value !== null ? value : defaultValue;
  } catch (e) {
    Logger.log(`Error getting value for key ${key}: ${e.message}`);
    return defaultValue;
  }
}

/**
 * リトライ付きでAPIを呼び出す
 */
function getValueWithRetry(key, memory, maxRetries) {
  maxRetries = maxRetries || 3;
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return getValue(key, memory);
    } catch (e) {
      lastError = e;
      Logger.log(`Retry ${i + 1}/${maxRetries}: ${e.message}`);
      Utilities.sleep(1000 * Math.pow(2, i)); // 指数バックオフ
    }
  }

  throw lastError;
}
```

## 注意事項

1. **API呼び出し制限**: GASには1日あたりのUrlFetchApp呼び出し制限があります（無料アカウントで約20,000回）
2. **レスポンスサイズ**: `/keys`エンドポイントは大量のデータを返す可能性があります
3. **トークン管理**: トークンはPropertiesServiceに保存することを推奨します

```javascript
// トークンをプロパティに保存
function setApiToken(token) {
  PropertiesService.getScriptProperties().setProperty('MEMORY_API_TOKEN', token);
}

// トークンをプロパティから取得
function getApiToken() {
  return PropertiesService.getScriptProperties().getProperty('MEMORY_API_TOKEN');
}
```
