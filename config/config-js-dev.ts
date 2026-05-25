import type { IApi } from '@umijs/max';

export default (api: IApi) => {
  api.addBeforeMiddlewares(() => [
    (req: any, res: any, next: any) => {
      const pathname = (req.url || '').split('?')[0];
      if (pathname !== '/config.js') {
        next();
        return;
      }
      const appEnv = process.env.APP_ENV ?? 'dev';
      const body = [
        'window.ENV = window.ENV || {};',
        `window.ENV.APP_ENV = ${JSON.stringify(appEnv)};`,
        'window.ENV.TMS_ORIGIN = "";',
        'window.ENV.UAM_ORIGIN = "";',
      ].join('\n');
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.end(body);
    },
  ]);
};
