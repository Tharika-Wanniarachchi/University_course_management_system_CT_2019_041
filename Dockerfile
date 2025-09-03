# ---------- Base: PHP-FPM ----------
    FROM php:8.2-fpm

    ARG DEBIAN_FRONTEND=noninteractive

    # System deps (nginx, supervisord, envsubst, node for SPA build)
    RUN apt-get update && apt-get install -y \
        git curl unzip zip \
        libzip-dev libpng-dev libonig-dev libxml2-dev \
        nginx supervisor gettext-base \
        nodejs npm \
     && docker-php-ext-install pdo_mysql mbstring bcmath exif gd zip opcache \
     && apt-get clean && rm -rf /var/lib/apt/lists/*

    # Composer
    COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

    WORKDIR /var/www/html

    # Install PHP deps first for layer caching
    COPY composer.json composer.lock ./
    RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts

    # Copy the rest of the app
    COPY . .

    # Build frontend (if present) and place artifacts under public/spa
    RUN if [ -d "./frontend" ]; then \
          cd frontend && npm ci && npm run build && cd .. && \
          mkdir -p public/spa && cp -r frontend/dist/* public/spa/; \
        fi

    # Laravel writable dirs and sane permissions
    RUN mkdir -p storage/framework/{cache,sessions,views} storage/logs bootstrap/cache \
     && chown -R www-data:www-data storage bootstrap/cache \
     && chmod -R 775 storage bootstrap/cache

    # Nginx template, supervisord, entrypoint
    COPY docker/nginx/default.conf.template /etc/nginx/conf.d/default.conf.template
    COPY docker/supervisord.conf /etc/supervisord.conf
    COPY docker/entrypoint.sh /entrypoint.sh
    RUN chmod +x /entrypoint.sh

    # Railway/HTTP port
    EXPOSE 8080

    # Start via entrypoint (renders nginx conf, warms Laravel, starts supervisord)
    ENTRYPOINT ["/entrypoint.sh"]
