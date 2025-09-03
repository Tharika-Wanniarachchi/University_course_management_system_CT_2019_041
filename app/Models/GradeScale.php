<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GradeScale extends Model
{
    protected $fillable = [
        'name',
        'description',
        'min_marks',
        'max_marks',
        'grade_point',
        'letter_grade',
    ];

    protected $casts = [
        'min_marks' => 'float',
        'max_marks' => 'float',
        'grade_point' => 'float',
    ];

    /**
     * Find the grade scale for a given mark
     */
    public static function findForMarks(float $marks): ?self
    {
        return static::where('min_marks', '<=', $marks)
            ->where('max_marks', '>=', $marks)
            ->first();
    }
}
