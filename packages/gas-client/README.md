# @gas-kv-memory/gas-client

Google Apps Scriptから @gas-kv-memory/core を使用するためのクライアント。

## 設定

APIの設定オブジェクトを作成します：

```javascript
const MEMORY_API = {
  BASE_URL: 'https://example.com/v1/zone',
  TOKEN: 'your-api-token',  // 実際のトークンに置き換え
  DEFAULT_MEMORY: 'MAIN'     // デフォルトのメモリ名
};
```

## 提供される関数

### 基本操作

- `getValue(config, key, memory)` - 値を取得
- `setValue(config, key, value, memory)` - 値を保存
- `deleteKey(config, key, memory)` - キーを削除
- `existsKey(config, key, memory)` - キーの存在確認

### バッチ操作

- `getMultiple(config, keys, memory)` - 複数の値を一括取得
- `setMultiple(config, keyValues, memory)` - 複数の値を一括保存
- `getAllKeys(config, memory)` - 全キーと値を取得
- `deleteMultiple(config, keys, memory)` - 複数のキーを一括削除

### ユーティリティ

- `safeGetValue(config, key, memory, defaultValue)` - 安全にAPIを呼び出す
- `getValueWithRetry(config, key, memory, maxRetries)` - リトライ付きで呼び出す
- `getValueWithCache(config, key, cacheTtl, memory)` - キャッシュ付きで取得
- `setValueWithCache(config, key, value, memory)` - キャッシュ付きで保存

> [!IMPORTANT]
> `getValueWithCache` / `setValueWithCache` はキャッシュキーに `memory` を含めます。
> 同じ `key` を複数メモリ（例: `USERS`, `SESSIONS`）で使う場合は、必ず `memory` を明示してください。

## 使用例

詳細な使用例は [../../docs/gas-integration.md](../../docs/gas-integration.md) を参照してください。

### 基本的な使い方

```javascript
// 値を保存
setValue(MEMORY_API, 'mykey', 'myvalue');

// 値を取得
const value = getValue(MEMORY_API, 'mykey');
console.log(value);
```

### エラーハンドリング

```javascript
// 安全に取得（デフォルト値付き）
const value = safeGetValue(MEMORY_API, 'key', undefined, 'default');

// リトライ付き
const value = getValueWithRetry(MEMORY_API, 'key', undefined, 3);
```

## セットアップ

gitを使用してコードをcloneした後、移動、依存関係をインストールします。

```bash
git clone https://github.com/sphylics/gas-kv-memory.git
cd gas-kv-memory/packages/gas-client
npm install
```

gasで使用可能なjsに整形します。この際`dist`ディレクトリに追加されます。

```
npm run build
```

完成したコードは手動もしくはclaspを使用して同期し、gas上でデプロイしてください。
