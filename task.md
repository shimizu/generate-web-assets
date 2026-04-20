# npm 公開タスク — @shimizu/generate-web-assets

`@shimizu/generate-web-assets` を npm に初回公開するための手順書。上から順に実行する。

## 前提

- npm アカウント: 準備済み（`@shimizu` スコープは未作成）
- GitHub アカウント: 準備済み
- Node.js 18 以上
- ローカルにこのリポジトリをクローン済み

---

## 1. Git リポジトリの初期化

リポジトリはまだ git 管理下にないため、最初に `.gitignore` を作成して git 管理に入れる。

```bash
# .gitignore を作成
cat > .gitignore <<'EOF'
node_modules/
dist/
*.tgz
.DS_Store
.env
.env.local
EOF

git init -b main
git add .
git commit -m "chore: initial commit"
```

**完了条件**: `git log --oneline` が初回コミットを返す。

> 備考: `dist/` は `.gitignore` に含めるが、`prepublishOnly` でビルドされるため npm 公開時には含まれる。

---

## 2. GitHub リポジトリの作成・公開

```bash
# GitHub CLI を使う場合
gh repo create nanobanana --public --source=. --remote=origin --push

# もしくは手動で
# 1. https://github.com/new でリポジトリを作成
# 2. 以下を実行
git remote add origin https://github.com/<USER>/nanobanana.git
git push -u origin main
```

**完了条件**: GitHub 上でファイル一覧が閲覧可能（`README.md` が表示される）。

---

## 3. package.json のメタデータ整備

`repository` / `homepage` / `bugs` フィールドを追加する。`<USER>` は自分の GitHub ユーザー名に置換。

```json
{
  "repository": {
    "type": "git",
    "url": "git+https://github.com/<USER>/nanobanana.git"
  },
  "homepage": "https://github.com/<USER>/nanobanana#readme",
  "bugs": {
    "url": "https://github.com/<USER>/nanobanana/issues"
  }
}
```

編集後にコミット:

```bash
git add package.json
git commit -m "chore: add repository metadata"
git push
```

**完了条件**: `package.json` の 3 フィールドが追加され、コミット済み。

---

## 4. ビルド

```bash
npm install
npm run build
```

動作確認:

```bash
node dist/cli.js --help
```

**完了条件**: ヘルプメッセージが正常に表示される。

---

## 5. パッケージ内容の検証（最重要）

`npm pack --dry-run` を実行し、公開される内容を確認する。

```bash
npm pack --dry-run
```

**必須で含まれているべきファイル**:

- [ ] `dist/cli.js`
- [ ] `template/.agent/skills/generate-web-assets/SKILL.md`
- [ ] `template/.agent/skills/generate-web-assets/generate-asset.ts`
- [ ] `template/.claude/skills/generate-web-assets/SKILL.md`
- [ ] `template/.codex/skills/generate-web-assets/SKILL.md`
- [ ] `template/.gemini/skills/generate-web-assets/SKILL.md`
- [ ] `README.md`
- [ ] `LICENSE`
- [ ] `package.json`

**⚠️ ドットファイルディレクトリが欠落している場合**:

npm は歴史的経緯で `.` 始まりのパスを取りこぼすことがある。欠落があれば `.npmignore` を作成して明示的に include する。

```bash
# .npmignore
cat > .npmignore <<'EOF'
# 何も ignore しない（include を明示するため）
!template/.agent/
!template/.claude/
!template/.codex/
!template/.gemini/
EOF
```

再度 `npm pack --dry-run` で全ファイルが含まれるか確認する。

**完了条件**: 上記 9 項目すべてが Tarball Contents に含まれる。

---

## 6. ローカルインストール動作確認

実際に `.tgz` を作ってグローバルインストールし、CLI が期待通り動くか検証する。

```bash
# パッケージ作成
npm pack
# → shimizu-generate-web-assets-0.1.0.tgz が生成される

# グローバルインストール
npm install -g ./shimizu-generate-web-assets-0.1.0.tgz

# テスト用ディレクトリで init を実行
mkdir -p /tmp/test-install && cd /tmp/test-install
generate-web-assets init

# 4 つのディレクトリ + SKILL.md が作られたか確認
ls -la .agent/skills/generate-web-assets/
ls -la .claude/skills/generate-web-assets/
ls -la .codex/skills/generate-web-assets/
ls -la .gemini/skills/generate-web-assets/

# doctor で整合性確認
generate-web-assets doctor

# 後片付け
npm uninstall -g @shimizu/generate-web-assets
cd - && rm -rf /tmp/test-install
rm shimizu-generate-web-assets-0.1.0.tgz
```

**完了条件**:
- `init` が 5 ファイルを作成
- `doctor` が `✅ スキルは正常にインストールされています` を返す
- `update` が上書き動作する

---

## 7. @shimizu スコープの作成

npm アカウントは準備済みだが、スコープ（Organization）は未作成。

1. https://www.npmjs.com にログイン
2. 右上のアバター → **Add Organization**
3. Organization 名を `shimizu` に設定、Plan は **Free** を選択
4. ローカルでログイン状態を確認:

```bash
npm whoami
# ログインしていなければ
npm login
```

5. スコープへの所属確認:

```bash
npm org ls shimizu
```

**完了条件**: `npm org ls shimizu` が自分のユーザー名を返す。

---

## 8. 公開前のドライラン

```bash
npm publish --dry-run --access public
```

出力されるファイル一覧・合計サイズ・依存関係を最終確認する。

**完了条件**: エラーなく `+ @shimizu/generate-web-assets@0.1.0` が表示される。

---

## 9. npm への初回公開

```bash
npm publish --access public
```

- スコープ付きパッケージはデフォルトで private 扱いになるため `--access public` が**必須**（忘れると 402 エラー）
- `prepublishOnly` スクリプトにより `npm run build` が自動実行される

**完了条件**: https://www.npmjs.com/package/@shimizu/generate-web-assets にページが表示される。

---

## 10. 公開後の検証

クリーンな別ディレクトリで `npx` 経由で動作確認する。

```bash
mkdir -p /tmp/post-publish-test && cd /tmp/post-publish-test
npx @shimizu/generate-web-assets@latest init

# ファイル構造確認
find .agent .claude .codex .gemini -type f

# 実際に画像生成まで動作するか（GOOGLE_API_KEY が必要）
npm install --save-dev @google/genai tsx
export GOOGLE_API_KEY=<your-key>
npx tsx .agent/skills/generate-web-assets/generate-asset.ts \
  --type hero --name test-hero --prompt "青空と山" --style photo

ls public/images/hero/
```

**完了条件**:
- `npx` 経由で init が動作
- 画像ファイル `public/images/hero/test-hero.png` が生成される

---

## 11. 今後のリリース運用

バージョニング方針（SemVer）:

- `patch`（0.1.0 → 0.1.1）: バグ修正、テンプレート内の軽微な文言修正
- `minor`（0.1.0 → 0.2.0）: 新しいアセットタイプ追加、新しいエージェント CLI 対応
- `major`（0.1.0 → 1.0.0）: 破壊的変更（CLI コマンド削除、テンプレート構造の大幅変更）

更新時の手順:

```bash
# バージョン bump（git tag も自動で作成される）
npm version patch   # または minor / major

# GitHub へ push
git push && git push --tags

# npm へ公開
npm publish
```

GitHub Releases のエントリ作成（任意）:

```bash
gh release create v0.1.1 --title "v0.1.1" --notes "変更内容"
```
