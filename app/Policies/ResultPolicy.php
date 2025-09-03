<?php

namespace App\Policies;

use App\Models\Result;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ResultPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Admin and lecturers can view all results
        // Students can only view their own results (handled in controller)
        return in_array($user->role, ['admin', 'lecturer', 'student']);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Result $result): bool
    {
        // Admin and lecturers can view any result
        // Students can only view their own results
        return $user->role === 'admin' || 
               $user->role === 'lecturer' || 
               $result->student_id === $user->id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Only admin and lecturers can create results
        return in_array($user->role, ['admin', 'lecturer']);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Result $result): bool
    {
        // Only admin and lecturers can update results
        return in_array($user->role, ['admin', 'lecturer']);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Result $result): bool
    {
        // Only admin can delete results
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Result $result): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Result $result): bool
    {
        return false;
    }
}
