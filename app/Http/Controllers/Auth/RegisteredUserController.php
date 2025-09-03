<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

class RegisteredUserController extends Controller
{
    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): Response
    {

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:student,lecturer', // Make sure role is in the validation
        ]);
        \Log::info('Created user:', $validated);

        $role = $request->role === 'lecturer' ? 'lecturer' : 'student';

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $role, // Use the role from the request
            'approved' => $validated['role'] === 'student' ? 1 : null, // Auto-approve students, set null for lecturers
        ]);

        \Log::info('Created user:', $user->toArray());

        event(new Registered($user));

        Auth::login($user);

        return response()->noContent();
    }
}
