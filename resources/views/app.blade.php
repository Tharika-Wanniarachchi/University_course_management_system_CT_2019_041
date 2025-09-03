<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>University Management System</title>
    
    @if(app()->environment('local'))
        <!-- In development, use Vite dev server -->
        <script type="module" src="http://localhost:8080/@vite/client"></script>
        <script type="module" src="http://localhost:8080/src/main.tsx"></script>
    @else
        <!-- In production, use built assets -->
        @viteReactRefresh
        @vite(['resources/js/app.js', 'resources/css/app.css'])
    @endif
</head>
<body class="font-sans antialiased">
    <div id="root"></div>
    </div>
</body>
</html>
