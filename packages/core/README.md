# @gas-kv-memory/core

Cloudflare Workers 上で動作する KV API サーバー本体です。

## セットアップ

### 1. KV Namespace 作成

```bash
wrangler kv namespace create "API_TOKEN"
wrangler kv namespace create "MEMORY_LIST"
wrangler kv namespace create "EXAMPLE_MEMORY"
```

### 2. `wrangler.json` 設定

`kv_namespaces` に作成した ID を設定してください。

### 3. APIトークン登録

```bash
wrangler kv key put --binding API_TOKEN "your-secret-token" "active"
```

## 開発・デプロイ

```bash
npm run dev
npm run typecheck
npm run deploy
```

## 仕様

API の詳細は [docs/api-reference.md](../../docs/api-reference.md) を参照してください。
