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
  explanation?: string | null;
  instructions?: string | null;
  rubric?: string | null;
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
  _count?: {
    quiz_attempt: number;
  };
}

// Multiple Choice Answer from API
export interface MultipleChoiceAnswer {
  id: number;
  answer: string;
  is_correct: boolean;
  createdAt: string;
  updatedAt: string;
  questionId: number;
}

// Attempt Multiple Answer (selected answers)
export interface AttemptMultipleAnswer {
  id: number;
  createdAt: string;
  updatedAt: string;
  attempt_answerId: number;
  answerId: number;
  quiz_answer: MultipleChoiceAnswer;
}

// Student Answer from API (attempt_answer)
export interface AttemptAnswer {
  id: number;
  path: string | null;
  answer: string | null;
  score?: number | null;
  feedback?: string | null;
  graded_at?: string | null;
  createdAt: string;
  updatedAt: string;
  attemptId: number;
  questionId: number;
  quiz_question: Question;
  attemp_multiple_answer: AttemptMultipleAnswer[];
}

// Quiz Attempt from API
export interface QuizAttempt {
  id: number;
  attemptId?: number;
  score: number | null;
  mcq_score?: number | null;
  final_score?: number | null;
  mcqScore?: number | null;
  finalScore?: number | null;
  started_at: string;
  submitted_at: string | null;
  is_graded: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  quizId: number;
  quiz?: Quiz;
  attemp_answer: AttemptAnswer[];
  totalScore?: number;
  percentage?: number;
  isPassed?: boolean;
  hasEssay?: boolean;
  gradingStatus?: "Menunggu Penilaian" | "Sedang Dinilai" | "Penilaian Selesai" | string;
  totalEarnedPoints?: number;
  totalMaxPoints?: number;
}

// Saved Answer Format (for getSavedAnswers)
export interface SavedAnswerQuestion {
  id: number;
  question: string;
  type: "MultipleChoice" | "TrueFalse" | "Essay";
  points: number;
  instructions?: string | null;
  rubric?: string | null;
  answers: {
    id: number;
    answer: string;
  }[];
  savedAnswer: {
    answer: string;
    selectedAnswerIds: number[];
  } | null;
}

// Get Saved Answers Response
export interface SavedAnswersData {
  attemptId: number;
  quizId: number;
  quizTitle: string;
  timeLimit: number;
  startedAt: string;
  submittedAt: string | null;
  questions: SavedAnswerQuestion[];
}

// === Material Types ===

// Material File from API
export interface MaterialFile {
  id: number;
  title: string;
  url: string;
  materialId: number;
  createdAt: string;
  updatedAt: string;
  // Legacy fields (optional for backward compatibility)
  filename?: string;
  size?: number;
  mimeType?: string;
}

// Material from API
export interface Material {
  id: number;
  title: string;
  content: string;
  xp?: number;
  video_link?: string;
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
  video_link?: string;
  order?: number;
}

export interface UpdateMaterialInput {
  title?: string;
  content?: string;
  xp?: number;
  video_link?: string;
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

// Quiz Bulk Create (dengan pertanyaan sekaligus)
export interface BulkCreateQuizInput {
  title: string;
  description: string;
  max_attempts: number;
  time_limit: number;
  open_at: string;
  close_at: string;
  passing_grade: number;
  xp?: number;
  questions: CreateQuestionInput[];
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
  instructions?: string;
  rubric?: string;
  answers?: CreateAnswerInput[];
}

export interface UpdateQuestionInput {
  question?: string;
  type?: "MultipleChoice" | "TrueFalse" | "Essay";
  points?: number;
  instructions?: string;
  rubric?: string;
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
  meta?: {
    totalItems: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface SaveAnswerResponse {
  success: boolean;
  message: string;
  data: AttemptAnswer;
}

export interface SavedAnswersResponse {
  success: boolean;
  message: string;
  data: SavedAnswersData;
}

// Teacher from API
export interface Teacher {
  id: string;
  name: string;
  email: string;
}

// Student from API
export interface Student {
  id: string;
  name: string;
  email: string;
  username: string;
  profileImage: string;
}

// Class from API
export interface Class {
  id: number;
  name: string;
  description: string;
  image_path: string;
  image_path_relative: string;
  categoryId?: number | null;
  category?: { id: number; name: string } | string | null;
  registrationType?: "AUTO" | "MANUAL";
  teachers: Teacher[];
  students: Student[];
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
  categoryId?: number | null;
  category?: { id: number; name: string } | string | null;
  registrationType?: "AUTO" | "MANUAL";
  approvalStatus?: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason?: string | null;
  approvedById?: string | null;
  approvedAt?: string | null;
  approver?: { id: string; name: string } | null;
  sections: Section[];
  students: Student[];
  createdAt: string;
  updatedAt: string;
}

// === Teacher Grading Interfaces ===

export interface QuizSubmissionItem {
  attemptId: number;
  quizId: number;
  quizTitle: string;
  passingGrade: number;
  user: {
    id: string;
    name: string;
    email: string;
    profileImage?: string | null;
  };
  startedAt: string;
  submittedAt: string | null;
  isGraded: boolean;
  score: number | null;
  mcqScore: number | null;
  finalScore: number | null;
  totalQuestions: number;
  essayCount: number;
  ungradedEssayCount: number;
  gradingStatus: "Menunggu Penilaian" | "Sedang Dinilai" | "Penilaian Selesai";
}

export interface GradingQuestionDetail {
  answerId: number;
  questionId: number;
  question: string;
  type: "MultipleChoice" | "TrueFalse" | "Essay";
  maxPoints: number;
  instructions: string | null;
  rubric: string | null;
  studentAnswer: string | null;
  score: number | null;
  feedback: string | null;
  gradedAt: string | null;
  isCorrect?: boolean | null;
  selectedAnswers?: {
    id: number;
    answer: string;
    isCorrect: boolean;
  }[];
  allChoices?: {
    id: number;
    answer: string;
    isCorrect: boolean;
  }[];
}

export interface QuizAttemptGradingDetail {
  attemptId: number;
  quizId: number;
  quizTitle: string;
  passingGrade: number;
  user: {
    id: string;
    name: string;
    email: string;
    profileImage?: string | null;
  };
  startedAt: string;
  submittedAt: string | null;
  isGraded: boolean;
  score: number | null;
  mcqScore: number | null;
  finalScore: number | null;
  totalEarnedPoints: number;
  totalMaxPoints: number;
  percentage: number | null;
  gradingStatus: "Menunggu Penilaian" | "Sedang Dinilai" | "Penilaian Selesai";
  questions: GradingQuestionDetail[];
}

export interface GradeEssayItemInput {
  questionId: number;
  score: number;
  feedback?: string;
}

export interface GradeEssayAttemptInput {
  grades: GradeEssayItemInput[];
}

export interface QuizSubmissionsResponse {
  success: boolean;
  message: string;
  data: QuizSubmissionItem[];
}

export interface QuizAttemptGradingResponse {
  success: boolean;
  message: string;
  data: QuizAttemptGradingDetail;
}
