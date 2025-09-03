#!/usr/bin/env sh
set -e
cd /var/www/html

# Ensure nginx runtime dir
mkdir -p /run/nginx

# Render nginx config from template (uses $PORT)
if command -v envsubst >/dev/null 2>&1; then
  envsubst '${PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
else
  echo "WARN: envsubst missing; copying template as-is"
  cp /etc/nginx/conf.d/default.conf.template /etc/nginx/conf.d/default.conf
fi

# Laravel warm-up (do not hard-fail on first boot)
php artisan storage:link      || true
php artisan config:clear      || true
php artisan route:clear       || true
php artisan view:clear        || true
php artisan migrate --force   || true
php artisan config:cache      || true
php artisan route:cache       || true
php artisan view:cache        || true

# Start services
exec /usr/bin/supervisord -c /etc/supervisord.conf
