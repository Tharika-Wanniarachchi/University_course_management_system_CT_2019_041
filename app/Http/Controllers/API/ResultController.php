<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Models\Grade;
use App\Models\Course;
use App\Models\Result;
use App\Models\GradeScale;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Http\Resources\ResultResource;
use App\Http\Requests\StoreResultRequest;

class ResultController extends Controller
{
    /**
     * Display a listing of results with optional filters.
     */
    public function index(Request $request)
    {
        $query = Result::with(['student', 'course', 'grade']);

        // Filter by student
        if ($request->has('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        // Filter by course
        if ($request->has('course_id')) {
            $query->where('course_id', $request->course_id);
        }

        // Filter by semester
        if ($request->has('semester')) {
            $query->where('semester', $request->semester);
        }

        // Filter by academic year
        if ($request->has('academic_year')) {
            $query->where('academic_year', $request->academic_year);
        }

        $results = $query->paginate(15);
        return ResultResource::collection($results);
    }

    /**
     * Store a newly created result in storage.
     */
    public function store(StoreResultRequest $request)
    {
        return DB::transaction(function () use ($request) {
            // Find or create enrollment
            $enrollment = \App\Models\Enrollment::firstOrCreate(
                [
                    'student_id' => $request->student_id,
                    'course_id' => $request->course_id,
                ],
                [
                    'enrolled_at' => now(),
                    'status' => 'enrolled',
                ]
            );

            // Find the grade scale based on marks
            $gradeScale = GradeScale::where('min_marks', '<=', $request->marks)
                ->where('max_marks', '>=', $request->marks)
                ->firstOrFail();

            // Create a new grade record
            $grade = Grade::create([
                'enrollment_id' => $enrollment->id,
                'letter_grade' => $gradeScale->letter_grade,
                'grade' => $gradeScale->grade_point,
                'graded_by' => auth()->id(),
                'graded_date' => now(),
            ]);

            $result = Result::create([
                'student_id' => $request->student_id,
                'course_id' => $request->course_id,
                'grade_id' => $grade->id,
                'semester' => $request->semester,
                'academic_year' => $request->academic_year,
                'marks' => $request->marks,
                'remarks' => $request->remarks,
            ]);

            return new ResultResource($result->load(['student', 'course', 'grade']));
        });
    }

    /**
     * Display the specified result.
     */
    public function show(Result $result)
    {
        return new ResultResource($result->load(['student', 'course', 'grade']));
    }

    /**
     * Update the specified result in storage.
     */
    public function update(StoreResultRequest $request, Result $result)
    {
        return DB::transaction(function () use ($request, $result) {
            $grade = $result->grade;

            // If marks are being updated, update the grade as well
            if ($request->has('marks')) {
                $gradeScale = GradeScale::where('min_marks', '<=', $request->marks)
                    ->where('max_marks', '>=', $request->marks)
                    ->firstOrFail();

                // Update the existing grade record
                $grade->update([
                    'grade' => $gradeScale->grade_point,
                    'letter_grade' => $gradeScale->letter_grade,
                    'graded_date' => now(),
                ]);
            }

            $result->update([
                'student_id' => $request->student_id ?? $result->student_id,
                'course_id' => $request->course_id ?? $result->course_id,
                'semester' => $request->semester ?? $result->semester,
                'academic_year' => $request->academic_year ?? $result->academic_year,
                'marks' => $request->has('marks') ? $request->marks : $result->marks,
                'remarks' => $request->has('remarks') ? $request->remarks : $result->remarks,
            ]);

            return new ResultResource($result->load(['student', 'course', 'grade']));
        });
    }
    /**
     * Remove the specified result from storage.
     */
    public function destroy(Result $result)
    {
        $result->delete();
        return response()->json(null, Response::HTTP_NO_CONTENT);
    }

    /**
     * Get academic statistics for a student
     */
    public function studentStats($studentId)
    {
        $results = Result::with('course', 'grade')
            ->where('student_id', $studentId)
            ->get();

        $totalCredits = 0;
        $totalGradePoints = 0;
        $resultsBySemester = [];

        foreach ($results as $result) {
            $semester = $result->semester;
            if (!isset($resultsBySemester[$semester])) {
                $resultsBySemester[$semester] = [
                    'semester' => $semester,
                    'courses' => [],
                    'total_credits' => 0,
                    'total_grade_points' => 0,
                ];
            }

            $gradePoint = $result->grade->grade_point;
            $credits = $result->course->credits;

            $resultsBySemester[$semester]['courses'][] = $result;
            $resultsBySemester[$semester]['total_credits'] += $credits;
            $resultsBySemester[$semester]['total_grade_points'] += ($gradePoint * $credits);

            $totalCredits += $credits;
            $totalGradePoints += ($gradePoint * $credits);
        }

        // Calculate CGPA
        $cgpa = $totalCredits > 0 ? $totalGradePoints / $totalCredits : 0;

        return response()->json([
            'student' => User::findOrFail($studentId),
            'results_by_semester' => array_values($resultsBySemester),
            'overall' => [
                'total_credits' => $totalCredits,
                'total_grade_points' => $totalGradePoints,
                'cgpa' => round($cgpa, 2),
            ]
        ]);
    }
}
