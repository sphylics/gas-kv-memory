# gas-kv-memory ドキュメント

Google Apps Script向け外部KVストレージのドキュメントです。

## 目次

### はじめに

- [セットアップガイド](./setup.md) - インストールからデプロイまでの手順

### APIリファレンス

- [APIリファレンス](./api-reference.md) - 全エンドポイントの詳細仕様

### 統合ガイド

- [Google Apps Script連携](./gas-integration.md) - GASからの使用方法とコード例

### 技術ドキュメント

- [アーキテクチャ](./architecture.md) - システム設計と技術詳細

## クイックスタート

### 1. セットアップ

```bash
npm install
npx wrangler login
npx wrangler kv:namespace create "API_TOKEN"
npx wrangler kv:namespace create "EXAMPLE_MEMORY"
# wrangler.jsonにIDを設定
npx wrangler kv:key put --binding API_TOKEN "my-token" "active"
npm run deploy
```

### 2. GASから使用

```javascript
function test() {
  const response = UrlFetchApp.fetch(
    'https://memory.sphylics.workers.dev/v1/zone/set',
    {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({
        key: 'hello',
        value: 'world',
        memory: 'EXAMPLE',
        token: 'my-token'
      })
    }
  );
  Logger.log(response.getContentText());
}
```

## サポート

問題が発生した場合は、GitHubのIssueでお知らせください。
