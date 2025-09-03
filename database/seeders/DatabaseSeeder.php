<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create admin user
        $this->call(AdminUserSeeder::class);

        // Create test users for each role
        User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'role' => User::ROLE_ADMIN,
        ]);

        User::factory()->create([
            'name' => 'Lecturer User',
            'email' => 'lecturer@example.com',
            'role' => User::ROLE_LECTURER,
        ]);

        User::factory()->create([
            'name' => 'Student User',
            'email' => 'student@example.com',
            'role' => User::ROLE_STUDENT,
        ]);
    }
}
