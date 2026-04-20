# nanobanana - Webサイト用アセット生成ツール

## generate-asset.ts

Google Gemini API を使用してWebサイト用の画像アセットを生成するスクリプト。

### 使用方法

```bash
npx tsx generate-asset.ts --type <type> --name <name> --prompt "<説明>" [options]
```

### アセットタイプ (`--type`)

| タイプ | 用途 | アスペクト比 | 保存先 |
|--------|------|-------------|--------|
| `hero` | ヒーローイメージ | 16:9 | `public/images/hero/` |
| `banner` | プロモーションバナー | 21:9 | `public/images/banner/` |
| `icon` | アイコン・ファビコン | 1:1 | `public/images/icon/` |
| `ogp` | SNSシェア用OGP画像 | 16:9 | `public/images/ogp/` |

### スタイル (`--style`, デフォルト: `photo`)

| スタイル | 説明 |
|---------|------|
| `photo` | 写真風・フォトリアリスティック |
| `illustration` | イラスト調・グラフィカル |
| `flat` | フラットデザイン・ミニマル |
| `none` | スタイル指定なし |

### オプション

- `--aspect <W:H>` — アスペクト比を上書き
- `--no-template` — タイプ別テンプレートプロンプトを無効化

### 前提条件

- `GEMINI_NANOBANANA_API_KEY` 環境変数が設定されていること
- `@google/genai` パッケージがインストール済みであること (`npm install`)
