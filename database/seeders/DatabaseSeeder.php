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
        //$this->call(AdminUserSeeder::class);

        // Create test users for each role
        User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@gmail.com',
            'role' => User::ROLE_ADMIN,
            'approved' => 1,
        ]);

        User::factory()->create([
            'name' => 'Lecturer User',
            'email' => 'lecturer@gmail.com',
            'role' => User::ROLE_LECTURER,
            'approved' => 1,
        ]);

        User::factory()->create([
            'name' => 'Student User',
            'email' => 'student@gmail.com',
            'role' => User::ROLE_STUDENT,
            'approved' => 1,
        ]);
    }
}
