# gas-kv-memory

GoogleAppsScriptで使用できる軽量な外部KVストレージ。Cloudflare Workers + KVを使用。

## プロジェクト構成

このプロジェクトはモノレポ構成です：

```
packages/
  ├── core/          # Cloudflare Workers API サーバー
  └── gas-client/    # Google Apps Script クライアント
docs/               # ドキュメント
```

## クイックスタート

### 1. リポジトリをクローン

```bash
git clone https://github.com/sphylics/gas-kv-memory.git
cd gas-kv-memory
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. Core パッケージのセットアップ

詳細は [packages/core/README.md](./packages/core/README.md) を参照してください。

- Cloudflare KV Namespaceの作成
- wrangler.jsonの設定
- APIトークンの登録

### 4. Gas Client パッケージのセットアップ

詳細は [packages/gas-client/README.md](./packages/gas-client/README.md) を参照してください。

## 開発・デプロイ

```bash
# Core パッケージのローカル開発
npm run dev

# Core パッケージのデプロイ
npm run deploy

# 型チェック（全パッケージ）
npm run typecheck
```

## ドキュメント

詳細なドキュメントは[docs](./docs)ディレクトリを参照してください：

- [セットアップガイド](./docs/setup.md) - インストールからデプロイまで
- [APIリファレンス](./docs/api-reference.md) - 全エンドポイントの詳細仕様
- [GAS連携ガイド](./docs/gas-integration.md) - Google Apps Scriptでの使用方法
- [アーキテクチャ](./docs/architecture.md) - システム設計と技術詳細

## パッケージ

### @gas-kv-memory/core

Cloudflare Workers上で動作するKV API サーバー。

- **言語**: TypeScript
- **ランタイム**: Cloudflare Workers
- **フレームワーク**: Hono

詳細: [packages/core/README.md](./packages/core/README.md)

### @gas-kv-memory/gas-client

Google Apps Scriptから @gas-kv-memory/core を使用するためのクライアント。

- **言語**: TypeScript
- **ランタイム**: Google Apps Script
- **機能**: 値の取得・保存、バッチ操作、キャッシング、エラーハンドリング

詳細: [packages/gas-client/README.md](./packages/gas-client/README.md)

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

## ライセンス

MIT
