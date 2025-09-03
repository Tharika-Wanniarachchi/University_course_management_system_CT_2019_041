# University Course Management System

A comprehensive course management system built with Laravel and React, designed to handle student enrollments, course management, and academic records.

## Features

- User authentication (Admin, Lecturer, Student)
- Course management
- Student and lecturer management
- Results and grade tracking
- Academic calendar
- Responsive design

## Tech Stack

- **Backend**: Laravel 10
- **Frontend**: React 18, TypeScript, Vite
- **Database**: MySQL
- **Authentication**: Laravel Sanctum
- **UI Components**: Shadcn UI
- **Containerization**: Docker

## Prerequisites

- PHP 8.1+
- Node.js 16+
- Composer
- MySQL 8.0+
- Docker & Docker Compose (for containerized deployment)

## Local Development

### 1. Clone the Repository

```bash
git clone https://github.com/Tharika-Wanniarachchi/University_course_management_system_CT_2019_041.git
cd University_course_management_system_CT_2019_041
```

### 2. Install Dependencies

```bash
# Install PHP dependencies
composer install

# Install Node.js dependencies
cd frontend
npm install
cd ..
```

### 3. Environment Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Generate application key:
   ```bash
   php artisan key:generate
   ```

3. Configure your database in `.env`:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=ums
   DB_USERNAME=root
   DB_PASSWORD=
   ```

### 4. Database Setup

```bash
# Run migrations and seeders
php artisan migrate --seed
```

### 5. Start Development Servers

In separate terminals:

1. Backend server:
   ```bash
   php artisan serve
   ```

2. Frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```

Access the application at: http://localhost:3000

## Docker Deployment

### 1. Start Containers

```bash
docker compose up -d --build
```

### 2. Install Dependencies

```bash
docker compose exec app composer install
docker compose exec app npm install
```

### 3. Environment Setup

```bash
docker compose exec app cp .env.example .env
docker compose exec app php artisan key:generate
```

### 4. Database Setup

```bash
docker compose exec app php artisan migrate --seed
```

Access the application at: http://localhost:8000

## Production Deployment

### 1. Server Requirements

- PHP 8.1+
- MySQL 8.0+
- Node.js 16+
- Nginx/Apache
- Composer
- Supervisor (for queue workers)

### 2. Deployment Steps

1. Clone the repository to your server
2. Install dependencies:
   ```bash
   composer install --optimize-autoloader --no-dev
   cd frontend && npm install && npm run build
   ```
3. Set up environment variables in `.env`
4. Generate application key:
   ```bash
   php artisan key:generate
   ```
5. Run migrations:
   ```bash
   php artisan migrate --force
   ```
6. Optimize the application:
   ```bash
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```
7. Set up the queue worker in Supervisor
8. Configure your web server (Nginx/Apache)

### 3. Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `APP_ENV` | Application environment | `local` |
| `APP_DEBUG` | Enable debug mode | `false` in production |
| `APP_URL` | Application URL | `http://localhost` |
| `DB_*` | Database configuration | - |
| `MAIL_*` | Email configuration | - |
| `SANCTUM_STATEFUL_DOMAINS` | Domains for Sanctum auth | - |

## Security

- Always use `https` in production
- Set `APP_DEBUG=false` in production
- Keep your `.env` file secure and never commit it to version control
- Regularly update dependencies
- Use strong database credentials

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open-source and available under the [MIT License](LICENSE).

## Support

For support, please open an issue in the GitHub repository.
