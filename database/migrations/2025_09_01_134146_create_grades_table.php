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
        Schema::create('grades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('enrollment_id')->constrained()->onDelete('cascade');
            $table->decimal('grade', 5, 2)->nullable()->comment('Numeric grade (0-100)');
            $table->string('letter_grade', 2)->nullable()->comment('Letter grade (A, B, C, etc.)');
            $table->text('comments')->nullable()->comment('Instructor comments');
            $table->date('graded_date')->nullable();
            $table->foreignId('graded_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            // Add index for faster lookups
            $table->index('enrollment_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('grades');
    }
};
