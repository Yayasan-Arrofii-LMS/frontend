// === Quiz Types ===

// Answer from API
export interface Answer {
  id: number;
  answer: string;
  is_correct: boolean;
  questionId: number;
  createdAt: string;
  updatedAt: string;
}

// Question from API
export interface Question {
  id: number;
  question: string;
  type: "MultipleChoice" | "TrueFalse" | "Essay";
  points: number;
  quizId: number;
  createdAt: string;
  updatedAt: string;
  Answer: Answer[];
  quiz_answer?: Answer[]; // Backend uses snake_case
}

// Quiz Summary (used in Section list)
export interface QuizSummary {
  id: number;
  title: string;
  description: string;
  close_at: string;
  open_at: string;
}

// Quiz from API (full details)
export interface Quiz {
  id: number;
  title: string;
  description: string;
  max_attempts: number;
  time_limit: number;
  open_at: string;
  close_at: string;
  passing_grade: number;
  xp: number;
  sectionId: number;
  createdAt: string;
  updatedAt: string;
  Question?: Question[];
  quiz_question?: Question[]; // Backend uses snake_case
}

// Student Answer from API
export interface StudentAnswer {
  id: number;
  attemptId: number;
  questionId: number;
  answer?: string;
  filePath?: string;
  createdAt: string;
  updatedAt: string;
  StudentAnswer_SelectedAnswer: { answerId: number }[];
}

// Quiz Attempt from API
export interface QuizAttempt {
  id: number;
  studentId: number;
  quizId: number;
  started_at: string;
  submitted_at?: string;
  score?: number;
  status: "in_progress" | "submitted" | "graded";
  createdAt: string;
  updatedAt: string;
  StudentAnswer: StudentAnswer[];
}

// === Material Types ===

// Material File from API
export interface MaterialFile {
  id: number;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
  createdAt: string;
  updatedAt: string;
}

// Material from API
export interface Material {
  id: number;
  title: string;
  content: string;
  xp?: number;
  sectionId: number;
  createdAt: string;
  updatedAt: string;
  Material_File: MaterialFile[];
}

// Section from API
export interface Section {
  id: number;
  title: string;
  description: string | null;
  video_link?: string;
  order: number;
  Material: Material[];
  Assignment: unknown[]; // For future use
  Quiz: QuizSummary[];
}

// API Response types
export interface SectionsResponse {
  success: boolean;
  message: string;
  data: Section[];
}

export interface SectionResponse {
  success: boolean;
  message: string;
  data: Section;
}

export interface MaterialResponse {
  success: boolean;
  message: string;
  data: Material;
}

export interface MaterialsResponse {
  success: boolean;
  message: string;
  data: Material[];
}

// Input types for creating/updating
export interface CreateSectionInput {
  title: string;
  description?: string | null;
  order?: number;
}

export interface UpdateSectionInput {
  title?: string;
  description?: string | null;
  order?: number;
}

export interface CreateMaterialInput {
  title: string;
  content: string;
  xp?: number;
  order?: number;
}

export interface UpdateMaterialInput {
  title?: string;
  content?: string;
  xp?: number;
  order?: number;
}

// === Quiz Input Types ===

// Quiz Create/Update
export interface CreateQuizInput {
  title: string;
  description: string;
  max_attempts: number;
  time_limit: number;
  open_at: string;
  close_at: string;
  passing_grade: number;
  xp?: number;
}

export interface UpdateQuizInput {
  title?: string;
  description?: string;
  max_attempts?: number;
  time_limit?: number;
  open_at?: string;
  close_at?: string;
  passing_grade?: number;
  xp?: number;
}

// Question Create/Update
export interface CreateAnswerInput {
  answer: string;
  is_correct: boolean;
}

export interface CreateQuestionInput {
  question: string;
  type: "MultipleChoice" | "TrueFalse" | "Essay";
  points: number;
  answers?: CreateAnswerInput[];
}

export interface UpdateQuestionInput {
  question?: string;
  type?: "MultipleChoice" | "TrueFalse" | "Essay";
  points?: number;
  answers?: CreateAnswerInput[];
}

// Student Quiz Attempt
export interface StartQuizAttemptInput {
  quizId: number;
}

export interface SaveAnswerInput {
  attemptId: number;
  questionId: number;
  answer?: string;
  filePath?: string;
  selectedAnswerIds?: number[];
}

export interface SubmitQuizInput {
  attemptId: number;
}

// === Quiz API Response Types ===

export interface QuizResponse {
  success: boolean;
  message: string;
  data: Quiz;
}

export interface QuizzesResponse {
  success: boolean;
  message: string;
  data: Quiz[];
}

export interface QuestionResponse {
  success: boolean;
  message: string;
  data: Question;
}

export interface QuestionsResponse {
  success: boolean;
  message: string;
  data: Question[];
}

export interface QuizAttemptResponse {
  success: boolean;
  message: string;
  data: QuizAttempt;
}

export interface QuizAttemptsResponse {
  success: boolean;
  message: string;
  data: QuizAttempt[];
}

export interface StudentAnswerResponse {
  success: boolean;
  message: string;
  data: StudentAnswer;
}

// Class from API
export interface Class {
  id: number;
  name: string;
  description: string;
  image_path: string;
  image_path_relative: string;
  students: unknown[];
}

// API Response for class
export interface ClassResponse {
  success: boolean;
  message: string;
  data: Class;
}

// For displaying in UI (might not need separate interface)
export interface ClassDetail {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  teacherId: string;
  teacherName: string;
  studentCount: number;
  sections: Section[];
  createdAt: string;
  updatedAt: string;
}
