<?php

$files = [
    'app/Http/Controllers/API/DashboardController.php',
    'app/Http/Controllers/API/LecturerController.php',
    'app/Http/Controllers/API/ResultController.php',
    'app/Http/Controllers/API/StudentController.php',
    'app/Http/Controllers/API/CourseController.php',
    'app/Http/Controllers/API/CourseRegistrationController.php',
    'app/Http/Controllers/API/EnrollmentController.php',
    'app/Http/Controllers/API/ResourceController.php'
];

foreach ($files as $file) {
    if (file_exists($file)) {
        $content = file_get_contents($file);
        $content = str_replace('namespace App\\Http\\Controllers\\API;', 'namespace App\\Http\\Controllers\\Api;', $content);
        file_put_contents($file, $content);
        echo "Updated: $file\n";
    } else {
        echo "Not found: $file\n";
    }
}

echo "\nNamespace update complete.\n";
