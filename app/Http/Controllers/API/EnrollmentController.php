<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class EnrollmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index($studentId)
    {
        $enrollments = \App\Models\Enrollment::with('course')
            ->where('student_id', $studentId)
            ->get()
            ->map(fn($enrollment) => $enrollment->course);

        return response()->json($enrollments);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:users,id',
            'course_id' => 'required|exists:courses,id',
        ]);

        $enrollment = \App\Models\Enrollment::create([
            'student_id' => $validated['student_id'],
            'course_id' => $validated['course_id'],
            'enrollment_date' => now(),
            'status' => 'active'
        ]);

        return response()->json($enrollment, 201);
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
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:users,id',
            'course_id' => 'required|exists:courses,id',
        ]);

        $enrollment = \App\Models\Enrollment::where('student_id', $validated['student_id'])
            ->where('course_id', $validated['course_id'])
            ->firstOrFail();

        $enrollment->delete();

        return response()->json(null, 204);
    }
}
