import { GoogleGenAI } from "@google/genai";
import { writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";

// ── 型定義 ──────────────────────────────────────────

type AssetType = "hero" | "banner" | "icon" | "ogp";
type StyleType = "photo" | "illustration" | "flat" | "none";

interface CLIArgs {
  type: AssetType;
  name: string;
  prompt: string;
  style: StyleType;
  noTemplate: boolean;
  aspect?: string;
}

// ── 定数 ────────────────────────────────────────────

const ASSET_CONFIG: Record<AssetType, { dir: string; aspect: string; template: string }> = {
  hero: {
    dir: "public/images/hero",
    aspect: "16:9",
    template: "Webサイトのヒーローイメージ。横長構図、高品質、ページ上部に配置される大型ビジュアル。",
  },
  banner: {
    dir: "public/images/banner",
    aspect: "21:9",
    template: "Webサイトのプロモーションバナー。横長ワイド構図、目を引くデザイン、テキスト配置スペースを考慮。",
  },
  icon: {
    dir: "public/images/icon",
    aspect: "1:1",
    template: "Webサイト用アイコン。正方形、シンプルで視認性が高く、小さいサイズでも判別可能なデザイン。",
  },
  ogp: {
    dir: "public/images/ogp",
    aspect: "16:9",
    template: "SNSシェア用OGP画像。横長構図、サムネイルとして映えるデザイン、テキスト配置スペースを考慮。",
  },
};

const STYLE_SUFFIX: Record<StyleType, string> = {
  photo: "写真風・フォトリアリスティックスタイル。",
  illustration: "イラスト調・グラフィカルスタイル。",
  flat: "フラットデザイン・ミニマルスタイル。",
  none: "",
};

// ── CLI引数パース ───────────────────────────────────

function parseArgs(): CLIArgs {
  const args = process.argv.slice(2);
  let type: string | undefined;
  let name: string | undefined;
  let prompt: string | undefined;
  let style: string = "photo";
  let noTemplate = false;
  let aspect: string | undefined;

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--type":
        type = args[++i];
        break;
      case "--name":
        name = args[++i];
        break;
      case "--prompt":
        prompt = args[++i];
        break;
      case "--style":
        style = args[++i];
        break;
      case "--aspect":
        aspect = args[++i];
        break;
      case "--no-template":
        noTemplate = true;
        break;
    }
  }

  if (!type || !name || !prompt) {
    console.error(
      "使用方法: npx tsx scripts/generate-asset.ts --type <hero|banner|icon|ogp> --name <名前> --prompt \"<説明>\"\n" +
        "オプション:\n" +
        "  --style <photo|illustration|flat|none>  スタイル指定 (デフォルト: photo)\n" +
        "  --aspect <W:H>                           アスペクト比を上書き (例: 16:9)\n" +
        "  --no-template                            タイプ別テンプレートを無効化"
    );
    process.exit(1);
  }

  if (!["hero", "banner", "icon", "ogp"].includes(type)) {
    console.error(`エラー: --type は hero, banner, icon, ogp のいずれかを指定してください (受け取った値: ${type})`);
    process.exit(1);
  }

  if (!["photo", "illustration", "flat", "none"].includes(style)) {
    console.error(`エラー: --style は photo, illustration, flat, none のいずれかを指定してください (受け取った値: ${style})`);
    process.exit(1);
  }

  return { type: type as AssetType, name, prompt, style: style as StyleType, noTemplate, aspect };
}

// ── プロンプト構築 ──────────────────────────────────

function buildPrompt(args: CLIArgs): string {
  const parts: string[] = [];
  const config = ASSET_CONFIG[args.type];

  if (!args.noTemplate) {
    parts.push(config.template);
  }

  parts.push(args.prompt);

  const styleSuffix = STYLE_SUFFIX[args.style];
  if (styleSuffix) {
    parts.push(styleSuffix);
  }

  return parts.join(" ");
}

// ── 画像生成 ────────────────────────────────────────

async function generateImage(prompt: string, aspectRatio: string): Promise<Buffer> {
  const apiKey = process.env.GEMINI_NANOBANANA_API_KEY;
  if (!apiKey) {
    throw new Error("環境変数 GEMINI_NANOBANANA_API_KEY が設定されていません");
  }
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: prompt,
    config: {
      responseModalities: ["image", "text"],
      imageConfig: {
        aspectRatio,
      },
    },
  });

  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts) {
    throw new Error("APIからレスポンスを取得できませんでした");
  }

  for (const part of parts) {
    if (part.inlineData?.data) {
      return Buffer.from(part.inlineData.data, "base64");
    }
  }

  throw new Error("APIレスポンスに画像データが含まれていませんでした");
}

// ── 保存 ────────────────────────────────────────────

function saveImage(buffer: Buffer, type: AssetType, name: string): string {
  const config = ASSET_CONFIG[type];
  const dir = resolve(config.dir);
  mkdirSync(dir, { recursive: true });
  const filePath = resolve(dir, `${name}.png`);
  writeFileSync(filePath, buffer);
  return filePath;
}

// ── メイン ──────────────────────────────────────────

async function main() {
  const args = parseArgs();
  const config = ASSET_CONFIG[args.type];
  const aspect = args.aspect ?? config.aspect;
  const prompt = buildPrompt(args);

  console.log(`🎨 アセット生成開始`);
  console.log(`   タイプ: ${args.type} (${aspect})`);
  console.log(`   名前:   ${args.name}`);
  console.log(`   スタイル: ${args.style}`);
  console.log(`   プロンプト: ${prompt}`);
  console.log();

  try {
    const buffer = await generateImage(prompt, aspect);
    const filePath = saveImage(buffer, args.type, args.name);
    console.log(`✅ 生成完了: ${filePath}`);
    console.log();
    console.log(`ヒント: HTMLで使用する場合:`);
    if (args.type === "hero") {
      console.log(`  <img src="/images/hero/${args.name}.png" alt="" class="hero-image" />`);
    } else if (args.type === "banner") {
      console.log(`  <img src="/images/banner/${args.name}.png" alt="" class="banner-image" />`);
    } else if (args.type === "icon") {
      console.log(`  <img src="/images/icon/${args.name}.png" alt="" class="icon" />`);
    } else if (args.type === "ogp") {
      console.log(`  <meta property="og:image" content="/images/ogp/${args.name}.png" />`);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`❌ 生成失敗: ${message}`);
    process.exit(1);
  }
}

main();
