<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

class LecturerController extends Controller
{
    public function index()
    {
        try {
            $lecturers = User::where('role', User::ROLE_LECTURER)
                ->select(['id', 'name', 'email', 'created_at', 'approved'])
                // ->withCount('courses')
                ->orderByDesc('created_at')
                ->get()
                ->map(function ($lecturer) {
                    return [
                        'id' => $lecturer->id,
                        'name' => $lecturer->name,
                        'email' => $lecturer->email,
                        'department' => $lecturer->department ?? 'Not specified',
                        'coursesCount' => $lecturer->courses_count ?? 0,
                        'status' => $lecturer->approved === null ? 'Pending' : ($lecturer->approved ? 'Active' : 'Inactive'),
                        'joinedDate' => $lecturer->created_at->format('Y-m-d'),
                        'avatar' => ''
                    ];
                });

            return response()->json($lecturers);
        } catch (\Exception $e) {
            Log::error('Error fetching lecturers: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch lecturers'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function updateStatus(Request $request, $id)
    {
        try {
            $request->validate([
                'status' => 'required|in:Active,Inactive,Pending',
            ]);

            $lecturer = User::where('role', User::ROLE_LECTURER)->findOrFail($id);
            $lecturer->approved = $request->status === 'Active';
            $lecturer->save();

            return response()->json([
                'message' => 'Lecturer status updated successfully',
                'lecturer' => [
                    'id' => $lecturer->id,
                    'status' => $lecturer->approved ? 'Active' : 'Inactive'
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating lecturer status: ' . $e->getMessage());
            return response()->json(
                ['error' => 'Failed to update lecturer status'],
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }
}
