# gas-kv-memory

Google Apps Script から利用できる外部 KV ストレージです。バックエンドは Cloudflare Workers + KV で動作します。

## 構成

```text
packages/core         # 本体: Cloudflare Workers API
examples/gas-client   # 参考実装: GAS用サンプルコード(example)
docs                  # ドキュメント
```

## クイックスタート

```bash
npm install
```

### 1. Core (本体) を設定してデプロイ

`packages/core` の手順に従って KV と `wrangler.json` を設定します。

- 参照: [packages/core/README.md](./packages/core/README.md)
- デプロイ: `npm run deploy`

### 2. GAS コードは example として利用

`examples/gas-client` はプロダクト本体ではなく、GAS に貼り付けて使うための **example** です。

```bash
cd examples/gas-client
npm install
npm run build
```

`npm run build` で `dist` が生成されます。

- 手動: `dist/client.js` を GAS プロジェクトへ貼り付け
- 自動: `npm run deploy`(`clasp push` を実行)

`npm run deploy`を行う場合は事前にclaspにログインしてください。

## ドキュメント

- [docs/setup.md](./docs/setup.md)
- [docs/api-reference.md](./docs/api-reference.md)
- [docs/gas-integration.md](./docs/gas-integration.md)
