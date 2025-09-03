<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\Course;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CourseRegistrationController extends Controller
{
    /**
     * Get all course registrations with filters
     */
    public function index(Request $request)
    {
        try {
            $query = Course::query()
                ->select(['id', 'title', 'code', 'credits', 'instructor', 'department', 'schedule', 'description', 'status', 'created_at']);

            // status filter
            if ($request->filled('status')) {
                $query->where('status', $request->string('status'));
            }

            // search filter (course title/code or instructor)
            if ($request->filled('search')) {
                $search = $request->string('search');
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('code', 'like', "%{$search}%")
                      ->orWhere('instructor', 'like', "%{$search}%");
                });
            }

            $perPage = (int)($request->per_page ?? 15);
            $courses = $query->latest()->paginate($perPage);

            // Transform the data to include only course details
            $transformedData = $courses->getCollection()->map(function($course) {
                return [
                    'id' => $course->id,
                    'title' => $course->title,
                    'code' => $course->code,
                    'credits' => $course->credits,
                    'instructor' => $course->instructor,
                    'department' => $course->department,
                    'schedule' => $course->schedule,
                    'description' => $course->description,
                    'status' => $course->status,
                    'created_at' => $course->created_at,
                    'capacity' => $course->capacity
                ];
            });

            // Create a new paginator with the transformed data
            $result = new \Illuminate\Pagination\LengthAwarePaginator(
                $transformedData,
                $courses->total(),
                $courses->perPage(),
                $courses->currentPage(),
                ['path' => \Request::url(), 'query' => $request->query()]
            );

            return response()->json($result);
        } catch (\Exception $e) {
            Log::error('Error fetching course registrations: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch registrations'], 500);
        }
    }
    /**
     * Update registration status
     */
    public function updateStatus(Request $request, $id)
    {
        try {
            $request->validate([
                'status' => 'required|in:Active,Deactivated,Planning',
                'feedback' => 'nullable|string|max:500'
            ]);

            $course = Course::findOrFail($id);
            $course->status = $request->status;
            $course->save();

            return response()->json([
                'message' => 'Course status updated successfully',
                'data' => $course
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating registration status: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update registration status'], 500);
        }
    }

    /**
     * Get registration statistics
     */
    public function statistics()
    {
        try {
            $total = Course::count();
            $active = Course::where('status', 'Active')->count();
            $deactivated = Course::where('status', 'Deactivated')->count();
            $planning = Course::where('status', 'Planning')->count();

            return response()->json([
                'total' => $total,
                'active' => $active,
                'deactivated' => $deactivated,
                'planning' => $planning
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching registration statistics: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch statistics'], 500);
        }
    }
}
