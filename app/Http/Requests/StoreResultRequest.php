<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreResultRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization is handled by policies
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'student_id' => [
                'required',
                'exists:users,id',
                function ($attribute, $value, $fail) {
                    $user = \App\Models\User::find($value);
                    if (!$user || $user->role !== 'student') {
                        $fail('The selected student is invalid.');
                    }
                },
            ],
            'course_id' => [
                'required',
                'exists:courses,id',
                function ($attribute, $value, $fail) {
                    // Check if the student is enrolled in this course
                    $enrollment = \App\Models\Enrollment::where('student_id', $this->student_id)
                        ->where('course_id', $value)
                        ->exists();
                    
                    if (!$enrollment) {
                        $fail('The student is not enrolled in this course.');
                    }

                    // Check for duplicate result for the same student, course, semester, and academic year
                    $exists = \App\Models\Result::where('student_id', $this->student_id)
                        ->where('course_id', $value)
                        ->where('semester', $this->semester)
                        ->where('academic_year', $this->academic_year)
                        ->when($this->result, function ($query) {
                            return $query->where('id', '!=', $this->result->id);
                        })
                        ->exists();
                    
                    if ($exists) {
                        $fail('A result already exists for this student in the selected course, semester, and academic year.');
                    }
                },
            ],
            'semester' => [
                'required',
                'string',
                'in:Semester I,Semester II',
            ],
            'academic_year' => [
                'required',
                'string',
                'regex:/^\d{4}-\d{4}$/',
            ],
            'marks' => [
                'required',
                'numeric',
                'min:0',
                'max:100',
            ],
            'remarks' => [
                'nullable',
                'string',
                'max:500',
            ],
        ];
    }
}
