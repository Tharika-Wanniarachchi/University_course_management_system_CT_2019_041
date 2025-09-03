<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    protected $appends = ['avatar_url'];

    public function getAvatarUrlAttribute()
    {
        return 'https://ui-avatars.com/api/?name=' . urlencode($this->name) . '&background=random';
    }

    // public function courses(): HasMany
    // {
    //     return $this->hasMany(Course::class, 'lecturer_id');
    // }

    public const ROLE_ADMIN = 'admin';
    public const ROLE_LECTURER = 'lecturer';
    public const ROLE_STUDENT = 'student';

    public const ROLES = [
        self::ROLE_ADMIN,
        self::ROLE_LECTURER,
        self::ROLE_STUDENT,
    ];

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'approved'
    ];

    protected $attributes = [
        'role' => self::ROLE_STUDENT,
    ];

    protected $casts = [
        'approved' => 'boolean',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    public function isLecturer(): bool
    {
        return $this->role === self::ROLE_LECTURER;
    }

    public function isStudent(): bool
    {
        return $this->role === self::ROLE_STUDENT;
    }

   public function isApproved(): bool
    {
        return $this->approved == true;
    }

    public function hasAnyRole(array $roles): bool
    {
        return in_array($this->role, $roles, true);
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class, 'student_id');
    }

    public function enrolledCourses()
    {
        return $this->belongsToMany(Course::class, 'enrollments', 'student_id', 'course_id')
            ->withPivot('enrollment_date', 'status')
            ->withTimestamps();
    }
}
