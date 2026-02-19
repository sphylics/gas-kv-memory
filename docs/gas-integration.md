# Google Apps Script 連携ガイド

`examples/gas-client` は **GASで使うための example 実装** です。ライブラリ配布物ではなく、必要な関数を GAS プロジェクトに取り込んで使います。

## 1. example のビルド

```bash
cd examples/gas-client
npm install
npm run build
```

`npm run build` で `dist/client.js` が生成されます。

## 2. GAS へ反映する方法

- 手動反映: `dist/client.js` を Apps Script エディタに貼り付ける
- clasp 反映: `npm run deploy` を実行する（内部で `clasp push`）

> `npm run deploy` を使うには `examples/gas-client` で clasp 設定（`.clasp.json`）が必要です。

## 3. 最低限の設定例

```javascript
const MEMORY_API = {
  BASE_URL: 'https://example.com/v1/zone',
  TOKEN: 'your-api-token',
  DEFAULT_MEMORY: 'MAIN'
};
```

## 4. 使用例

```javascript
setValue(MEMORY_API, 'hello', 'world', 'EXAMPLE');
const value = getValue(MEMORY_API, 'hello', 'EXAMPLE');
Logger.log(value);
```

実装本体: [examples/gas-client/src/client.ts](../examples/gas-client/src/client.ts)
