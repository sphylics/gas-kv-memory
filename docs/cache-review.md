# GAS クライアントの激辛レビュー（キャッシュ層）

## 対象
- `examples/gas-client/src/client.ts`
- `getValueWithCache`
- `setValueWithCache`

## 指摘（重大）

### 1. メモリ境界を無視したキャッシュキー設計

従来実装は `kv:${key}` をキャッシュキーとして使用していました。
この設計では `USERS` と `SESSIONS` のように別メモリに同じキー名（例: `user:123`）が存在すると、
先に取得・保存された値が後続アクセスに混入し、別メモリのデータを誤って返す可能性があります。

- 影響: データ整合性の破壊
- 影響範囲: マルチメモリ運用時の全キャッシュ利用箇所
- 深刻度: Critical

### 2. 読み取り時に memory 引数がそもそも渡せない

従来 `getValueWithCache(config, key, cacheTtl)` は内部で `getValue(config, key)` を呼び出しており、
呼び出し元が memory を明示したくても指定できませんでした。

- 影響: DEFAULT_MEMORY 前提が崩れると取得値が誤る
- 深刻度: High

## 対応内容

- キャッシュキーを `kv:${memory}:${key}` に変更
- `getValueWithCache` に `memory?: string` を追加
- `setValueWithCache` に `memory?: string` を追加
- memory 未指定時は後方互換のため `DEFAULT_MEMORY` を使用

## 運用ガイド

- 単一メモリ運用: 既存呼び出しのままで可
- マルチメモリ運用: `getValueWithCache` / `setValueWithCache` の `memory` を必ず明示
