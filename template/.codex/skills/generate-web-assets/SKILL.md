---
name: generate-web-assets
description: >
  Webサイト用の画像アセット（hero, banner, icon, ogp）をGoogle Gemini APIで生成する。
  ユーザーの自然言語の指示から適切なtype/name/prompt/styleを判断し、generate-asset.tsを実行する。
argument-hint: "[アセットの説明]"
allowed-tools: Bash Read
user-invocable: true
---

# generate-web-assets（プロキシ）

このスキルの本体は `.agent/skills/generate-web-assets/` に配置されている。

スキル起動時は、以下のファイルを読み、その指示に従って動作すること:

- 仕様・手順: `.agent/skills/generate-web-assets/SKILL.md`
- 実行スクリプト: `.agent/skills/generate-web-assets/generate-asset.ts`

## 呼び出しコマンド

```bash
npx tsx .agent/skills/generate-web-assets/generate-asset.ts --type <type> --name <name> --prompt "<prompt>" --style <style>
```

パラメータの判断基準や詳細な手順は `.agent/skills/generate-web-assets/SKILL.md` を参照すること。
