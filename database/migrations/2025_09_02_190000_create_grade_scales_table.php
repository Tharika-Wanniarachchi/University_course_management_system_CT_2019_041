<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('grade_scales', function (Blueprint $table) {
            $table->id();
            $table->string('name', 10);
            $table->string('description')->nullable();
            $table->decimal('min_marks', 5, 2);
            $table->decimal('max_marks', 5, 2);
            $table->decimal('grade_point', 3, 2);
            $table->string('letter_grade', 2);
            $table->timestamps();
        });

        // Insert default grade scale
        DB::table('grade_scales')->insert([
            ['name' => 'A+', 'description' => 'Excellent', 'min_marks' => 97, 'max_marks' => 100, 'grade_point' => 4.00, 'letter_grade' => 'A+'],
            ['name' => 'A', 'description' => 'Excellent', 'min_marks' => 93, 'max_marks' => 96.99, 'grade_point' => 4.00, 'letter_grade' => 'A'],
            ['name' => 'A-', 'description' => 'Excellent', 'min_marks' => 90, 'max_marks' => 92.99, 'grade_point' => 3.70, 'letter_grade' => 'A-'],
            ['name' => 'B+', 'description' => 'Good', 'min_marks' => 87, 'max_marks' => 89.99, 'grade_point' => 3.30, 'letter_grade' => 'B+'],
            ['name' => 'B', 'description' => 'Good', 'min_marks' => 83, 'max_marks' => 86.99, 'grade_point' => 3.00, 'letter_grade' => 'B'],
            ['name' => 'B-', 'description' => 'Good', 'min_marks' => 80, 'max_marks' => 82.99, 'grade_point' => 2.70, 'letter_grade' => 'B-'],
            ['name' => 'C+', 'description' => 'Satisfactory', 'min_marks' => 77, 'max_marks' => 79.99, 'grade_point' => 2.30, 'letter_grade' => 'C+'],
            ['name' => 'C', 'description' => 'Satisfactory', 'min_marks' => 73, 'max_marks' => 76.99, 'grade_point' => 2.00, 'letter_grade' => 'C'],
            ['name' => 'C-', 'description' => 'Satisfactory', 'min_marks' => 70, 'max_marks' => 72.99, 'grade_point' => 1.70, 'letter_grade' => 'C-'],
            ['name' => 'D+', 'description' => 'Passing', 'min_marks' => 67, 'max_marks' => 69.99, 'grade_point' => 1.30, 'letter_grade' => 'D+'],
            ['name' => 'D', 'description' => 'Passing', 'min_marks' => 63, 'max_marks' => 66.99, 'grade_point' => 1.00, 'letter_grade' => 'D'],
            ['name' => 'D-', 'description' => 'Passing', 'min_marks' => 60, 'max_marks' => 62.99, 'grade_point' => 0.70, 'letter_grade' => 'D-'],
            ['name' => 'F', 'description' => 'Fail', 'min_marks' => 0, 'max_marks' => 59.99, 'grade_point' => 0.00, 'letter_grade' => 'F'],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('grade_scales');
    }
};
