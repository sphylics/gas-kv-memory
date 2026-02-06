# gas-kv-memory

GoogleAppsScriptで使用できる軽量な外部KVストレージ。Cloudflare Workers + KVを使用。

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. KV Namespaceの作成

CloudflareダッシュボードまたはwranglerコマンドでKV Namespaceを作成:

```bash
# API Token用
wrangler kv namespace create "API_TOKEN"

# Memory List用
wrangler kv namespace create "MEMORY_LIST"

# 実際のメモリネームスペース
wrangler kv namespace create "EXAMPLE_MEMORY"
```

### 3. wrangler.jsonの設定

`wrangler.json`のコメントを外し、作成したKV NamespaceのIDを設定:

```json
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "your-worker-name",
  "main": "src/index.ts",
  "compatibility_date": "2026-01-23",
  "kv_namespaces": [
    {
      "binding": "API_TOKEN",
      "id": "YOUR_API_TOKEN-namespace-id"
    },
    {
      "binding": "MEMORY_LIST",
      "id": "your-memory-list-namespace-id"
    },
    {
      "binding": "EXAMPLE_MEMORY",
      "id": "your-example-memory-namespace-id"
    }
  ]
}
```

### 4. APIトークンの登録

```bash
# 基本的な書き方
wrangler kv key put --binding API_TOKEN "your-secret-token" "active"
```

### 5. デプロイ

```bash
npm run deploy
```

## 開発

```bash
npm run dev      # ローカル開発サーバー
npm run typecheck # 型チェック
```

## API仕様

Base URL: `https://example.com/v1/zone`

### レスポンス形式

すべてのエンドポイントは統一されたレスポンス形式を返します:

```json
{
  "ok": true,
  "status": "SUCCESS",
  "decision": "CONTINUE",
  "content": { ... }
}
```

### エンドポイント

| メソッド | パス | 説明 |
|---------|------|------|
| POST | /get | 単一の値を取得 |
| POST | /set | 単一の値を保存 |
| DELETE | /delete | 単一のキーを削除 |
| POST | /exists | キーの存在確認 |
| POST | /mget | 複数の値を取得 |
| POST | /mset | 複数の値を保存 |
| POST | /keys | 全キーと値を取得 |
| DELETE | /mdelete | 複数のキーを削除 |

## Google Apps Scriptでの使用例

```javascript
function callMemoryAPI(endpoint, method, payload) {
  const options = {
    'method': method,
    'contentType': 'application/json',
    'payload': JSON.stringify(payload),
    'muteHttpExceptions': true
  };
  const response = UrlFetchApp.fetch(
    'https://example.com/v1/zone' + endpoint,
    options
  );
  return JSON.parse(response.getContentText());
}

// 値を保存
function setMemory(key, value) {
  return callMemoryAPI('/set', 'post', {
    key: key,
    value: value,
    memory: 'EXAMPLE',
    token: 'YOUR_API_TOKEN'
  });
}

// 値を取得
function getMemory(key) {
  return callMemoryAPI('/get', 'post', {
    key: key,
    memory: 'EXAMPLE',
    token: 'YOUR_API_TOKEN'
  });
}
```

## ドキュメント

詳細なドキュメントは[docs](./docs)ディレクトリを参照してください：

- [セットアップガイド](./docs/setup.md) - インストールからデプロイまで
- [APIリファレンス](./docs/api-reference.md) - 全エンドポイントの詳細仕様
- [GAS連携ガイド](./docs/gas-integration.md) - Google Apps Scriptでの使用方法
- [アーキテクチャ](./docs/architecture.md) - システム設計と技術詳細

## ライセンス

MIT
