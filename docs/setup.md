# セットアップガイド

gas-kv-memoryのセットアップ手順を説明します。

## 前提条件

- Node.js 18以上
- Cloudflareアカウント
- wrangler CLI（npm経由でインストール）

## 1. プロジェクトのクローン

```bash
git clone https://github.com/your-username/gas-kv-memory.git
cd gas-kv-memory
```

## 2. 依存関係のインストール

```bash
npm install
```

## 3. Cloudflareへのログイン

```bash
npx wrangler login
```

ブラウザが開き、Cloudflareアカウントで認証を行います。

## 4. KV Namespaceの作成

### 必須のNamespace

```bash
# APIトークン管理用
npx wrangler kv:namespace create "API_TOKEN"
# 出力例: { binding = "API_TOKEN", id = "xxxx-xxxx-xxxx" }

# メモリリスト管理用
npx wrangler kv:namespace create "MEMORY_LIST"
# 出力例: { binding = "MEMORY_LIST", id = "yyyy-yyyy-yyyy" }
```

### メモリNamespace（必要に応じて追加）

```bash
# 例: USERSというメモリを作成
npx wrangler kv:namespace create "USERS_MEMORY"
# 出力例: { binding = "USERS_MEMORY", id = "zzzz-zzzz-zzzz" }
```

## 5. wrangler.tomlの設定

作成したNamespaceのIDを`wrangler.toml`に追加します：

```toml
name = "gas-memory-kv"
main = "src/index.ts"
compatibility_date = "2024-08-06"

[[kv_namespaces]]
binding = "API_TOKEN"
id = "xxxx-xxxx-xxxx"

[[kv_namespaces]]
binding = "MEMORY_LIST"
id = "yyyy-yyyy-yyyy"

[[kv_namespaces]]
binding = "USERS_MEMORY"
id = "zzzz-zzzz-zzzz"
```

## 6. APIトークンの登録

```bash
# トークンを登録（値は任意の文字列）
npx wrangler kv:key put --binding API_TOKEN "your-secret-api-token" "active"
```

複数のトークンを登録することも可能です：

```bash
npx wrangler kv:key put --binding API_TOKEN "token-for-app-1" "active"
npx wrangler kv:key put --binding API_TOKEN "token-for-app-2" "active"
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
https://gas-memory-kv.<your-subdomain>.workers.dev/v1/zone
```

## トラブルシューティング

### "Memory namespace not found" エラー

- `wrangler.toml`にKV Namespaceのバインディングが正しく設定されているか確認
- バインディング名は `{MEMORY_NAME}_MEMORY` の形式である必要があります
- デプロイ後は変更が反映されるまで数秒かかる場合があります

### "Invalid API token" エラー

- APIトークンがAPI_TOKEN KVに登録されているか確認
- トークンの値が正しいか確認（スペースや改行が含まれていないか）

### KV Namespaceの確認

```bash
# 登録済みのトークン一覧
npx wrangler kv:key list --binding API_TOKEN

# 特定のキーの値を確認
npx wrangler kv:key get --binding API_TOKEN "your-token"
```
