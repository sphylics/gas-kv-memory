# @gas-kv-memory/core

Cloudflare Workers上で動作するKV API サーバー。

## セットアップ

### 1. KV Namespaceの作成

CloudflareダッシュボードまたはwranglerコマンドでKV Namespaceを作成:

```bash
# API Token用
wrangler kv namespace create "API_TOKEN"

# Memory List用
wrangler kv namespace create "MEMORY_LIST"

# 実際のメモリネームスペース
wrangler kv namespace create "EXAMPLE_MEMORY"
```

### 2. wrangler.jsonの設定

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

### 3. APIトークンの登録

```bash
# 基本的な書き方
wrangler kv key put --binding API_TOKEN "your-secret-token" "active"
```

## 開発

```bash
npm run dev      # ローカル開発サーバー
npm run typecheck # 型チェック
```

## デプロイ

```bash
npm run deploy
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

詳細は [../../docs/api-reference.md](../../docs/api-reference.md) を参照してください。
