/**
 * 在生产环境 代理是无法生效的，所以这里没有生产环境的配置
 * -------------------------------
 * Umi 使用 `proxy[process.env.APP_ENV]`（见 config.common.ts）。
 *
 * - `pnpm start:local` → APP_ENV=local → **仅**使用 `proxy.local.ts`（对接后端开发者本机）
 * - `pnpm start:dev|test|uat|...` → **仅**使用本文件内按环境生成的 target，**不会**合并 `proxy.local.ts`
 */

const { existsSync } = require('fs');
const path = require('path');

const { APP_ENV = 'dev' } = process.env;

const localPath = path.join(__dirname, 'proxy.local.ts');

/** TMS / UAM 远程域名（与 .env.*.ts 中约定一致；prod 使用独立主机名） */
function remoteTarget(env: string, which: 'tms' | 'uam'): string {
  if (env === 'prod') {
    return which === 'tms'
      ? 'https://tms.inteluck.com'
      : 'https://uam.inteluck.com';
  }
  const codename = which === 'tms' ? 'gaia' : 'hades';
  return `https://${env}.${codename}.inteluck.com`;
}

function buildRemoteProxy(env: string) {
  return {
    '/api/': {
      target: remoteTarget(env, 'tms'),
      changeOrigin: true,
    },
    '/uam-api/': {
      target: remoteTarget(env, 'uam'),
      changeOrigin: true,
      pathRewrite: { '^/uam-api': '/api' },
    },
  };
}

const remoteProxies = {
  dev: buildRemoteProxy('dev'),
  test: buildRemoteProxy('test'),
  uat: buildRemoteProxy('uat'),
  rc: buildRemoteProxy('rc'),
  prod: buildRemoteProxy('prod'),
};

let localProxy: Record<string, unknown> | undefined;

if (APP_ENV === 'local') {
  if (!existsSync(localPath)) {
    console.error(
      '[proxy] APP_ENV=local 需要 config/proxy.local.ts。请复制 config/proxy.local.example.ts 为 proxy.local.ts 并填写 target。',
    );
    process.exit(1);
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  localProxy = require('./proxy.local');
  console.log('🚀 [proxy] APP_ENV=local，仅使用 config/proxy.local.ts');
} else {
  console.log(
    `🚀 [proxy] APP_ENV=${APP_ENV}，使用 config/proxy.ts 内远程 target（不读取 proxy.local.ts）`,
  );
}

export default {
  ...remoteProxies,
  ...(APP_ENV === 'local' && localProxy ? { local: localProxy } : {}),
};
