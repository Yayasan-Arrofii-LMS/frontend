import {
  Quiz,
  Question,
  QuizAttempt,
  AttemptAnswer,
  QuizResponse,
  QuizzesResponse,
  QuestionResponse,
  QuestionsResponse,
  QuizAttemptResponse,
  QuizAttemptsResponse,
  SaveAnswerResponse,
  SavedAnswersResponse,
  SavedAnswersData,
  CreateQuizInput,
  UpdateQuizInput,
  CreateQuestionInput,
  UpdateQuestionInput,
  SaveAnswerInput,
} from "@/types/section";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api/v1";

// Helper function to get auth token
function getAuthToken(): string {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token") || "";
  }
  return "";
}

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`API Call: ${options.method || "GET"} ${url}`);

  const response = await fetch(url, {
    ...options,
    headers,
  });

  console.log(`Response status: ${response.status}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("API Error response:", errorText);

    let error;
    try {
      error = JSON.parse(errorText);
    } catch {
      error = { message: errorText || "An error occurred" };
    }

    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// ============================================
// QUIZ CRUD OPERATIONS (Teacher/Admin)
// ============================================

/**
 * Fetch all quizzes for a section
 */
export async function fetchQuizzes(sectionId: number): Promise<Quiz[]> {
  try {
    const response = await apiCall<QuizzesResponse>(
      `/classes/sections/${sectionId}/quizzes`
    );
    
    // Transform API response from snake_case to camelCase
    const quizzes = response.data.map((quiz: any) => {
      const transformed: Quiz = {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        max_attempts: quiz.max_attempts,
        time_limit: quiz.time_limit,
        open_at: quiz.open_at,
        close_at: quiz.close_at,
        passing_grade: quiz.passing_grade,
        xp: quiz.xp,
        sectionId: quiz.sectionId,
        createdAt: quiz.createdAt,
        updatedAt: quiz.updatedAt,
      };

      // Transform quiz_question to Question if present
      if (quiz.quiz_question && Array.isArray(quiz.quiz_question)) {
        transformed.Question = quiz.quiz_question.map((q: any) => ({
          id: q.id,
          question: q.question,
          type: q.type,
          points: q.points,
          quizId: q.quizId,
          createdAt: q.createdAt,
          updatedAt: q.updatedAt,
          explanation: q.explanation,
          // Transform quiz_answer to Answer
          Answer: q.quiz_answer?.map((a: any) => ({
            id: a.id,
            answer: a.answer,
            is_correct: a.is_correct,
            questionId: a.questionId,
            createdAt: a.createdAt,
            updatedAt: a.updatedAt,
          })) || [],
        }));
      }

      return transformed;
    });

    return quizzes;
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    throw error;
  }
}

/**
 * Fetch a single quiz by ID with questions and answers
 * GET /classes/sections/:sectionId/quizzes/:id
 */
export async function fetchQuizDetail(
  sectionId: number,
  quizId: number
): Promise<Quiz> {
  try {
    const response = await apiCall<QuizResponse>(
      `/classes/sections/${sectionId}/quizzes/${quizId}`
    );
    
    const quiz = response.data as any;
    const transformed: Quiz = {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      max_attempts: quiz.max_attempts,
      time_limit: quiz.time_limit,
      open_at: quiz.open_at,
      close_at: quiz.close_at,
      passing_grade: quiz.passing_grade,
      xp: quiz.xp,
      sectionId: quiz.sectionId,
      createdAt: quiz.createdAt,
      updatedAt: quiz.updatedAt,
    };

    // Transform quiz_question to Question if present
    if (quiz.quiz_question && Array.isArray(quiz.quiz_question)) {
      transformed.Question = quiz.quiz_question.map((q: any) => ({
        id: q.id,
        question: q.question,
        type: q.type,
        points: q.points,
        quizId: q.quizId,
        createdAt: q.createdAt,
        updatedAt: q.updatedAt,
        explanation: q.explanation,
        // Transform quiz_answer to Answer
        Answer: q.quiz_answer?.map((a: any) => ({
          id: a.id,
          answer: a.answer,
          is_correct: a.is_correct,
          questionId: a.questionId,
          createdAt: a.createdAt,
          updatedAt: a.updatedAt,
        })) || [],
      }));
    }

    return transformed;
  } catch (error) {
    console.error("Error fetching quiz detail:", error);
    throw error;
  }
}

/**
 * @deprecated Use fetchQuizDetail instead
 */
export async function fetchQuiz(): Promise<Quiz> {
  throw new Error(
    "fetchQuiz endpoint not available. Use fetchQuizDetail with sectionId and quizId."
  );
}

/**
 * Create a new quiz
 */
export async function createQuiz(
  sectionId: number,
  data: CreateQuizInput
): Promise<Quiz> {
  try {
    const response = await apiCall<QuizResponse>(
      `/classes/sections/${sectionId}/quizzes`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating quiz:", error);
    throw error;
  }
}

/**
 * Update an existing quiz
 */
export async function updateQuiz(
  sectionId: number,
  quizId: number,
  data: UpdateQuizInput
): Promise<Quiz> {
  try {
    console.log(`Calling PATCH /sections/${sectionId}/quizzes/${quizId}`);
    console.log("Update data:", data);

    const response = await apiCall<QuizResponse>(
      `/classes/sections/${sectionId}/quizzes/${quizId}`,
      {
        method: "PUT", // Changed from PATCH to PUT
        body: JSON.stringify(data),
      }
    );

    console.log("Update quiz response:", response);
    return response.data;
  } catch (error) {
    console.error("Error updating quiz:", error);
    throw error;
  }
}

/**
 * Delete a quiz
 */
export async function deleteQuiz(
  sectionId: number,
  quizId: number
): Promise<void> {
  try {
    await apiCall<{ success: boolean; message: string }>(
      `/classes/sections/${sectionId}/quizzes/${quizId}`,
      {
        method: "DELETE",
      }
    );
  } catch (error) {
    console.error("Error deleting quiz:", error);
    throw error;
  }
}

// ============================================
// QUESTION CRUD OPERATIONS (Teacher/Admin)
// ============================================

/**
 * Fetch all questions for a quiz (with answers - for teachers/admin)
 * This is used by the manage questions modal
 */
export async function fetchQuestions(
  sectionId: number,
  quizId: number
): Promise<Question[]> {
  try {
    // Use the proper getQuizQuestions endpoint
    const questions = await getQuizQuestions(sectionId, quizId);
    console.log("Fetched questions:", questions);

    // Normalize answer field names if needed
    const normalizedQuestions = questions.map((q) => ({
      ...q,
      Answer: q.Answer || q.quiz_answer || [],
    }));

    return normalizedQuestions;
  } catch (error) {
    console.error("Error fetching questions:", error);
    throw error;
  }
}

/**
 * Fetch a single question by ID
 */
export async function fetchQuestion(
  sectionId: number,
  quizId: number,
  questionId: number
): Promise<Question> {
  try {
    const response = await apiCall<QuestionResponse>(
      `/classes/sections/${sectionId}/quizzes/${quizId}/questions/${questionId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching question:", error);
    throw error;
  }
}

