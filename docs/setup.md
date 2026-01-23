# セットアップガイド

gas-kv-memoryのセットアップ手順を説明します。

## 前提条件

- Node.js 18以上
- Cloudflareアカウント
- wrangler CLI（npm経由でインストール）

## 1. プロジェクトのクローン

```bash
git clone https://github.com/sphylics/gas-kv-memory.git
cd gas-kv-memory
```

## 2. 依存関係のインストール

```bash
npm install
```

## 3. Cloudflareへのログイン

```bash
npm install -g wrangler
npx wrangler login
```

ブラウザが開き、Cloudflareアカウントで認証を行います。

## 4. KV Namespaceの作成

### 必須のNamespace

```bash
# APIトークン管理用
npx wrangler kv namespace create "API_TOKEN"

# メモリリスト管理用
npx wrangler kv namespace create "MEMORY_LIST"
```

### メモリNamespace（必要に応じて追加）

```bash
# 例: USERSというメモリを作成
npx wrangler kv namespace create "USERS_MEMORY"

# 出力例:
{ binding = "USERS_MEMORY", id = "zzzz-zzzz-zzzz" }
```

## 5. wrangler.jsonの設定

作成したNamespaceのIDを`wrangler.json`に追加します：

```json
{
  "name": "gas-memory-kv",
  "main": "src/index.ts",
  "compatibility_date": "2024-08-06",
  "kv_namespaces": [
    {
      "binding": "API_TOKEN",
      "id": "xxxx-xxxx-xxxx"
    },
    {
      "binding": "MEMORY_LIST",
      "id": "yyyy-yyyy-yyyy"
    },
    {
      "binding": "USERS_MEMORY",
      "id": "zzzz-zzzz-zzzz"
    }
  ]
}

```

## 6. APIトークンの登録

```bash
# トークンを登録（値は任意の文字列）
npx wrangler kv key put "active" "your-secret-api-token" --binding API_TOKEN
```

複数のトークンを登録することも可能です：

```bash
npx wrangler kv key put "active" "token-for-app-1" --binding API_TOKEN
npx wrangler kv key put "active" "token-for-app-2" --binding API_TOKEN
```

## 7. ローカル開発

```bash
npm run dev
```

ローカルサーバーが `http://localhost:8787` で起動します。

### ローカルテスト

```bash
curl -X POST http://localhost:8787/v1/zone/set \
  -H "Content-Type: application/json" \
  -d '{"key":"test","value":"hello","memory":"USERS","token":"your-secret-api-token"}'
```

## 8. 本番環境へのデプロイ

```bash
npm run deploy
```

デプロイ後、以下のURLでアクセス可能になります：

```
https://memory.sphylics.workers.dev/v1/zone
```

## トラブルシューティング

### "Memory namespace not found" エラー

- `wrangler.json`にKV Namespaceのバインディングが正しく設定されているか確認
- バインディング名は `{MEMORY_NAME}_MEMORY` の形式である必要があります
- デプロイ後は変更が反映されるまで数秒かかる場合があります

### "Invalid API token" エラー

- APIトークンがAPI_TOKEN KVに登録されているか確認
- トークンの値が正しいか確認（スペースや改行が含まれていないか）

### KV Namespaceの確認

```bash
# ローカル環境（開発中）
npx wrangler kv key list --binding API_TOKEN

# 本番環境（Cloudflare上）
npx wrangler kv key list --binding API_TOKEN --remote
```