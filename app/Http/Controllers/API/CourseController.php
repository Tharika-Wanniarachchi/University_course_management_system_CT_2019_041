<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\Course;
use Illuminate\Support\Facades\Log;

class CourseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = \App\Models\Course::query();

        // Exclude courses that the student is already enrolled in
        if ($request->has('exclude_enrolled_by')) {
            $studentId = $request->query('exclude_enrolled_by');
            $query->whereDoesntHave('enrollments', function($q) use ($studentId) {
                $q->where('student_id', $studentId);
            });
        }

        $courses = $query->get();
        return response()->json($courses);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            // Validate the request data
            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255',
                'code' => 'required|string|max:50|unique:courses,code',
                'instructor' => 'required|string|max:255',
                'department' => 'required|string|max:255',
                'credits' => 'required|integer|min:1|max:10',
                'capacity' => 'required|integer|min:1',
                'schedule' => 'nullable|string|max:255',
                'status' => 'required|in:Active,Deactivated,Planning',
                'description' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Create the course
            $course = Course::create([
                'title' => $request->title,
                'code' => $request->code,
                'instructor' => $request->instructor,
                'department' => $request->department,
                'credits' => $request->credits,
                'capacity' => $request->capacity,
                'schedule' => $request->schedule,
                'status' => $request->status,
                'description' => $request->description,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Course created successfully',
                'data' => $course
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error creating course: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create course',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            // Find the course
            $course = Course::findOrFail($id);

            // Validate the request data
            $validator = Validator::make($request->all(), [
                'title' => 'sometimes|required|string|max:255',
                'code' => 'sometimes|required|string|max:50|unique:courses,code,' . $id,
                'instructor' => 'sometimes|required|string|max:255',
                'department' => 'sometimes|required|string|max:255',
                'credits' => 'sometimes|required|integer|min:1|max:10',
                'capacity' => 'sometimes|required|integer|min:1',
                'schedule' => 'nullable|string|max:255',
                'status' => 'sometimes|required|in:Active,Deactivated,Planning',
                'description' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Update the course with only the fields that were provided
            $course->fill($request->only([
                'title', 'code', 'instructor', 'department', 'credits', 
                'capacity', 'schedule', 'status', 'description'
            ]));
            
            $course->save();

            return response()->json([
                'success' => true,
                'message' => 'Course updated successfully',
                'data' => $course
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Course not found',
                'error' => $e->getMessage()
            ], 404);
        } catch (\Exception $e) {
            Log::error('Error updating course: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update course',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $course = Course::findOrFail($id);
            $course->delete();

            return response()->json([
                'success' => true,
                'message' => 'Course deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting course: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete course',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
