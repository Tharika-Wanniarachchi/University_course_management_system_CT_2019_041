<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Result extends Model
{
    protected $fillable = [
        'student_id',
        'course_id',
        'grade_id',
        'semester',
        'academic_year',
        'marks',
        'remarks'
    ];

    protected $casts = [
        'marks' => 'decimal:2',
    ];

    /**
     * Get the student that owns the result.
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * Get the course that owns the result.
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Get the grade for the result.
     */
    public function grade(): BelongsTo
    {
        return $this->belongsTo(Grade::class);
    }
}
