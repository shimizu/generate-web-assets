# generate-web-assets

Webサイト用の画像アセット（hero / banner / icon / ogp）を Google Gemini API で生成するスキルを、Claude Code / Codex / Gemini CLI に導入する CLI インストーラ。

## 前提条件

- Node.js 18 以上
- Google Gemini API キー（環境変数 `GEMINI_NANOBANANA_API_KEY`）
- スキルを利用するエージェント CLI のいずれか
  - [Claude Code](https://docs.claude.com/claude-code)
  - OpenAI Codex CLI
  - Gemini CLI

## インストール

プロジェクトのルートディレクトリで以下を実行する。

```bash
npx generate-web-assets init
```

実行すると、カレントディレクトリに以下の構造でスキルファイルが配置される。

```
<project>/
├── .agent/skills/generate-web-assets/
│   ├── SKILL.md               # スキル本体
│   └── generate-asset.ts      # 実行スクリプト
├── .claude/skills/generate-web-assets/SKILL.md    # Claude Code 用プロキシ
├── .codex/skills/generate-web-assets/SKILL.md     # Codex 用プロキシ
└── .gemini/skills/generate-web-assets/SKILL.md    # Gemini 用プロキシ
```

実体は `.agent/skills/generate-web-assets/` に置かれ、各エージェント用ディレクトリにはそれを参照するプロキシ `SKILL.md` が配置される。

### 続けて必要な準備

```bash
npm install --save-dev @google/genai tsx
export GEMINI_NANOBANANA_API_KEY=your-api-key
```

## 使い方

Claude Code から以下のように呼び出す。

```
/generate-web-assets ランディングページのヒーロー画像。青空と山
```

エージェントがユーザーの指示を解析し、以下のコマンドを実行する。

```bash
npx tsx .agent/skills/generate-web-assets/generate-asset.ts \
  --type hero \
  --name landing-hero \
  --prompt "ランディングページのヒーロー画像。青空と山" \
  --style photo
```

### アセットタイプ

| タイプ | 用途 | アスペクト比 | 保存先 |
|--------|------|-------------|--------|
| `hero` | ヒーローイメージ | 16:9 | `public/images/hero/` |
| `banner` | プロモーションバナー | 21:9 | `public/images/banner/` |
| `icon` | アイコン・ファビコン | 1:1 | `public/images/icon/` |
| `ogp` | SNS シェア用 OGP 画像 | 16:9 | `public/images/ogp/` |

### スタイル

| スタイル | 説明 |
|---------|------|
| `photo` | 写真風・フォトリアリスティック（デフォルト） |
| `illustration` | イラスト調・グラフィカル |
| `flat` | フラットデザイン・ミニマル |
| `none` | スタイル指定なし |

## コマンド

```bash
npx generate-web-assets <command> [options]
```

| コマンド | 説明 |
|---------|------|
| `init` | スキルファイルをターゲットディレクトリに配置する |
| `update` | 既存のスキルファイルを最新版で上書きする |
| `doctor` | インストール状態を確認する |

### オプション

| オプション | 説明 |
|-----------|------|
| `--dir <path>` | ターゲットディレクトリ（デフォルト: カレントディレクトリ） |
| `--force`, `-f` | 既存ファイルを上書きする（`init` のみ） |
| `--help`, `-h` | ヘルプを表示 |

## アンインストール

以下のディレクトリを削除する。

```bash
rm -rf .agent/skills/generate-web-assets \
       .claude/skills/generate-web-assets \
       .codex/skills/generate-web-assets \
       .gemini/skills/generate-web-assets
```

## ライセンス

MIT
