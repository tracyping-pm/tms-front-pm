#!/bin/sh
set -eu

# Runtime env vars (provide safe defaults to avoid boot failures)
APP_ENV="${APP_ENV:-dev}"

# Load per-env defaults generated from .env.*.ts (baked into image or mounted)
DEFAULTS_FILE=""
for f in \
  "/runtime-env.defaults.sh" \
  "/docker/runtime-env.defaults.sh" \
  "/usr/share/nginx/html/runtime-env.defaults.sh" \
  "/etc/nginx/runtime-env.defaults.sh"
do
  if [ -f "$f" ]; then
    DEFAULTS_FILE="$f"
    break
  fi
done

if [ -n "$DEFAULTS_FILE" ]; then
  # shellcheck disable=SC1090
  . "$DEFAULTS_FILE"
fi

# Derive upstreams from origins unless explicitly overridden (must end with trailing slash)
TMS_ORIGIN="${TMS_ORIGIN:-}"
UAM_ORIGIN="${UAM_ORIGIN:-}"

if [ -z "${API_UPSTREAM:-}" ] && [ -n "$TMS_ORIGIN" ]; then
  API_UPSTREAM="${TMS_ORIGIN%/}/api/"
fi
if [ -z "${UAM_API_UPSTREAM:-}" ] && [ -n "$UAM_ORIGIN" ]; then
  UAM_API_UPSTREAM="${UAM_ORIGIN%/}/api/"
fi

# Final hard fallbacks (keep container bootable even if defaults are missing)
API_UPSTREAM="${API_UPSTREAM:-http://127.0.0.1:8000/api/}"
UAM_API_UPSTREAM="${UAM_API_UPSTREAM:-http://127.0.0.1:9999/api/}"


escape_js_dq() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

mkdir -p /usr/share/nginx/html
cat > /usr/share/nginx/html/config.js <<EOF
window.ENV = window.ENV || {};
window.ENV.APP_ENV = "$(escape_js_dq "$APP_ENV")";
window.ENV.TMS_ORIGIN = "$(escape_js_dq "$TMS_ORIGIN")";
window.ENV.UAM_ORIGIN = "$(escape_js_dq "$UAM_ORIGIN")";
EOF

# Render nginx conf from template (envsubst comes from gettext)
if [ -f /etc/nginx/templates/default.conf.template ]; then
  export APP_ENV API_UPSTREAM UAM_API_UPSTREAM
  envsubst '${APP_ENV} ${API_UPSTREAM} ${UAM_API_UPSTREAM}' \
    < /etc/nginx/templates/default.conf.template \
    > /etc/nginx/conf.d/default.conf
fi

exec "$@"
