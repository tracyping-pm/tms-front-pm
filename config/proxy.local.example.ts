/**
 * 复制为 config/proxy.local.ts（已 gitignore）后按需改 target。
 * 仅 `pnpm start:local`（APP_ENV=local）会加载该文件；start:dev / start:test 等不会读取。
 */
module.exports = {
  '/api/': {
    // target: 'http://192.168.2.6:8080',
    // target: 'http://192.168.2.10:8080',
    target: 'https://dev.gaia.inteluck.com',
    changeOrigin: true,
  },
  '/uam-api/': {
    // target: 'http://192.168.2.10:9010',
    target: 'https://dev.hades.inteluck.com',
    changeOrigin: true,
    pathRewrite: { '^/uam-api': '/api' },
  },
};
