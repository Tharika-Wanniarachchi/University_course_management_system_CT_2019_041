<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\CourseController;
use App\Http\Controllers\Api\StudentController;

use App\Http\Controllers\Api\LecturerController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\API\EnrollmentController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;

// Debug route to check if API is reachable
Route::get('/check', function() {
    return response()->json(['status' => 'API is working']);
});

// Route::middleware('auth:sanctum')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/students/{id}/dashboard', [DashboardController::class, 'studentDashboard']);
// });

// Courses routes
Route::get('/courses', [CourseController::class, 'index']);
Route::post('/courses', [CourseController::class, 'store']);
Route::get('/courses/{id}', [CourseController::class, 'show']);
Route::put('/courses/{id}', [CourseController::class, 'update']);
Route::delete('/courses/{id}', [CourseController::class, 'destroy']);

// Enrollment routes
Route::get('/students/{student}/enrollments', [EnrollmentController::class, 'index']);
Route::post('/enrollments', [EnrollmentController::class, 'store']);
Route::delete('/enrollments', [EnrollmentController::class, 'destroy']);

// Test route to verify API is working
Route::get('/test', function () {
    return response()->json([
        'message' => 'API is working!',
        'sanctum' => 'Sanctum is configured correctly',
    ]);
});

// Lecturer routes
// Route::middleware('auth:sanctum')->group(function () {
        Route::get('/lecturers', [LecturerController::class, 'index']);
    Route::patch('/lecturers/{id}/status', [LecturerController::class, 'updateStatus']);

    // Student routes
    Route::get('/students', [StudentController::class, 'index']);
    Route::patch('/students/{id}/status', [StudentController::class, 'updateStatus']);

        // Course Registration routes
    Route::get('/course-registrations', [\App\Http\Controllers\API\CourseRegistrationController::class, 'index']);
    Route::patch('/course-registrations/{id}/status', [\App\Http\Controllers\API\CourseRegistrationController::class, 'updateStatus']);
    Route::get('/course-registrations/statistics', [\App\Http\Controllers\API\CourseRegistrationController::class, 'statistics']);

    // Results routes
    Route::apiResource('results', \App\Http\Controllers\Api\ResultController::class);
    Route::get('students/{student}/results', [\App\Http\Controllers\Api\ResultController::class, 'index']);
    Route::get('students/{student}/results/stats', [\App\Http\Controllers\Api\ResultController::class, 'studentStats']);
// });

// Add 'auth:sanctum' middleware for protected routes
Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

// Add 'web' middleware group to enable sessions for auth routes
Route::middleware('web')->group(function () {
    Route::post('/register', [RegisteredUserController::class, 'store']);
    Route::post('/login', [AuthenticatedSessionController::class, 'store']);
});

// ✅ Add this route:
Route::middleware('auth:sanctum')->post('/logout', function (Request $request) {
    Auth::guard('web')->logout(); // Explicitly log out from the session
    $request->session()->invalidate();
    $request->session()->regenerateToken();

    return response()->json(['message' => 'Logged out']);
});
