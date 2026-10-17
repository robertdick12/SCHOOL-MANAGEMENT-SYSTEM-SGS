export interface AcademicYear {
  id: number
  name: string
  start_date: string
  end_date: string
  is_current: boolean
}

export interface AcademicTerm {
  id: number
  academic_year_id: number
  name: string
  start_date: string
  end_date: string
  is_current: boolean
  academic_year?: AcademicYear
}

export interface Subject {
  id: number
  name: string
  code: string
}

export interface TeacherUser {
  id: number
  name: string
  email: string
}

export interface Teacher {
  id: number
  user_id: number
  staff_number: string
  qualification: string | null
  hire_date: string | null
  status: 'active' | 'inactive'
  user?: TeacherUser
}

export interface SchoolClass {
  id: number
  name: string
  academic_year_id: number
  class_teacher_id: number | null
  capacity: number | null
  academic_year?: AcademicYear
  class_teacher?: Teacher
}

export interface StudentEnrolment {
  id: number
  student_id: number
  school_class_id: number
  academic_year_id: number
  enrolled_at: string
  status: string
  school_class?: SchoolClass
}

export interface Student {
  id: number
  user_id: number | null
  admission_number: string
  first_name: string
  last_name: string
  date_of_birth: string | null
  gender: 'male' | 'female' | null
  admission_date: string
  status: 'active' | 'graduated' | 'withdrawn'
  enrolments?: StudentEnrolment[]
  guardians?: Guardian[]
}

export interface Guardian {
  id: number
  user_id: number | null
  first_name: string
  last_name: string
  phone: string
  email: string | null
  address: string | null
  occupation: string | null
  students?: Student[]
}

export interface TeacherAssignment {
  id: number
  teacher_id: number
  school_class_id: number
  subject_id: number
  academic_term_id: number
  teacher?: Teacher
  school_class?: SchoolClass
  subject?: Subject
}

export interface TimetableEntry {
  id: number
  school_class_id: number
  subject_id: number
  teacher_id: number
  academic_term_id: number
  day_of_week: number
  start_time: string
  end_time: string
  room: string | null
  school_class?: SchoolClass
  subject?: Subject
  teacher?: Teacher
}

export interface Exam {
  id: number
  title: string
  subject_id: number
  school_class_id: number
  academic_term_id: number
  exam_date: string
  start_time: string
  end_time: string
  venue: string | null
  instructions: string | null
  is_published: boolean
  subject?: Subject
  school_class?: SchoolClass
}

export interface Assessment {
  id: number
  name: string
  type: 'exam' | 'quiz' | 'homework' | 'project' | 'other'
  subject_id: number
  school_class_id: number
  academic_term_id: number
  max_score: string
  weight: string | null
  is_published: boolean
  subject?: Subject
  school_class?: SchoolClass
}

export interface AssessmentRosterRow {
  student_id: number
  name: string
  admission_number: string
  result_id: number | null
  score: string | null
  remarks: string | null
}

export interface MyResultRow {
  id: number
  assessment: string
  type: string
  subject: string
  score: string | null
  max_score: string
  remarks: string | null
}

export interface AttendanceRosterRow {
  student_id: number
  name: string
  admission_number: string
  status: 'present' | 'absent' | 'late' | 'excused' | null
  remarks: string | null
}

export interface AttendanceRecord {
  date: string
  status: 'present' | 'absent' | 'late' | 'excused'
  remarks: string | null
}

export interface FeeStructure {
  id: number
  name: string
  fee_type: 'tuition' | 'transport' | 'other'
  school_class_id: number | null
  academic_term_id: number
  amount_pesewas: number
  description: string | null
  school_class?: SchoolClass
  academic_term?: AcademicTerm
}

export interface InvoiceItem {
  id: number
  invoice_id: number
  fee_structure_id: number | null
  description: string
  amount_pesewas: number
}

export interface Invoice {
  id: number
  invoice_number: string
  student_id: number
  academic_term_id: number
  total_amount_pesewas: number
  amount_paid_pesewas: number
  status: 'unpaid' | 'partial' | 'paid' | 'cancelled'
  due_date: string | null
  issued_at: string
  student?: Student
  academic_term?: AcademicTerm
  items?: InvoiceItem[]
}

export interface PaymentAllocation {
  id: number
  payment_id: number
  invoice_id: number
  amount_pesewas: number
  invoice?: Invoice
}

export interface Payment {
  id: number
  student_id: number
  amount_pesewas: number
  method: 'cash' | 'mobile_money' | 'bank_transfer' | 'cheque'
  provider: string | null
  status: 'pending' | 'verified' | 'failed'
  paid_at: string
  notes: string | null
  student?: Student
  allocations?: PaymentAllocation[]
}

export interface Announcement {
  id: number
  title: string
  body: string
  audience: string
  school_class_id: number | null
  published_at: string | null
  created_by: number | null
}

export interface Paginated<T> {
  data: T[]
  total: number
  per_page: number
  current_page: number
  last_page: number
}
