# セットアップガイド

## 前提条件

- Node.js 18+
- Cloudflare アカウント
- `wrangler` が使えること（`npx wrangler`）

## 1. インストール

```bash
git clone https://github.com/sphylics/gas-kv-memory.git
cd gas-kv-memory
npm install
```

## 2. Cloudflare ログイン

```bash
npx wrangler login
```

## 3. KV Namespace 作成

```bash
npx wrangler kv namespace create "API_TOKEN"
npx wrangler kv namespace create "MEMORY_LIST"
npx wrangler kv namespace create "USERS_MEMORY"
```

## 4. `packages/core/wrangler.json` 設定

作成した Namespace ID を `kv_namespaces` に設定します。

- `API_TOKEN`
- `MEMORY_LIST`
- `USERS_MEMORY`（任意の `{MEMORY_NAME}_MEMORY`）

## 5. APIトークン登録

```bash
npx wrangler kv key put "active" "your-secret-api-token" --binding API_TOKEN
```

## 6. 開発・デプロイ

```bash
npm run dev
npm run deploy
```

## 7. GAS example の反映

`examples/gas-client` は example です。

```bash
cd examples/gas-client
npm install
npm run build
```

`npm run build` で `dist/client.js` が作られます。反映方法は次のどちらかです。

- 手動で GAS へ貼り付け
- `npm run deploy` で `clasp push`
