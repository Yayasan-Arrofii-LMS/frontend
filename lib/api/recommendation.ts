import { authenticatedFetch } from "./client";
import {
  RecommendationType,
  FeedbackType,
  InteractionStatus,
  RecommendedMaterial,
  RemedialItem,
  AdvancedLearningItem,
  RecommendationHistoryItem,
  RecommendationActivityStats,
  BackendRecommendationReason,
  BackendLearningStatus,
  BackendFeedbackValue,
  BackendRecommendationItem,
  BackendRecommendationOverviewResponse,
  BackendRecommendationHistoryItem,
  BackendUserInterest,
  BackendCategoryItem,
  BackendMaterialCompleteResponse,
} from "@/types/recommendation";
import { normalizeImageUrl } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Enum & Value Mappers (Frontend <-> Backend)
// ---------------------------------------------------------------------------

export function mapFeedbackToBackend(
  feedback: FeedbackType | null | undefined
): BackendFeedbackValue | null {
  if (!feedback) return null;
  switch (feedback) {
    case "Relevan":
      return "relevant";
    case "Kurang relevan":
      return "neutral";
    case "Tidak tertarik":
      return "not_relevant";
    default:
      return null;
  }
}

export function mapFeedbackToFrontend(
  feedback: BackendFeedbackValue | null | undefined
): FeedbackType | undefined {
  if (!feedback) return undefined;
  switch (feedback) {
    case "relevant":
      return "Relevan";
    case "neutral":
      return "Kurang relevan";
    case "not_relevant":
      return "Tidak tertarik";
    default:
      return undefined;
  }
}

export function mapReasonToBackend(
  type: RecommendationType | "Semua" | undefined
): BackendRecommendationReason | undefined {
  if (!type || type === "Semua") return undefined;
  switch (type) {
    case "Berdasarkan Minat":
      return "minat";
    case "Berdasarkan Progres":
      return "progres";
    case "Remedial":
      return "remedial";
    case "Materi Lanjutan":
      return "lanjutan";
    default:
      return undefined;
  }
}

export function mapReasonToFrontend(
  reason: BackendRecommendationReason
): RecommendationType {
  switch (reason) {
    case "minat":
      return "Berdasarkan Minat";
    case "progres":
      return "Berdasarkan Progres";
    case "remedial":
      return "Remedial";
    case "lanjutan":
      return "Materi Lanjutan";
    default:
      return "Berdasarkan Minat";
  }
}

export function mapStatusToFrontend(
  status: BackendLearningStatus
): InteractionStatus {
  switch (status) {
    case "completed":
      return "Selesai";
    case "in_progress":
      return "Dipelajari";
    case "opened":
      return "Dibuka";
    case "not_opened":
    default:
      return "Belum Dibuka";
  }
}

// ---------------------------------------------------------------------------
// Material Item Transformer
// ---------------------------------------------------------------------------

export function transformBackendRecommendationItem(
  item: BackendRecommendationItem
): RecommendedMaterial {
  const categoryName =
    item.material.category?.name ||
    item.material.Section.className ||
    item.material.Section.title ||
    "Sains Alam";

  const resolvedThumb = item.thumbnailUrl
    ? normalizeImageUrl(item.thumbnailUrl)
    : "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80";

  return {
    id: `rec-${item.material.id}`,
    materialNumericId: item.material.id,
    classId: item.material.Section?.classId,
    sectionId: item.material.sectionId,
    title: item.material.title,
    category: categoryName,
    mediaType: item.material.mediaType || "Video",
    durationMinutes: item.estimatedMinutes || item.material.durationMinutes || 10,
    description:
      item.excerpt ||
      `Materi pembelajaran topik ${item.material.Section.title}.`,
    difficulty: (item.material.difficulty as any) || "Pemula",
    thumbnail: resolvedThumb,
    recommendationType: mapReasonToFrontend(item.primaryReason),
    reason: item.reasonText,
    detailedReason: {
      overview: item.whyDetail || item.reasonText,
      targetCompetency:
        item.evaluationContext?.targetCompetency ||
        `Penguasaan materi pada bab ${item.material.Section.title}`,
      learningPathMatch: `Bagian dari silabus ${
        item.material.Section.className || "Kelas"
      } - Bab ${item.material.Section.title}`,
      interestRelevance: `Kecocokan skor algoritma ${item.score}% terhadap profil belajarmu.`,
    },
    progressPercentage: item.progressPercent,
    contentPreview: {
      summary: item.excerpt,
      keyPoints: [
        `Konsep esensial pada bab ${item.material.Section.title}`,
        `Durasi estimasi pembelajaran ${item.estimatedMinutes || 10} menit`,
        `Tingkat pemahaman: ${item.material.difficulty || "Standar"}`,
      ],
      practicalExercise: `Pelajari materi "${item.material.title}" dan diskusikan poin utamanya dalam kegiatan belajar kelas.`,
    },
  };
}

