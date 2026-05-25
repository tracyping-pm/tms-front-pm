import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

type EnvDefaults = Record<string, unknown>;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function shQuote(value: string) {
  return `'${value.replaceAll(`'`, `'\\''`)}'`;
}

function pick(env: EnvDefaults, keys: string[]) {
  const out: Record<string, string | number> = {};
  for (const key of keys) {
    const v = env[key];
    if (typeof v === 'string' || typeof v === 'number') out[key] = v;
  }
  return out;
}

async function main() {
  const entries: Array<{ appEnv: string; importPath: string }> = [
    { appEnv: 'dev', importPath: '../.env.dev.ts' },
    { appEnv: 'test', importPath: '../.env.test.ts' },
    { appEnv: 'uat', importPath: '../.env.uat.ts' },
    { appEnv: 'rc', importPath: '../.env.rc.ts' },
    { appEnv: 'prod', importPath: '../.env.prod.ts' },
  ];

  const keys = ['TMS_ORIGIN', 'UAM_ORIGIN'];

  const header = `#!/usr/bin/env sh
# GENERATED FILE — DO NOT EDIT
# Source: .env.*.ts
# Generator: scripts/generate-runtime-env-defaults.ts
set -e
`;

  const cases: string[] = [];
  for (const { appEnv, importPath } of entries) {
    // Resolve relative to this script file (scripts/).
    const abs = path.resolve(__dirname, importPath);
    // Use file:// so dynamic import works reliably across platforms.
    const mod = (await import(pathToFileURL(abs).toString())) as {
      default?: EnvDefaults;
    };
    const env = mod.default ?? {};
    const picked = pick(env, keys);

    const lines: string[] = [];
    for (const [k, v] of Object.entries(picked)) {
      if (typeof v === 'number') lines.push(`    ${k}=${v}`);
      else lines.push(`    ${k}=${shQuote(v)}`);
    }

    cases.push(`${appEnv})\n${lines.join('\n')}\n    ;;`);
  }

  const content =
    header +
    `\ncase "$APP_ENV" in\n` +
    cases.map((c) => `  ${c}`).join('\n') +
    `\n  *)\n    echo "Unknown APP_ENV: $APP_ENV" >&2\n    exit 1\n    ;;\n` +
    `esac\n`;

  const outPath = path.resolve(__dirname, '../docker/runtime-env.defaults.sh');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, content, 'utf8');
  process.stdout.write(`Wrote ${path.relative(process.cwd(), outPath)}\n`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
