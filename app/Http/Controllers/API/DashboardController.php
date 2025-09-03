<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Course;
use App\Models\Result;
use App\Models\Enrollment;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function studentDashboard($id)
    {
        try {
            $student = User::findOrFail($id);

            // Get total courses available
            $totalCourses = Course::count();

            // Get enrolled courses count for the student
            $enrolledCourses = Enrollment::where('student_id', $id)->count();

            // Get results count for the student
            $uploadedResults = Result::where('student_id', $id)->count();

            // Calculate GPA (assuming GPA is stored in the users table or needs calculation)
            $gpa = $student->gpa ?? 0.0;

            // Get recent activities (enrollments and results)
            $recentActivities = collect([]);

            // Add enrollments to activities
            $enrollments = Enrollment::with('course')
                ->where('student_id', $id)
                ->latest()
                ->take(5)
                ->get()
                ->map(function($enrollment) {
                    return [
                        'id' => $enrollment->id,
                        'type' => 'enrollment',
                        'title' => 'Course Enrollment',
                        'description' => 'Enrolled in ' . ($enrollment->course->title ?? 'a course'),
                        'date' => $enrollment->created_at->format('Y-m-d H:i:s'),
                        'icon' => 'book-open'
                    ];
                });

            // Add results to activities
            $results = Result::with('course')
                ->where('student_id', $id)
                ->latest()
                ->take(5)
                ->get()
                ->map(function($result) {
                    return [
                        'id' => $result->id,
                        'type' => 'result',
                        'title' => 'Result Published',
                        'description' => 'Received marks for ' . ($result->course->title ?? 'a course') . ': ' . $result->marks . '/100',
                        'date' => $result->created_at->format('Y-m-d H:i:s'),
                        'icon' => 'award'
                    ];
                });

            // Combine and sort activities
            $recentActivities = $enrollments->merge($results)
                ->sortByDesc('date')
                ->take(5);

            return response()->json([
                'success' => true,
                'data' => [
                    'total_courses' => $totalCourses,
                    'enrolled_courses' => $enrolledCourses,
                    'uploaded_results' => $uploadedResults,
                    'gpa' => $gpa,
                    'recent_activities' => $recentActivities->values()
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Error fetching student dashboard: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch student dashboard data'
            ], 500);
        }
    }

    public function index(Request $request)
    {
        try {
            \Log::info('Fetching dashboard data...');

            $stats = [
                'users' => User::count(),
                'students' => User::where('role', User::ROLE_STUDENT)->where('approved', 1)->count(),
                'lecturers' => User::where('role', User::ROLE_LECTURER)->where('approved', 1)->count(),
                'admins' => User::where('role', User::ROLE_ADMIN)->count(),
                'pendingLecturers' => User::where('role', User::ROLE_LECTURER)->where('approved', 0)->count(),
                'courses' => Course::count(),
                'activeCourses' => Course::where('status', 'Active')->count(),
                'results' => Result::count(),
                'pendingRegistrations' => User::where('approved', null)->count(),
                'enrolledStudents' => Enrollment::count(),
            ];

        \Log::info('Stats data:', $stats);

        $recent = collect([
            User::latest()->take(3)->get(['id','name','email','role','created_at'])->map(fn($u) => [
                'type' => 'user', 'id' => $u->id, 'title' => $u->name,
                'subtitle' => ucfirst($u->role), 'meta' => $u->email, 'at' => $u->created_at,
            ]),
            Course::latest()->take(3)->get(['id','title','code','status','created_at'])->map(fn($c) => [
                'type' => 'course', 'id' => $c->id, 'title' => $c->title,
                'subtitle' => $c->code, 'meta' => $c->status, 'at' => $c->created_at,
            ]),
            Result::with(['student:id,name','course:id,title,code'])
                ->latest()->take(3)->get(['id','student_id','course_id','marks','created_at'])
                ->map(fn($r) => [
                    'type' => 'result', 'id' => $r->id,
                    'title' => $r->student?->name ?? "Student #{$r->student_id}",
                    'subtitle' => $r->course?->title, 'meta' => ($r->course?->code ? $r->course->code.' • ' : '').'Marks: '.$r->marks,
                    'at' => $r->created_at,
                ]),
            Enrollment::with(['student:id,name','course:id,title,code'])
                ->latest()->take(3)->get(['id','student_id','course_id','status','created_at'])
                ->map(fn($e) => [
                    'type' => 'registration', 'id' => $e->id,
                    'title' => $e->student?->name ?? "Student #{$e->student_id}",
                    'subtitle' => $e->course?->title, 'meta' => ($e->course?->code ? $e->course->code.' • ' : '').$e->status,
                    'at' => $e->created_at,
                ]),
        ])->flatten(1)->sortByDesc('at')->values()->take(5);

        return response()->json(['counts' => $stats, 'recent' => $recent]);
    } catch (\Exception $e) {
        \Log::error('Dashboard error: ' . $e->getMessage());
        \Log::error($e->getTraceAsString());
        return response()->json(['error' => $e->getMessage()], 500);
    }
}
}
