FROM php:8.2-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libpq-dev \
    libzip-dev \
    nginx \
    supervisor \
    nodejs \
    npm \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && npm install -g npm@latest

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip opcache

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Configure PHP-FPM
RUN mkdir -p /var/run/php && \
    touch /var/run/php/php8.2-fpm.sock

# Set working directory
WORKDIR /var/www/html

# Copy application files
COPY . .

# Create required directories and set permissions
RUN mkdir -p storage/framework/{sessions,views,cache} storage/logs bootstrap/cache \
    && chmod -R 777 storage bootstrap/cache

# Install dependencies and optimize
RUN composer install --no-dev --optimize-autoloader --no-interaction \
    && php artisan config:cache \
    && php artisan route:cache \
    && php artisan view:cache

# Create storage link and set permissions
RUN php artisan storage:link \
    && chown -R www-data:www-data /var/www/html/storage \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Configure supervisor
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Copy Nginx config
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Build frontend if exists
RUN if [ -d "frontend" ]; then \
    cd frontend && \
    npm ci && \
    npm run build && \
    cd ..; \
    fi

# Expose port 9000 for PHP-FPM
EXPOSE 9000

# Start supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
