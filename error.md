# npm publish / npx 実行エラー調査レポート

## 1. 発端

`npm publish` 実行時に以下のエラーが発生。

```
npm error code E404
npm error 404 Not Found - PUT https://registry.npmjs.org/generate-web-assets - Not found
```

この時点では以下の可能性が疑われた。

* パッケージ名の衝突
* npm 未ログイン
* registry 設定の誤り

---

## 2. 初期切り分け

### 2.1 パッケージ存在確認

```
npm view generate-web-assets
```

結果：404

→ 未公開 or 認証問題の可能性

---

### 2.2 registry / 認証確認

```
npm config get registry
npm whoami
npm ping
```

結果：

* registry: [https://registry.npmjs.org/（正常）](https://registry.npmjs.org/（正常）)
* ping: 成功（通信正常）
* whoami: 401 Unauthorized（認証NG）

→ 原因：未ログイン or トークン破損

---

## 3. 対応

```
npm logout
npm login --auth-type=web
```

→ publish 成功

---

## 4. 次の問題（npx 実行）

```
npx generate-web-assets init
```

エラー：

```
npm error code ENOVERSIONS
npm error No versions available for generate-web-assets
```

---

## 5. 公開状態確認

```
npm view generate-web-assets versions
npm view generate-web-assets dist-tags
```

結果：

```
[ '0.1.0', '0.1.1' ]
{ latest: '0.1.1' }
```

→ パッケージは正常に公開されている

---

## 6. 切り分け試行

### 6.1 npm exec

```
npm exec generate-web-assets init
```

→ ENOVERSIONS

---

### 6.2 cache クリア

```
npm cache clean --force
rm -rf ~/.npm/_npx
```

→ 変化なし

---

### 6.3 明示的バージョン指定

```
npx generate-web-assets@0.1.1 init
```

→ ENOVERSIONS

---

### 6.4 exec 構文修正

```
npm exec -- generate-web-assets init
npm exec --package=generate-web-assets -- generate-web-assets init
```

→ ENOVERSIONS

---

## 7. 現時点の整理

確認済み事項：

* registry 接続：正常
* 認証：解決済み
* publish：成功
* versions：存在
* dist-tag：正常

にも関わらず：

```
npx / npm exec が versions を認識できていない
```

---

## 8. 想定される残存原因

### 8.1 npm クライアントのバグ / 不整合

* npm v7以降で npx が npm exec に統合
* バージョン解決ロジックの不整合の可能性

---

### 8.2 package metadata 不整合

可能性：

* dist-tag と versions の不整合（キャッシュ差分）
* publish 直後の CDN 反映遅延

---

### 8.3 パッケージ構造問題

未確認だが疑うべき点：

* `bin` に指定されたファイルが tarball に含まれていない
* `files` 設定ミス
* `main` / `exports` の干渉

---

### 8.4 npm 側キャッシュの不整合

* ~/.npm
* npx キャッシュ

---

## 9. 次の調査ポイント

以下を確認する必要あり：

```
npm pack generate-web-assets
```

確認項目：

* dist/cli.js が含まれているか
* package.json の bin が一致しているか

---

## 10. 暫定結論

* publish 自体は成功
* registry メタデータも正常
* しかし npm exec / npx が versions を解決できていない

→ クライアント側の解決ロジック or キャッシュ異常の可能性が高い

---

## 11. 次アクション（優先順）

1. npm version 確認 / 更新
2. npm pack で tarball 内容確認
3. 別環境（別マシン）で npx 実行
4. package.json（bin / files）精査

---

## 12. 状態まとめ

| 項目       | 状態   |
| -------- | ---- |
| publish  | 成功   |
| registry | 正常   |
| 認証       | 解決済み |
| versions | 正常   |
| npx 実行   | 失敗   |

---

以上
