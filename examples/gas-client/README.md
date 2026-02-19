# @gas-kv-memory/gas-client

Google Apps Script 向けの **example 実装** です。プロダクト本体ではありません。

## 使い方

```bash
cd examples/gas-client
npm install
npm run build
```

`npm run build` で `dist/client.js` が生成されます。

- 手動: `dist/client.js` を GAS プロジェクトに貼り付け
- 自動: `npm run deploy`(`clasp push`)

## 設定例

```javascript
const MEMORY_API = {
  BASE_URL: 'https://example.com/v1/zone',
  TOKEN: 'your-api-token',
  DEFAULT_MEMORY: 'MAIN'
};
```

## 提供関数

- `getValue`, `setValue`, `deleteKey`, `existsKey`
- `getMultiple`, `setMultiple`, `getAllKeys`, `deleteMultiple`
- `safeGetValue`, `getValueWithRetry`, `getValueWithCache`, `setValueWithCache`
