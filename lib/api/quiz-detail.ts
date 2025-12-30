// API functions for quiz detail

export interface QuizAttemptSummary {
  id: number;
  score: number;
  is_graded: boolean;
  started_at: string;
  submitted_at: string | null;
  percentage?: number;
  isPassed?: boolean;
}

export interface QuizDetail {
  id: number;
  title: string;
  description: string;
  max_attempts: number;
  time_limit: number;
  passing_grade: number;
  xp: number;
  sectionId: number;
  createdAt: string;
  totalQuestions: number;
  attemptsUsed: number;
  attemptsRemaining: number;
  bestScore: number | null;
  attempts: QuizAttemptSummary[];
  ongoingAttempt: QuizAttemptSummary | null;
}

export interface QuizDetailResponse {
  success: boolean;
  message: string;
  data: QuizDetail;
}

/**
 * Fetch quiz detail with attempts info
 */
export async function fetchQuizDetail(
  sectionId: number,
  quizId: number
): Promise<QuizDetail> {
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api/v1";

  // Get auth token from localStorage
  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : "";

  const response = await fetch(
    `${API_BASE_URL}/classes/sections/${sectionId}/quizzes/detail/${quizId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      credentials: "include",
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch quiz detail: ${response.status}`);
  }

  const result: QuizDetailResponse = await response.json();

  if (!result.success) {
    throw new Error(result.message || "Failed to fetch quiz detail");
  }

  return result.data;
}