/**
 * Create a new question for a quiz
 */
export async function createQuestion(
  sectionId: number,
  quizId: number,
  data: CreateQuestionInput
): Promise<Question> {
  try {
    const response = await apiCall<QuestionResponse>(
      `/classes/sections/${sectionId}/quizzes/${quizId}/questions`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating question:", error);
    throw error;
  }
}

/**
 * Update an existing question
 */
export async function updateQuestion(
  sectionId: number,
  questionId: number,
  data: UpdateQuestionInput
): Promise<Question> {
  try {
    const response = await apiCall<QuestionResponse>(
      `/classes/sections/${sectionId}/quizzes/questions/${questionId}`,
      {
        method: "PUT", // Changed from PATCH to PUT
        body: JSON.stringify(data),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating question:", error);
    throw error;
  }
}

/**
 * Delete a question
 */
export async function deleteQuestion(
  sectionId: number,
  questionId: number
): Promise<void> {
  try {
    await apiCall<{ success: boolean; message: string }>(
      `/classes/sections/${sectionId}/quizzes/questions/${questionId}`,
      {
        method: "DELETE",
      }
    );
  } catch (error) {
    console.error("Error deleting question:", error);
    throw error;
  }
}

// ============================================
// STUDENT QUIZ OPERATIONS
// ============================================

/**
 * Start a new quiz attempt
 * POST /sections/:sectionId/quizzes/:quizId/start
 */
export async function startQuiz(
  sectionId: number,
  quizId: number
): Promise<QuizAttempt> {
  try {
    const response = await apiCall<QuizAttemptResponse>(
      `/classes/sections/${sectionId}/quizzes/${quizId}/start`,
      {
        method: "POST",
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error starting quiz:", error);
    throw error;
  }
}

/**
 * Save a student answer (auto-save)
 * POST /sections/:sectionId/quizzes/save-answer
 */
export async function saveAnswer(
  sectionId: number,
  data: SaveAnswerInput
): Promise<AttemptAnswer> {
  try {
    const response = await apiCall<SaveAnswerResponse>(
      `/classes/sections/${sectionId}/quizzes/save-answer`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error saving answer:", error);
    throw error;
  }
}

/**
 * Submit quiz attempt (final submission)
 * POST /sections/:sectionId/quizzes/submit
 */
export async function submitQuiz(
  sectionId: number,
  attemptId: number
): Promise<QuizAttempt> {
  try {
    const response = await apiCall<QuizAttemptResponse>(
      `/classes/sections/${sectionId}/quizzes/submit`,
      {
        method: "POST",
        body: JSON.stringify({ attemptId }),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error submitting quiz:", error);
    throw error;
  }
}

/**
 * Get quiz attempt result/details
 * GET /sections/:sectionId/quizzes/attempts/:attemptId/result
 */
export async function getQuizResult(
  sectionId: number,
  attemptId: number
): Promise<QuizAttempt> {
  try {
    const response = await apiCall<QuizAttemptResponse>(
      `/classes/sections/${sectionId}/quizzes/attempts/${attemptId}/result`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting quiz result:", error);
    throw error;
  }
}

/**
 * Get all my quiz attempts
 * GET /sections/:sectionId/quizzes/my-attempts/:quizId
 */
export async function getMyAttempts(
  sectionId: number,
  quizId: number
): Promise<{ attempts: QuizAttempt[]; meta?: Record<string, unknown> }> {
  try {
    const response = await apiCall<QuizAttemptsResponse>(
      `/classes/sections/${sectionId}/quizzes/my-attempts/${quizId}`
    );
    return {
      attempts: response.data,
      meta: response.meta,
    };
  } catch (error) {
    console.error("Error getting my attempts:", error);
    throw error;
  }
}

/**
 * Get all saved answers for an attempt
 * GET /sections/:sectionId/quizzes/attempts/:attemptId/questions
 */
export async function getSavedAnswers(
  sectionId: number,
  attemptId: number
): Promise<SavedAnswersData> {
  try {
    const response = await apiCall<SavedAnswersResponse>(
      `/classes/sections/${sectionId}/quizzes/attempts/${attemptId}/questions`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting saved answers:", error);
    throw error;
  }
}

/**
 * Get all questions for a quiz (with answers for teachers)
 * GET /sections/:sectionId/quizzes/:quizId/questions
 */
export async function getQuizQuestions(
  sectionId: number,
  quizId: number
): Promise<Question[]> {
  try {
    const response = await apiCall<QuestionsResponse>(
      `/classes/sections/${sectionId}/quizzes/${quizId}/questions`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting quiz questions:", error);
    throw error;
  }
}

/**
 * Get a single question by ID
 * GET /sections/:sectionId/quizzes/questions/:questionId
 */
export async function getQuestionById(
  sectionId: number,
  questionId: number
): Promise<Question> {
  try {
    const response = await apiCall<QuestionResponse>(
      `/classes/sections/${sectionId}/quizzes/questions/${questionId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting question:", error);
    throw error;
  }
}
