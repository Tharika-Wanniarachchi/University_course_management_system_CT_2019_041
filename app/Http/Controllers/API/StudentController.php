<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

class StudentController extends Controller
{
    public function index()
    {
        try {
            $students = User::where('role', User::ROLE_STUDENT)
                ->select(['id', 'name', 'email', 'created_at', 'approved'])
                // ->withCount('courses')
                ->orderByDesc('created_at')
                ->get()
                ->map(function ($student) {
                    return [
                        'id' => $student->id,
                        'name' => $student->name,
                        'email' => $student->email,
                        'department' => $student->department ?? 'Not specified',
                        'coursesCount' => $student->courses_count ?? 0,
                        'status' => $student->approved === null ? 'Pending' : ($student->approved ? 'Active' : 'Inactive'),
                        'joinedDate' => $student->created_at->format('Y-m-d'),
                        'avatar' => ''
                    ];
                });

            return response()->json($students);
        } catch (\Exception $e) {
            Log::error('Error fetching students: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch students'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function updateStatus(Request $request, $id)
    {
        try {
            $request->validate([
                'status' => 'required|in:Active,Inactive,Pending',
            ]);

            $student = User::where('role', User::ROLE_STUDENT)->findOrFail($id);
            $student->approved = $request->status === 'Active';
            $student->save();

            return response()->json([
                'message' => 'Student status updated successfully',
                'student' => [
                    'id' => $student->id,
                    'status' => $student->approved ? 'Active' : 'Inactive'
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating student status: ' . $e->getMessage());
            return response()->json(
                ['error' => 'Failed to update student status'],
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }
}
