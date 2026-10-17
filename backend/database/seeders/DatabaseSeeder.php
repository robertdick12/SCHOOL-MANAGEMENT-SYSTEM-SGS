<?php

namespace Database\Seeders;

use App\Models\AcademicTerm;
use App\Models\AcademicYear;
use App\Models\Guardian;
use App\Models\School;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\StudentEnrolment;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\TeacherClassSubject;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Local development seeder only. Never run against a production database —
 * see README "Admin account setup" for the production account creation flow.
 */
class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $this->call(RoleSeeder::class);

        $devPassword = env('DEV_SEED_PASSWORD', 'Passw0rd!2026');

        $platformOwner = User::factory()->create([
            'name' => 'Platform Owner',
            'email' => 'owner@platform.test',
            'password' => Hash::make($devPassword),
        ]);
        $platformOwner->assignRole('platform_admin');

        $school = School::create([
            'name' => "Ghana Int'l Academy",
            'slug' => 'ghana-intl-academy',
            'contact_name' => 'Ama Owusu',
            'contact_email' => 'admin@school.test',
            'contact_phone' => '+233240000001',
            'status' => School::STATUS_ACTIVE,
            'approved_at' => now(),
        ]);

        // A second school stuck at "pending" so the approval flow can be
        // exercised immediately: its admin exists but is locked out until a
        // platform_admin approves it from the Platform Schools dashboard.
        School::create([
            'name' => 'Accra Demo School',
            'slug' => 'accra-demo-school',
            'contact_name' => 'Kwabena Owusu-Ansah',
            'contact_email' => 'admin@accrademo.test',
            'contact_phone' => '+233240000099',
            'status' => School::STATUS_PENDING,
        ]);
        $pendingAdmin = User::factory()->create([
            'school_id' => School::where('slug', 'accra-demo-school')->value('id'),
            'name' => 'Kwabena Owusu-Ansah',
            'email' => 'admin@accrademo.test',
            'password' => Hash::make($devPassword),
        ]);
        $pendingAdmin->assignRole('admin');

        $admin = User::factory()->create([
            'school_id' => $school->id,
            'name' => 'Ama Owusu',
            'email' => 'admin@school.test',
            'password' => Hash::make($devPassword),
        ]);
        $admin->assignRole('admin');

        $accountant = User::factory()->create([
            'school_id' => $school->id,
            'name' => 'Kofi Asante',
            'email' => 'accountant@school.test',
            'password' => Hash::make($devPassword),
        ]);
        $accountant->assignRole('accountant');

        $year = AcademicYear::create([
            'name' => '2025/2026',
            'start_date' => '2025-09-01',
            'end_date' => '2026-07-31',
            'is_current' => true,
        ]);

        $term = AcademicTerm::create([
            'academic_year_id' => $year->id,
            'name' => 'Term 1',
            'start_date' => '2025-09-01',
            'end_date' => '2025-12-12',
            'is_current' => true,
        ]);

        $mathematics = Subject::create(['name' => 'Mathematics', 'code' => 'MATH']);
        $english = Subject::create(['name' => 'English Language', 'code' => 'ENG']);

        $teacherUser = User::factory()->create([
            'school_id' => $school->id,
            'name' => 'Kwame Mensah',
            'email' => 'teacher@school.test',
            'password' => Hash::make($devPassword),
        ]);
        $teacherUser->assignRole('teacher');
        $teacher = Teacher::create([
            'user_id' => $teacherUser->id,
            'staff_number' => 'STF-0001',
            'qualification' => 'B.Ed Mathematics',
            'hire_date' => '2022-09-01',
        ]);

        $class = SchoolClass::create([
            'name' => 'JHS 1A',
            'academic_year_id' => $year->id,
            'class_teacher_id' => $teacher->id,
            'capacity' => 35,
        ]);

        foreach ([$mathematics, $english] as $subject) {
            TeacherClassSubject::create([
                'teacher_id' => $teacher->id,
                'school_class_id' => $class->id,
                'subject_id' => $subject->id,
                'academic_term_id' => $term->id,
            ]);
        }

        $studentUser = User::factory()->create([
            'school_id' => $school->id,
            'name' => 'Abena Boateng',
            'email' => 'student@school.test',
            'password' => Hash::make($devPassword),
        ]);
        $studentUser->assignRole('student');
        $student = Student::create([
            'user_id' => $studentUser->id,
            'admission_number' => 'ADM-2025-0001',
            'first_name' => 'Abena',
            'last_name' => 'Boateng',
            'date_of_birth' => '2013-04-12',
            'gender' => 'female',
            'admission_date' => '2025-09-01',
        ]);

        StudentEnrolment::create([
            'student_id' => $student->id,
            'school_class_id' => $class->id,
            'academic_year_id' => $year->id,
            'enrolled_at' => '2025-09-01',
        ]);

        $guardianUser = User::factory()->create([
            'school_id' => $school->id,
            'name' => 'Yaw Boateng',
            'email' => 'parent@school.test',
            'password' => Hash::make($devPassword),
        ]);
        $guardianUser->assignRole('parent');
        $guardian = Guardian::create([
            'user_id' => $guardianUser->id,
            'first_name' => 'Yaw',
            'last_name' => 'Boateng',
            'phone' => '+233240000000',
            'email' => 'parent@school.test',
        ]);

        $guardian->students()->attach($student->id, [
            'relationship' => 'father',
            'is_primary_contact' => true,
        ]);

        $this->command?->info("Seeded dev accounts (password: {$devPassword}):");
        $this->command?->table(['Role', 'Email', 'School', 'School status'], [
            ['platform_admin', 'owner@platform.test', '—', '—'],
            ['admin', 'admin@school.test', "Ghana Int'l Academy", 'active'],
            ['teacher', 'teacher@school.test', "Ghana Int'l Academy", 'active'],
            ['student', 'student@school.test', "Ghana Int'l Academy", 'active'],
            ['parent', 'parent@school.test', "Ghana Int'l Academy", 'active'],
            ['accountant', 'accountant@school.test', "Ghana Int'l Academy", 'active'],
            ['admin (locked out)', 'admin@accrademo.test', 'Accra Demo School', 'pending'],
        ]);
    }
}
