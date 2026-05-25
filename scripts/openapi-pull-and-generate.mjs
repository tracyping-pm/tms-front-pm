#!/usr/bin/env node
/**
 * 从环境变量 URL 拉取 OpenAPI JSON，再调用 openapi-typescript。
 *
 * 会自动加载项目根目录 `.env.local`（存在则读入；已存在于进程环境变量的键不会被覆盖）。
 * 键名见 `.env.local.example`。亦可在 CI 中直接导出 `OPENAPI_TMS_URL` / `OPENAPI_UAM_URL`。
 *
 * 用法：pnpm openapi:pull:generate
 */
import { config as loadEnv } from 'dotenv';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const envLocalPath = join(root, '.env.local');
if (existsSync(envLocalPath)) {
  loadEnv({ path: envLocalPath, quiet: true });
}
const openapiDir = join(root, 'openapi');

const TMS_URL = process.env.OPENAPI_TMS_URL;
const UAM_URL = process.env.OPENAPI_UAM_URL;

async function pull(label, url, outName) {
  if (!url) {
    console.warn(`[openapi] skip ${label}: env not set`);
    return false;
  }
  const outPath = join(openapiDir, outName);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`[openapi] ${label} fetch failed ${res.status}: ${url}`);
  }
  const text = await res.text();
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, text, 'utf8');
  console.log(`[openapi] wrote ${outPath}`);
  return true;
}

async function main() {
  if (!existsSync(openapiDir)) {
    mkdirSync(openapiDir, { recursive: true });
  }
  await pull('TMS', TMS_URL, 'tms.openapi.json');
  await pull('UAM', UAM_URL, 'uam.openapi.json');

  const r = spawnSync(
    'pnpm',
    ['exec', 'openapi-typescript', 'openapi/tms.openapi.json', '-o', 'src/api/generated/tms-paths.d.ts'],
    { cwd: root, stdio: 'inherit', shell: true },
  );
  if (r.status !== 0) process.exit(r.status ?? 1);
  const r2 = spawnSync(
    'pnpm',
    ['exec', 'openapi-typescript', 'openapi/uam.openapi.json', '-o', 'src/api/generated/uam-paths.d.ts'],
    { cwd: root, stdio: 'inherit', shell: true },
  );
  if (r2.status !== 0) process.exit(r2.status ?? 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