// ---------------------------------------------------------------------------
// API Methods
// ---------------------------------------------------------------------------

/**
 * GET /recommendations?type=&search=&limit=
 */
export async function fetchRecommendations(
  type?: RecommendationType | "Semua",
  search?: string,
  limit: number = 20
): Promise<RecommendedMaterial[]> {
  const params = new URLSearchParams();
  const backendType = mapReasonToBackend(type);
  if (backendType) params.append("type", backendType);
  if (search && search.trim().length > 0) params.append("search", search.trim());
  params.append("limit", limit.toString());

  const queryString = params.toString();
  const endpoint = `/recommendations${queryString ? `?${queryString}` : ""}`;

  const response = await authenticatedFetch<BackendRecommendationItem[]>(
    endpoint,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!response.success || !Array.isArray(response.data)) {
    return [];
  }

  return response.data.map(transformBackendRecommendationItem);
}

/**
 * GET /recommendations/overview
 */
export async function fetchRecommendationOverview(): Promise<{
  stats: RecommendationActivityStats;
  remedialSpotlight: RemedialItem | null;
  progressionSpotlight: AdvancedLearningItem | null;
  rawOverview: BackendRecommendationOverviewResponse;
}> {
  const response =
    await authenticatedFetch<BackendRecommendationOverviewResponse>(
      "/recommendations/overview",
      {
        method: "GET",
        cache: "no-store",
      }
    );

  const defaultStats: RecommendationActivityStats = {
    totalRecommended: 0,
    openedCount: 0,
    completedCount: 0,
    feedbackCount: 0,
    isAdaptiveActive: false,
  };

  if (!response.success || !response.data) {
    return {
      stats: defaultStats,
      remedialSpotlight: null,
      progressionSpotlight: null,
      rawOverview: {
        stats: {
          totalRecommended: 0,
          totalOpened: 0,
          totalCompleted: 0,
          completionRate: 0,
          totalFeedback: 0,
          isAdaptiveActive: false,
        },
        remedialSpotlight: null,
        progressionSpotlight: null,
      },
    };
  }

  const data = response.data;

  const stats: RecommendationActivityStats = {
    totalRecommended: data.stats.totalRecommended,
    openedCount: data.stats.totalOpened,
    completedCount: data.stats.totalCompleted,
    feedbackCount: data.stats.totalFeedback,
    isAdaptiveActive: data.stats.isAdaptiveActive,
  };

  let remedialSpotlight: RemedialItem | null = null;
  if (data.remedialSpotlight) {
    const rem = data.remedialSpotlight;
    remedialSpotlight = {
      id: `rem-${rem.material.id}`,
      materialNumericId: rem.material.id,
      classId: rem.material.classId,
      sectionId: rem.material.sectionId,
      competency: rem.targetCompetency,
      currentScore: rem.currentScore,
      targetScore: rem.passingGrade,
      materialTitle: rem.material.title,
      category: rem.category?.name || "Sains Alam",
      mediaType: rem.material.mediaType || "Video",
      durationMinutes: rem.material.estimatedMinutes || 10,
      reason: rem.reasonText,
      description: rem.material.excerpt,
      actionText: "Pelajari Kembali",
      recommendedMaterialId: `rec-${rem.material.id}`,
    };
  }

  let progressionSpotlight: AdvancedLearningItem | null = null;
  if (data.progressionSpotlight) {
    const prog = data.progressionSpotlight;
    progressionSpotlight = {
      id: `adv-${prog.nextMaterial.id}`,
      materialNumericId: prog.nextMaterial.id,
      classId: prog.nextMaterial.classId,
      sectionId: prog.nextMaterial.sectionId,
      previousMaterial: prog.prerequisite.materialTitle,
      competencyAchieved: `${prog.prerequisite.competencyTitle} (Skor: ${
        prog.prerequisite.score ?? 100
      })`,
      nextMaterialTitle: prog.nextMaterial.title,
      prerequisites: `Telah menuntaskan ${prog.prerequisite.sectionTitle}`,
      accessStatus: "Siap Dipelajari",
      category: prog.nextMaterial.category?.name || "Sains Alam",
      mediaType: prog.nextMaterial.mediaType || "Materi Interaktif",
      durationMinutes: prog.nextMaterial.estimatedMinutes || 15,
      description: prog.narrativeText || prog.nextMaterial.excerpt,
      recommendedMaterialId: `rec-${prog.nextMaterial.id}`,
    };
  }

  return {
    stats,
    remedialSpotlight,
    progressionSpotlight,
    rawOverview: data,
  };
}

