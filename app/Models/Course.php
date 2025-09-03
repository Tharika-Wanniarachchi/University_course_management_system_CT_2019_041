<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    protected $fillable = [
        'title', 'code', 'instructor', 'department',
        'credits', 'capacity', 'schedule', 'status', 'description'
    ];

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class);
    }

    public function students()
    {
        return $this->belongsToMany(User::class, 'enrollments', 'course_id', 'student_id')
            ->withPivot('enrollment_date', 'status')
            ->withTimestamps();
    }
}
