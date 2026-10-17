<?php

namespace App\Services;

use App\Models\AcademicYear;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\StudentEnrolment;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\StreamedResponse;

class StudentCsvService
{
    public const HEADERS = [
        'admission_number', 'first_name', 'last_name', 'date_of_birth',
        'gender', 'admission_date', 'status', 'class_name',
    ];

    public function export(Builder $query): StreamedResponse
    {
        $students = $query->with('enrolments.schoolClass')->orderBy('last_name')->get();

        return response()->streamDownload(function () use ($students) {
            $out = fopen('php://output', 'w');
            fputcsv($out, self::HEADERS);

            foreach ($students as $student) {
                fputcsv($out, [
                    $student->admission_number,
                    $student->first_name,
                    $student->last_name,
                    $student->date_of_birth?->format('Y-m-d'),
                    $student->gender,
                    $student->admission_date->format('Y-m-d'),
                    $student->status,
                    $student->enrolments->first()?->schoolClass?->name,
                ]);
            }

            fclose($out);
        }, 'students.csv', ['Content-Type' => 'text/csv']);
    }

    /**
     * @return array{created: int, errors: array<int, array{row: int, messages: array<string>}>}
     */
    public function import(string $filePath): array
    {
        $handle = fopen($filePath, 'r');
        $header = fgetcsv($handle);

        if ($header === false) {
            fclose($handle);

            return ['created' => 0, 'errors' => [['row' => 0, 'messages' => ['The file is empty.']]]];
        }

        $header = array_map(fn ($h) => strtolower(trim((string) $h)), $header);
        $currentYear = AcademicYear::current();
        $created = 0;
        $errors = [];
        $rowNumber = 1;

        while (($row = fgetcsv($handle)) !== false) {
            $rowNumber++;

            if (count(array_filter($row, fn ($v) => $v !== null && $v !== '')) === 0) {
                continue; // skip blank lines
            }

            $data = array_combine($header, array_pad($row, count($header), null));

            $validator = Validator::make($data, [
                'admission_number' => ['required', 'string', 'max:30', 'unique:students,admission_number'],
                'first_name' => ['required', 'string', 'max:100'],
                'last_name' => ['required', 'string', 'max:100'],
                'date_of_birth' => ['nullable', 'date'],
                'gender' => ['nullable', 'in:male,female'],
                'admission_date' => ['required', 'date'],
                'status' => ['nullable', 'in:active,graduated,withdrawn'],
                'class_name' => ['nullable', 'string'],
            ]);

            if ($validator->fails()) {
                $errors[] = ['row' => $rowNumber, 'messages' => $validator->errors()->all()];
                continue;
            }

            $valid = $validator->validated();

            try {
                DB::transaction(function () use ($valid, $currentYear, &$created) {
                    $student = Student::create([
                        'admission_number' => $valid['admission_number'],
                        'first_name' => $valid['first_name'],
                        'last_name' => $valid['last_name'],
                        'date_of_birth' => $valid['date_of_birth'] ?? null,
                        'gender' => $valid['gender'] ?? null,
                        'admission_date' => $valid['admission_date'],
                        'status' => $valid['status'] ?? 'active',
                    ]);

                    if (! empty($valid['class_name']) && $currentYear) {
                        $class = SchoolClass::where('academic_year_id', $currentYear->id)
                            ->where('name', $valid['class_name'])
                            ->first();

                        if ($class) {
                            StudentEnrolment::create([
                                'student_id' => $student->id,
                                'school_class_id' => $class->id,
                                'academic_year_id' => $currentYear->id,
                                'enrolled_at' => now(),
                            ]);
                        }
                    }

                    $created++;
                });
            } catch (\Throwable $e) {
                $errors[] = ['row' => $rowNumber, 'messages' => ['Could not create this row: '.$e->getMessage()]];
            }
        }

        fclose($handle);

        return ['created' => $created, 'errors' => $errors];
    }
}
