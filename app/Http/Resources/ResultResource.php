<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ResultResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'student' => [
                'id' => $this->student_id,
                'name' => $this->whenLoaded('student', function () {
                    return $this->student->name;
                }),
                'student_id' => $this->whenLoaded('student', function () {
                    return $this->student->student_id;
                }),
            ],
            'course' => [
                'id' => $this->course_id,
                'code' => $this->whenLoaded('course', function () {
                    return $this->course->code;
                }),
                'name' => $this->whenLoaded('course', function () {
                    return $this->course->name;
                }),
                'credits' => $this->whenLoaded('course', function () {
                    return $this->course->credits;
                }),
            ],
            'semester' => $this->semester,
            'academic_year' => $this->academic_year,
            'marks' => (float) $this->marks,
            'grade' => $this->whenLoaded('grade', function () {
                return [
                    'id' => $this->grade_id,
                    'name' => $this->grade->name,
                    'grade_point' => (float) $this->grade->grade_point,
                    'status' => $this->grade->status,
                ];
            }),
            'remarks' => $this->remarks,
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}
