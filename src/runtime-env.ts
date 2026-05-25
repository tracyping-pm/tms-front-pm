export function getAppEnv(): string {
  if (typeof window !== 'undefined' && window.ENV?.APP_ENV) {
    return window.ENV.APP_ENV;
  }
  return 'prod';
}
