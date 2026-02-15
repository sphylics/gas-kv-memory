# Google Apps Script 連携ガイド

gas-kv-memoryをGoogle Apps Script (GAS)から使用する方法を説明します。

## インストール

gas-kv-memoryに含まれる `@gas-kv-memory/gas-client` パッケージを使用します：

```bash
cd packages/gas-client
npm install
npm run build # gasに直接アップロードできるjs形式に変換しdistに入る
```

詳細は [gas-client README](../packages/gas-client/README.md) を参照してください。

## 基本的な使い方

### APIクライアント関数

以下のコードをGASプロジェクトに追加します（`@gas-kv-memory/gas-client` から import）：

```javascript
/**
 * gas-kv-memory API設定
 */
const MEMORY_API = {
  BASE_URL: 'https://example.com/v1/zone',
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

詳細な実装は [packages/gas-client/src/client.ts](../packages/gas-client/src/client.ts) を参照してください。

### 基本操作関数

`@gas-kv-memory/gas-client` から提供される関数を使用します。

#### getValue(config, key, memory)
値を取得

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
  const result = callMemoryAPI_('/exists', 'post', {
    key: key,
    memory: memory || MEMORY_API.DEFAULT_MEMORY
  });
  return result.content;
}
```

詳細な実装は [packages/gas-client/src/client.ts](../packages/gas-client/src/client.ts) を参照してください。

### バッチ操作関数

`@gas-kv-memory/gas-client` から提供される関数：

## 使用例

詳細な使用例は [packages/gas-client](../packages/gas-client) を参照してください。

### ユーザーデータの管理

```javascript
// ユーザー情報を保存
function saveUser(userId, userData) {
  setValue(MEMORY_API, `user:${userId}`, JSON.stringify(userData), 'USERS');
}

// ユーザー情報を取得
function getUser(userId) {
  const data = getValue(MEMORY_API, `user:${userId}`, 'USERS');
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
  console.log(user.name); // 山田太郎
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

  setMultiple(MEMORY_API, keyValues, 'SHEET_DATA');
  console.log(`${Object.keys(keyValues).length}件のレコードを同期しました`);
}

/**
 * KVからスプレッドシートにデータを復元
 */
function syncKVToSheet() {
  const allData = getAllKeys(MEMORY_API, 'SHEET_DATA');
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
 * memory を省略した場合は DEFAULT_MEMORY が使われる
 */
function getValueWithCacheSafe(key, memory, cacheTtl) {
  return getValueWithCache(MEMORY_API, key, cacheTtl || 300, memory);
}

/**
 * 値を保存（キャッシュも更新）
 */
function setValueWithCacheSafe(key, value, memory) {
  return setValueWithCache(MEMORY_API, key, value, memory);
}
```

> [!IMPORTANT]
> キャッシュキーは `kv:${memory}:${key}` 形式です。`memory` を分離しないと、同名キーが別メモリ間で衝突して誤読するため、
> マルチメモリ運用では `memory` を必ず渡してください。

詳細な実装は [packages/gas-client/src/client.ts](../packages/gas-client/src/client.ts) を参照してください。

## エラーハンドリング

`@gas-kv-memory/gas-client` で提供される関数：

```javascript
/**
 * 安全にAPIを呼び出す
 */
function safeGetValue(key, memory, defaultValue) {
  return safeGetValue(MEMORY_API, key, memory, defaultValue);
}

/**
 * リトライ付きでAPIを呼び出す
 */
function getValueWithRetry(key, memory, maxRetries) {
  return getValueWithRetry(MEMORY_API, key, memory, maxRetries || 3);
}
```

詳細な実装は [packages/gas-client/src/client.ts](../packages/gas-client/src/client.ts) を参照してください。

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

// 使用例
const MEMORY_API = {
  BASE_URL: 'https://example.com/v1/zone',
  TOKEN: getApiToken(),  // プロパティから取得
  DEFAULT_MEMORY: 'MAIN'
};
```

## パッケージ構成

このリポジトリは monorepo 構成で、以下のパッケージを含みます：

- [packages/core](../packages/core) - Cloudflare Workers API サーバー
- [packages/gas-client](../packages/gas-client) - Google Apps Script クライアント

詳細は各パッケージの README を参照してください。
