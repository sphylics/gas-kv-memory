# API リファレンス

## 概要

- **Base URL**: `https://memory.math-u-t.workers.dev/v1/zone`
- **Content-Type**: `application/json`
- **認証**: リクエストボディに `token` パラメータを含める

## レスポンス形式

### 成功レスポンス

```json
{
  "ok": true,
  "status": "SUCCESS",
  "decision": "CONTINUE",
  "content": { ... }
}
```

### NOOP レスポンス（期待される失敗）

キーが存在しない場合など、エラーではないが値がない場合：

```json
{
  "ok": true,
  "status": "NOOP",
  "decision": "CONTINUE",
  "content": {
    "value": null
  }
}
```

### エラーレスポンス

```json
{
  "ok": false,
  "status": "ERROR",
  "decision": "STOP",
  "content": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "エラーの説明"
  }
}
```

## エラーコード

| コード | 説明 |
|--------|------|
| `UNAUTHORIZED` | トークンが未指定 |
| `INVALID_TOKEN` | トークンが無効 |
| `INVALID_REQUEST` | リクエストボディが不正 |
| `MEMORY_NOT_FOUND` | 指定されたメモリが存在しない |
| `KEY_NOT_FOUND` | 指定されたキーが存在しない |
| `INTERNAL_ERROR` | 内部エラー |

---

## エンドポイント

### POST /get

単一の値を取得します。

**リクエスト**

```json
{
  "key": "user:123",
  "memory": "USERS",
  "token": "your-api-token"
}
```

**成功レスポンス**

```json
{
  "ok": true,
  "status": "SUCCESS",
  "decision": "CONTINUE",
  "content": {
    "value": "{\"name\":\"John\",\"age\":30}"
  }
}
```

**キーが存在しない場合**

```json
{
  "ok": true,
  "status": "NOOP",
  "decision": "CONTINUE",
  "content": {
    "value": null
  }
}
```

---

### POST /set

単一の値を保存します。キーが存在する場合は上書きされます。

**リクエスト**

```json
{
  "key": "user:123",
  "value": "{\"name\":\"John\",\"age\":30}",
  "memory": "USERS",
  "token": "your-api-token"
}
```

**レスポンス**

```json
{
  "ok": true,
  "status": "SUCCESS",
  "decision": "CONTINUE",
  "content": {
    "value": "{\"name\":\"John\",\"age\":30}"
  }
}
```

---

### DELETE /delete

単一のキーを削除します。

**リクエスト**

```json
{
  "key": "user:123",
  "memory": "USERS",
  "token": "your-api-token"
}
```

**レスポンス**

```json
{
  "ok": true,
  "status": "SUCCESS",
  "decision": "CONTINUE",
  "content": null
}
```

---

### POST /exists

キーの存在を確認します。

**リクエスト**

```json
{
  "key": "user:123",
  "memory": "USERS",
  "token": "your-api-token"
}
```

**レスポンス（存在する場合）**

```json
{
  "ok": true,
  "status": "SUCCESS",
  "decision": "CONTINUE",
  "content": true
}
```

**レスポンス（存在しない場合）**

```json
{
  "ok": true,
  "status": "SUCCESS",
  "decision": "CONTINUE",
  "content": false
}
```

---

### POST /mget

複数の値を一括取得します。

**リクエスト**

```json
{
  "key": ["user:123", "user:456", "user:789"],
  "memory": "USERS",
  "token": "your-api-token"
}
```

**レスポンス**

```json
{
  "ok": true,
  "status": "SUCCESS",
  "decision": "CONTINUE",
  "content": {
    "user:123": "{\"name\":\"John\"}",
    "user:456": "{\"name\":\"Jane\"}",
    "user:789": null
  }
}
```

存在しないキーは `null` として返されます。

---

### POST /mset

複数の値を一括保存します。

**リクエスト**

```json
{
  "key": {
    "user:123": "{\"name\":\"John\"}",
    "user:456": "{\"name\":\"Jane\"}"
  },
  "memory": "USERS",
  "token": "your-api-token"
}
```

**レスポンス**

```json
{
  "ok": true,
  "status": "SUCCESS",
  "decision": "CONTINUE",
  "content": null
}
```

---

### POST /keys

指定したメモリ内の全キーと値を取得します。

**リクエスト**

```json
{
  "memory": "USERS",
  "token": "your-api-token"
}
```

**レスポンス**

```json
{
  "ok": true,
  "status": "SUCCESS",
  "decision": "CONTINUE",
  "content": {
    "user:123": "{\"name\":\"John\"}",
    "user:456": "{\"name\":\"Jane\"}",
    "config:theme": "dark"
  }
}
```

> **注意**: 大量のキーがある場合、レスポンスが大きくなる可能性があります。

---

### DELETE /mdelete

複数のキーを一括削除します。

**リクエスト**

```json
{
  "value": ["user:123", "user:456"],
  "memory": "USERS",
  "token": "your-api-token"
}
```

**レスポンス**

```json
{
  "ok": true,
  "status": "SUCCESS",
  "decision": "CONTINUE",
  "content": null
}
```

---

## HTTPステータスコード

| コード | 説明 |
|--------|------|
| 200 | 成功（SUCCESS/NOOP） |
| 400 | リクエストが不正（INVALID_REQUEST） |
| 401 | 認証エラー（UNAUTHORIZED/INVALID_TOKEN） |
| 404 | メモリが見つからない（MEMORY_NOT_FOUND） |
| 500 | 内部エラー（INTERNAL_ERROR） |