/**
 * GET /recommendations/history?type=&search=&page=&limit=
 */
export async function fetchRecommendationHistory(params?: {
  type?: RecommendationType | "Semua";
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{
  items: RecommendationHistoryItem[];
  meta: {
    totalItems: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}> {
  const qParams = new URLSearchParams();
  const backendType = mapReasonToBackend(params?.type);
  if (backendType) qParams.append("type", backendType);
  if (params?.search && params.search.trim().length > 0)
    qParams.append("search", params.search.trim());
  if (params?.page) qParams.append("page", params.page.toString());
  if (params?.limit) qParams.append("limit", params.limit.toString());

  const queryString = qParams.toString();
  const endpoint = `/recommendations/history${
    queryString ? `?${queryString}` : ""
  }`;

  const response = await authenticatedFetch<BackendRecommendationHistoryItem[]>(
    endpoint,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  const fallbackMeta = {
    totalItems: 0,
    itemsPerPage: params?.limit || 10,
    totalPages: 1,
    currentPage: params?.page || 1,
  };

  if (!response.success || !Array.isArray(response.data)) {
    return { items: [], meta: fallbackMeta };
  }

  const items: RecommendationHistoryItem[] = response.data.map((h) => {
    const dateFormatted = h.firstRecommendedAt
      ? new Date(h.firstRecommendedAt).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "Hari ini";

    return {
      id: `hist-${h.id}`,
      materialId: `rec-${h.materialId}`,
      materialNumericId: h.materialId,
      classId: h.material.Section?.classId,
      sectionId: h.material.Section?.id,
      materialTitle: h.material.title,
      date: dateFormatted,
      recommendationType: mapReasonToFrontend(h.primaryReason),
      reason: h.reasonText,
      interactionStatus: mapStatusToFrontend(h.learningStatus),
      feedback: mapFeedbackToFrontend(h.feedback),
    };
  });

  const meta = (response.meta as typeof fallbackMeta) || {
    ...fallbackMeta,
    totalItems: items.length,
  };

  return { items, meta };
}

/**
 * POST /recommendations/:materialId/feedback
 */
export async function submitRecommendationFeedback(
  materialId: number,
  feedback: FeedbackType | null
): Promise<void> {
  const backendValue = mapFeedbackToBackend(feedback);
  await authenticatedFetch(`/recommendations/${materialId}/feedback`, {
    method: "POST",
    body: JSON.stringify({ feedback: backendValue }),
  });
}

/**
 * GET /profile/interests
 */
export async function fetchUserInterests(): Promise<BackendUserInterest[]> {
  const response = await authenticatedFetch<BackendUserInterest[]>(
    "/profile/interests",
    {
      method: "GET",
      cache: "no-store",
    }
  );

  return response.success && Array.isArray(response.data) ? response.data : [];
}

/**
 * PUT /profile/interests
 */
export async function updateUserInterests(
  categoryIds: number[]
): Promise<BackendUserInterest[]> {
  const response = await authenticatedFetch<BackendUserInterest[]>(
    "/profile/interests",
    {
      method: "PUT",
      body: JSON.stringify({ categoryIds }),
    }
  );

  if (!response.success) {
    throw new Error(response.message || "Gagal memperbarui minat belajar");
  }

  return response.data || [];
}

/**
 * POST /materials/:materialId/complete
 */
export async function completeMaterial(
  materialId: number
): Promise<BackendMaterialCompleteResponse> {
  const response =
    await authenticatedFetch<BackendMaterialCompleteResponse>(
      `/materials/${materialId}/complete`,
      {
        method: "POST",
      }
    );

  if (!response.success || !response.data) {
    throw new Error(response.message || "Gagal menyelesaikan materi");
  }

  return response.data;
}

/**
 * GET /categories
 */
export async function fetchCategoriesList(): Promise<BackendCategoryItem[]> {
  const response = await authenticatedFetch<BackendCategoryItem[]>(
    "/categories",
    {
      method: "GET",
      cache: "no-store",
    }
  );

  return response.success && Array.isArray(response.data) ? response.data : [];
}
