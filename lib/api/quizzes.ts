import {
  Quiz,
  Question,
  QuizAttempt,
  StudentAnswer,
  QuizResponse,
  QuizzesResponse,
  QuestionResponse,
  QuestionsResponse,
  QuizAttemptResponse,
  QuizAttemptsResponse,
  StudentAnswerResponse,
  CreateQuizInput,
  UpdateQuizInput,
  CreateQuestionInput,
  UpdateQuestionInput,
  StartQuizAttemptInput,
  SaveAnswerInput,
  SubmitQuizInput,
} from "@/types/section";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

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
    return response.data;
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    throw error;
  }
}

/**
 * Fetch a single quiz by ID
 */
export async function fetchQuiz(
  sectionId: number,
  quizId: number
): Promise<Quiz> {
  try {
    const response = await apiCall<QuizResponse>(
      `/classes/sections/${sectionId}/quizzes/${quizId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching quiz:", error);
    throw error;
  }
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
    console.log(
      `Calling PATCH /classes/sections/${sectionId}/quizzes/${quizId}`
    );
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
 * Fetch all questions for a quiz
 * Questions are included in the quiz response
 */
export async function fetchQuestions(
  sectionId: number,
  quizId: number
): Promise<Question[]> {
  try {
    // Fetch the quiz which includes questions
    const quiz = await fetchQuiz(sectionId, quizId);
    console.log("Fetched quiz with questions:", quiz);
    
    // Backend uses snake_case (quiz_question), frontend expects PascalCase (Question)
    const questions = quiz.Question || quiz.quiz_question || [];
    console.log("Questions array:", questions);
    
    // Normalize answer field names
    const normalizedQuestions = questions.map(q => ({
      ...q,
      Answer: q.Answer || q.quiz_answer || []
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
 */
export async function startQuizAttempt(
  sectionId: number,
  data: StartQuizAttemptInput
): Promise<QuizAttempt> {
  try {
    const response = await apiCall<QuizAttemptResponse>(
      `/classes/sections/${sectionId}/quizzes/attempts`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error starting quiz attempt:", error);
    throw error;
  }
}

/**
 * Save/auto-save a student answer
 */
export async function saveAnswer(
  sectionId: number,
  data: SaveAnswerInput
): Promise<StudentAnswer> {
  try {
    const response = await apiCall<StudentAnswerResponse>(
      `/classes/sections/${sectionId}/quizzes/answers`,
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
 */
export async function submitQuiz(
  sectionId: number,
  data: SubmitQuizInput
): Promise<QuizAttempt> {
  try {
    const response = await apiCall<QuizAttemptResponse>(
      `/classes/sections/${sectionId}/quizzes/attempts/submit`,
      {
        method: "POST",
        body: JSON.stringify(data),
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
 */
export async function getAttemptResult(
  sectionId: number,
  attemptId: number
): Promise<QuizAttempt> {
  try {
    const response = await apiCall<QuizAttemptResponse>(
      `/classes/sections/${sectionId}/quizzes/attempts/${attemptId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting attempt result:", error);
    throw error;
  }
}

/**
 * Get all quiz attempts for a student (current user)
 */
export async function getMyQuizAttempts(
  sectionId: number,
  quizId: number
): Promise<QuizAttempt[]> {
  try {
    const response = await apiCall<QuizAttemptsResponse>(
      `/classes/sections/${sectionId}/quizzes/${quizId}/my-attempts`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting quiz attempts:", error);
    throw error;
  }
}

/**
 * Get all attempts for a quiz (Teacher/Admin view)
 */
export async function getAllQuizAttempts(
  sectionId: number,
  quizId: number
): Promise<QuizAttempt[]> {
  try {
    const response = await apiCall<QuizAttemptsResponse>(
      `/classes/sections/${sectionId}/quizzes/${quizId}/attempts`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting all quiz attempts:", error);
    throw error;
  }
}
