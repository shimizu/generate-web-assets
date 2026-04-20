---
name: generate-web-assets
description: >
  Webサイト用の画像アセット（hero, banner, icon, ogp）をGoogle Gemini APIで生成する。
  ユーザーの自然言語の指示から適切なtype/name/prompt/styleを判断し、generate-asset.tsを実行する。
argument-hint: "[アセットの説明]"
allowed-tools: Bash Read
user-invocable: true
---

# Webサイト用アセット生成スキル

ユーザーの指示に基づいて `generate-asset.ts` を実行し、画像アセットを生成する。

## 手順

1. ユーザーの `$ARGUMENTS` を解析し、以下を判断する:
   - **type**: 用途から推測（ページ上部→hero、バナー→banner、アイコン→icon、SNS共有→ogp）
   - **name**: 内容から適切なケバブケースの名前を生成（例: `landing-hero`, `service-icon`）
   - **prompt**: ユーザーの説明をそのまま、または適切に補足してプロンプトにする
   - **style**: 指定がなければ `photo`。ユーザーが「イラスト」「フラット」等と言えば対応するスタイルを選択

2. 以下のコマンドを実行:
   ```bash
   npx tsx .agent/skills/generate-web-assets/generate-asset.ts --type <type> --name <name> --prompt "<prompt>" --style <style>
   ```

3. 生成された画像を確認し、ユーザーに結果を報告する

## タイプ選択の目安

| ユーザーの表現 | type |
|---------------|------|
| ヒーロー画像、メインビジュアル、ページ上部 | `hero` |
| バナー、プロモーション、広告 | `banner` |
| アイコン、ファビコン、ロゴ | `icon` |
| OGP、SNSシェア、サムネイル | `ogp` |

## スタイル選択の目安

| ユーザーの表現 | style |
|---------------|-------|
| 写真風、リアル、フォト（またはデフォルト） | `photo` |
| イラスト、グラフィカル、描画 | `illustration` |
| フラット、ミニマル、シンプル | `flat` |
| スタイル指定なし、素材そのまま | `none` |
