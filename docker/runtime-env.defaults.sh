#!/usr/bin/env sh
# GENERATED FILE — DO NOT EDIT
# Source: .env.*.ts
# Generator: scripts/generate-runtime-env-defaults.ts
set -e

case "$APP_ENV" in
  dev)
    TMS_ORIGIN='https://dev.gaia.inteluck.com'
    UAM_ORIGIN='https://dev.hades.inteluck.com'
    ;;
  test)
    TMS_ORIGIN='https://test.gaia.inteluck.com'
    UAM_ORIGIN='https://test.hades.inteluck.com'
    ;;
  uat)
    TMS_ORIGIN='https://uat.gaia.inteluck.com'
    UAM_ORIGIN='https://uat.hades.inteluck.com'
    ;;
  rc)
    TMS_ORIGIN='https://rc.gaia.inteluck.com'
    UAM_ORIGIN='https://rc.hades.inteluck.com'
    ;;
  prod)
    TMS_ORIGIN='https://tms.inteluck.com'
    UAM_ORIGIN='https://uam.inteluck.com'
    ;;
  *)
    echo "Unknown APP_ENV: $APP_ENV" >&2
    exit 1
    ;;
esac
