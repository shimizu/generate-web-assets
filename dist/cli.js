#!/usr/bin/env node

// src/cli.ts
import { readdir, mkdir, copyFile } from "fs/promises";
import { existsSync } from "fs";
import { resolve, join, relative, dirname } from "path";
import { fileURLToPath } from "url";
var HERE = dirname(fileURLToPath(import.meta.url));
var TEMPLATE_DIR = resolve(HERE, "../template");
function parseOptions(args) {
  let targetDir = process.cwd();
  let force = false;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--dir" && args[i + 1]) {
      targetDir = args[++i];
    } else if (a === "--force" || a === "-f") {
      force = true;
    } else if (a === "--help" || a === "-h") {
      printHelp();
      process.exit(0);
    } else {
      console.error(`\u4E0D\u660E\u306A\u30AA\u30D7\u30B7\u30E7\u30F3: ${a}`);
      process.exit(1);
    }
  }
  return { targetDir: resolve(targetDir), force };
}
async function walk(dir) {
  const results = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...await walk(p));
    } else if (entry.isFile()) {
      results.push(p);
    }
  }
  return results;
}
async function copyTemplate(opts, overwrite) {
  const files = await walk(TEMPLATE_DIR);
  const copied = [];
  const skipped = [];
  for (const src of files) {
    const rel = relative(TEMPLATE_DIR, src);
    const dst = join(opts.targetDir, rel);
    if (existsSync(dst) && !overwrite) {
      skipped.push(rel);
      continue;
    }
    await mkdir(dirname(dst), { recursive: true });
    await copyFile(src, dst);
    copied.push(rel);
  }
  return { copied, skipped };
}
async function cmdInit(args) {
  const opts = parseOptions(args);
  const result = await copyTemplate(opts, opts.force);
  console.log(`\u{1F4E6} generate-web-assets \u30B9\u30AD\u30EB\u3092\u30A4\u30F3\u30B9\u30C8\u30FC\u30EB\u3057\u307E\u3057\u305F`);
  console.log(`   \u30BF\u30FC\u30B2\u30C3\u30C8: ${opts.targetDir}`);
  console.log(`   \u4F5C\u6210: ${result.copied.length} \u30D5\u30A1\u30A4\u30EB`);
  for (const f of result.copied) console.log(`     + ${f}`);
  if (result.skipped.length > 0) {
    console.log(`   \u30B9\u30AD\u30C3\u30D7: ${result.skipped.length} \u30D5\u30A1\u30A4\u30EB\uFF08\u65E2\u5B58\u3001--force \u3067\u4E0A\u66F8\u304D\u53EF\uFF09`);
    for (const f of result.skipped) console.log(`     - ${f}`);
  }
  console.log();
  console.log(`\u6B21\u306E\u30B9\u30C6\u30C3\u30D7:`);
  console.log(`  1. npm install --save-dev @google/genai tsx \u3092\u5B9F\u884C`);
  console.log(`  2. \u74B0\u5883\u5909\u6570 GOOGLE_API_KEY \u3092\u8A2D\u5B9A`);
  console.log(`  3. Claude Code \u306A\u3069\u3067 /generate-web-assets \u3092\u547C\u3073\u51FA\u3059`);
  if (!process.env.GOOGLE_API_KEY) {
    console.log();
    console.warn(`\u26A0\uFE0F  GOOGLE_API_KEY \u304C\u672A\u8A2D\u5B9A\u3067\u3059`);
  }
}
async function cmdUpdate(args) {
  const opts = parseOptions(args);
  const result = await copyTemplate(opts, true);
  console.log(`\u{1F504} generate-web-assets \u30B9\u30AD\u30EB\u3092\u66F4\u65B0\u3057\u307E\u3057\u305F`);
  console.log(`   \u30BF\u30FC\u30B2\u30C3\u30C8: ${opts.targetDir}`);
  console.log(`   \u66F4\u65B0: ${result.copied.length} \u30D5\u30A1\u30A4\u30EB`);
  for (const f of result.copied) console.log(`     * ${f}`);
}
async function cmdDoctor(args) {
  const opts = parseOptions(args);
  const expected = await walk(TEMPLATE_DIR);
  const missing = [];
  for (const src of expected) {
    const rel = relative(TEMPLATE_DIR, src);
    const dst = join(opts.targetDir, rel);
    if (!existsSync(dst)) missing.push(rel);
  }
  if (missing.length === 0) {
    console.log(`\u2705 \u30B9\u30AD\u30EB\u306F\u6B63\u5E38\u306B\u30A4\u30F3\u30B9\u30C8\u30FC\u30EB\u3055\u308C\u3066\u3044\u307E\u3059`);
    console.log(`   \u30BF\u30FC\u30B2\u30C3\u30C8: ${opts.targetDir}`);
  } else {
    console.log(`\u26A0\uFE0F  ${missing.length} \u500B\u306E\u30D5\u30A1\u30A4\u30EB\u304C\u4E0D\u8DB3\u3057\u3066\u3044\u307E\u3059:`);
    for (const f of missing) console.log(`     - ${f}`);
    console.log();
    console.log(`   npx @shimizu/generate-web-assets init --force \u3067\u518D\u30A4\u30F3\u30B9\u30C8\u30FC\u30EB\u3057\u3066\u304F\u3060\u3055\u3044`);
    process.exitCode = 1;
  }
}
function printHelp() {
  console.log(`@shimizu/generate-web-assets

\u4F7F\u7528\u65B9\u6CD5:
  npx @shimizu/generate-web-assets <command> [options]

\u30B3\u30DE\u30F3\u30C9:
  init       \u30B9\u30AD\u30EB\u30D5\u30A1\u30A4\u30EB\u3092\u30BF\u30FC\u30B2\u30C3\u30C8\u30C7\u30A3\u30EC\u30AF\u30C8\u30EA\u306B\u914D\u7F6E\u3059\u308B
  update     \u65E2\u5B58\u306E\u30B9\u30AD\u30EB\u30D5\u30A1\u30A4\u30EB\u3092\u6700\u65B0\u7248\u3067\u4E0A\u66F8\u304D\u3059\u308B
  doctor     \u30A4\u30F3\u30B9\u30C8\u30FC\u30EB\u72B6\u614B\u3092\u78BA\u8A8D\u3059\u308B

\u30AA\u30D7\u30B7\u30E7\u30F3:
  --dir <path>   \u30BF\u30FC\u30B2\u30C3\u30C8\u30C7\u30A3\u30EC\u30AF\u30C8\u30EA\uFF08\u30C7\u30D5\u30A9\u30EB\u30C8: \u30AB\u30EC\u30F3\u30C8\u30C7\u30A3\u30EC\u30AF\u30C8\u30EA\uFF09
  --force, -f    \u65E2\u5B58\u30D5\u30A1\u30A4\u30EB\u3092\u4E0A\u66F8\u304D\u3059\u308B\uFF08init \u306E\u307F\uFF09
  --help, -h     \u3053\u306E\u30D8\u30EB\u30D7\u3092\u8868\u793A
`);
}
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  switch (command) {
    case "init":
      await cmdInit(args.slice(1));
      break;
    case "update":
      await cmdUpdate(args.slice(1));
      break;
    case "doctor":
      await cmdDoctor(args.slice(1));
      break;
    case "--help":
    case "-h":
    case void 0:
      printHelp();
      break;
    default:
      console.error(`\u4E0D\u660E\u306A\u30B3\u30DE\u30F3\u30C9: ${command}`);
      printHelp();
      process.exit(1);
  }
}
main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
