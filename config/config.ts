import { defineConfig } from '@umijs/max';
import devEnvs from '../.env.dev';
import prodEnvs from '../.env.prod';
import rcEnvs from '../.env.rc';
import testEnvs from '../.env.test';
import uatEnvs from '../.env.uat';
import commonConfig from './config.common';

const { APP_ENV = 'dev' } = process.env;

let define = {};
switch (APP_ENV) {
  case 'local':
    // 与后端本机联调：proxy 仅走 proxy.local.ts；编译时常量与 dev 对齐
    define = {
      ...devEnvs,
    };
    break;
  case 'dev':
    define = {
      ...devEnvs,
    };
    break;
  case 'test':
    define = {
      ...testEnvs,
    };
    break;
  case 'uat':
    define = {
      ...uatEnvs,
    };
    break;
  case 'rc':
    define = {
      ...rcEnvs,
    };
    break;
  case 'prod':
    define = {
      ...prodEnvs,
    };
    break;
  default:
    define = {
      ...prodEnvs,
    };
}

// Build once / run everywhere: compile-time `define` only. BU origins come from UAM API at runtime.
const defineRuntimeSafe: Record<string, any> = { ...(define as any) };
delete defineRuntimeSafe.TMS_ORIGIN;
delete defineRuntimeSafe.UAM_ORIGIN;
delete defineRuntimeSafe.APP_ENV;
define = defineRuntimeSafe;

const json = {
  ...commonConfig,
  define,
  plugins: [require.resolve('./config-js-dev')],
};

// @ts-ignore
export default defineConfig(json);
