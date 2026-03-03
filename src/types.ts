export interface User {
  id: string;
  username: string;
  batch: string;
  department?: string;
  student_id?: string;
  role: 'admin' | 'student';
}

export interface Test {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  target_batch: string;
  is_published: number;
  negative_marks: number;
  created_at: string;
}

export interface Option {
  id: string;
  question_id: string;
  option_text: string;
  option_index: number;
}

export interface Question {
  id: string;
  test_id: string;
  question_text: string;
  image_url?: string;
  correct_option_index: number;
  options: Option[];
}

export interface QuestionBank {
  id: string;
  title: string;
  created_at: string;
}

export interface BankQuestion {
  id: string;
  bank_id: string;
  question_text: string;
  image_url?: string;
  correct_option_index: number;
  options: Option[];
}

export interface Result {
  id: string;
  test_id: string;
  test_title: string;
  student_name: string;
  student_id: string;
  score: number;
  total_questions: number;
  responses?: string; // JSON string of student answers
  completed_at: string;
}
