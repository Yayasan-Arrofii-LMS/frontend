export type InterestTopic =
  | "Sains Alam"
  | "Pertanian"
  | "Lingkungan"
  | "Keterampilan Hidup"
  | "Kewirausahaan"
  | "Budaya"
  | (string & {});

export type MediaType =
  | "Video"
  | "Artikel"
  | "Materi Interaktif"
  | "Modul Praktik"
  | (string & {});

export type DifficultyLevel = "Pemula" | "Menengah" | "Mahir" | (string & {});

export type RecommendationType =
  | "Berdasarkan Minat"
  | "Berdasarkan Progres"
  | "Remedial"
  | "Materi Lanjutan";

export type FeedbackType = "Relevan" | "Kurang relevan" | "Tidak tertarik";

export type InteractionStatus =
  | "Belum Dibuka"
  | "Dibuka"
  | "Dipelajari"
  | "Selesai";

export interface DetailedReason {
  overview: string;
  targetCompetency: string;
  learningPathMatch: string;
  interestRelevance: string;
}

export interface RecommendedMaterial {
  id: string;
  materialNumericId?: number;
  classId?: number;
  sectionId?: number;
  title: string;
  category: InterestTopic;
  mediaType: MediaType;
  durationMinutes: number;
  description: string;
  difficulty: DifficultyLevel;
  thumbnail: string;
  recommendationType: RecommendationType;
  reason: string;
  detailedReason: DetailedReason;
  progressPercentage?: number;
  contentPreview?: {
    summary: string;
    keyPoints: string[];
    practicalExercise: string;
  };
}

export interface RemedialItem {
  id: string;
  competency: string;
  currentScore: number;
  targetScore: number;
  materialTitle: string;
  category: InterestTopic;
  mediaType: MediaType;
  durationMinutes: number;
  reason: string;
  description: string;
  actionText: string;
  recommendedMaterialId: string;
  materialNumericId?: number;
  classId?: number;
  sectionId?: number;
}

export interface AdvancedLearningItem {
  id: string;
  previousMaterial: string;
  competencyAchieved: string;
  nextMaterialTitle: string;
  prerequisites: string;
  accessStatus: "Tersedia" | "Siap Dipelajari" | "Terkunci";
  category: InterestTopic;
  mediaType: MediaType;
  durationMinutes: number;
  description: string;
  recommendedMaterialId: string;
  materialNumericId?: number;
  classId?: number;
  sectionId?: number;
}

export interface RecommendationHistoryItem {
  id: string;
  materialId: string;
  materialNumericId?: number;
  classId?: number;
  sectionId?: number;
  materialTitle: string;
  date: string;
  recommendationType: RecommendationType;
  reason: string;
  interactionStatus: InteractionStatus;
  feedback?: FeedbackType;
}

export interface RecommendationActivityStats {
  totalRecommended: number;
  openedCount: number;
  completedCount: number;
  feedbackCount: number;
  isAdaptiveActive?: boolean;
}

// -------------------------------------------------------------
// Backend API Contracts & Response Types (Strict, No Any)
// -------------------------------------------------------------

export type BackendRecommendationReason =
  | "remedial"
  | "minat"
  | "progres"
  | "lanjutan";

export type BackendLearningStatus =
  | "not_opened"
  | "opened"
  | "in_progress"
  | "completed";

export type BackendFeedbackValue = "relevant" | "neutral" | "not_relevant";

export interface BackendMaterialCategory {
  id: number;
  name: string;
}

export interface BackendSectionInfo {
  id: number;
  title: string;
  classId: number;
  className?: string;
}

export interface BackendEvaluationContext {
  quizId: number;
  quizTitle: string;
  targetCompetency: string;
  currentScore: number;
  passingGrade: number;
  isPassed: boolean;
  abilityLevel: string;
}

export interface BackendRecommendationItem {
  material: {
    id: number;
    title: string;
    difficulty: string | null;
    mediaType: string | null;
    durationMinutes: number;
    categoryId: number | null;
    sectionId: number;
    category: BackendMaterialCategory | null;
    Section: BackendSectionInfo;
  };
  reasons: BackendRecommendationReason[];
  primaryReason: BackendRecommendationReason;
  reasonText: string;
  whyDetail: string;
  score: number;
  excerpt: string;
  estimatedMinutes: number;
  thumbnailUrl: string | null;
  learningStatus: BackendLearningStatus;
  progressPercent: number;
  feedback: BackendFeedbackValue | null;
  evaluationContext: BackendEvaluationContext | null;
}

export interface BackendRecommendationOverviewResponse {
  stats: {
    totalRecommended: number;
    totalOpened: number;
    totalCompleted: number;
    completionRate: number;
    totalFeedback: number;
    isAdaptiveActive: boolean;
  };
  remedialSpotlight: {
    targetCompetency: string;
    quizId: number;
    quizTitle: string;
    category: BackendMaterialCategory | null;
    currentScore: number;
    passingGrade: number;
    abilityLevel: string;
    reasonText: string;
    material: {
      id: number;
      title: string;
      excerpt: string;
      estimatedMinutes: number;
      mediaType: string | null;
      difficulty: string | null;
      thumbnailUrl: string | null;
      sectionId: number;
      classId: number;
    };
  } | null;
  progressionSpotlight: {
    prerequisite: {
      materialId: number | null;
      materialTitle: string;
      sectionId: number;
      sectionTitle: string;
      competencyTitle: string;
      score: number | null;
      passingGrade: number | null;
      isQuizPassed: boolean;
    };
    nextMaterial: {
      id: number;
      title: string;
      excerpt: string;
      estimatedMinutes: number;
      mediaType: string | null;
      difficulty: string | null;
      thumbnailUrl: string | null;
      category: BackendMaterialCategory | null;
      sectionId: number;
      sectionTitle: string;
      classId: number;
    };
    narrativeText: string;
  } | null;
}

export interface BackendRecommendationHistoryItem {
  id: number;
  materialId: number;
  recommendedAt: string;
  firstRecommendedAt: string;
  primaryReason: BackendRecommendationReason;
  reasons: BackendRecommendationReason[];
  reasonText: string;
  learningStatus: BackendLearningStatus;
  progressPercent: number;
  feedback: BackendFeedbackValue | null;
  feedbackAt: string | null;
  material: {
    id: number;
    title: string;
    excerpt: string;
    estimatedMinutes: number;
    difficulty: string | null;
    mediaType: string | null;
    thumbnailUrl: string | null;
    category: BackendMaterialCategory | null;
    Section: BackendSectionInfo;
  };
}

export interface BackendUserInterest {
  id: number;
  userId: string;
  categoryId: number;
  createdAt: string;
  category: {
    id: number;
    name: string;
  };
}

export interface BackendCategoryItem {
  id: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    materials?: number;
    classes?: number;
    interests?: number;
  };
}

export interface BackendMaterialCompleteResponse {
  materialId: number;
  sectionId: number;
  isCompleted: boolean;
  xpEarned: number;
  sectionProgressPercent: number;
}
