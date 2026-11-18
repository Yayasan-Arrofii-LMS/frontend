"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { toast } from "sonner";
import { fetchMyClasses, type EnrolledClass } from "@/lib/api/enrollment";
import {
  fetchRecommendations,
  fetchRecommendationOverview,
  fetchRecommendationHistory,
  submitRecommendationFeedback,
  fetchUserInterests,
  updateUserInterests,
  completeMaterial,
  fetchCategoriesList,
} from "@/lib/api/recommendation";
import {
  RecommendedMaterial,
  RecommendationType,
  FeedbackType,
  InteractionStatus,
  RecommendationActivityStats,
  RecommendationHistoryItem,
  RemedialItem,
  AdvancedLearningItem,
  BackendCategoryItem,
  BackendUserInterest,
} from "@/types/recommendation";

export function useRecommendations(isAuthenticated: boolean) {
  // State data utama dari Backend
  const [classes, setClasses] = useState<EnrolledClass[]>([]);
  const [materials, setMaterials] = useState<RecommendedMaterial[]>([]);
  const [historyItems, setHistoryItems] = useState<RecommendationHistoryItem[]>([]);
  const [categories, setCategories] = useState<BackendCategoryItem[]>([]);
  const [userInterests, setUserInterests] = useState<BackendUserInterest[]>([]);

  // Spotlight sections
  const [remedialData, setRemedialData] = useState<RemedialItem | null>(null);
  const [advancedData, setAdvancedData] = useState<AdvancedLearningItem | null>(null);

  // Stats
  const [stats, setStats] = useState<RecommendationActivityStats>({
    totalRecommended: 0,
    openedCount: 0,
    completedCount: 0,
    feedbackCount: 0,
    isAdaptiveActive: false,
  });

  // State feedback & status interaksi lokal (untuk respons instan UI)
  const [feedbacks, setFeedbacks] = useState<Record<string, FeedbackType>>({});
  const [interactionStatuses, setInteractionStatuses] = useState<
    Record<string, InteractionStatus>
  >({});

  // Loading & error states
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active Filter untuk materi
  const [activeFilter, setActiveFilter] = useState<"Semua" | RecommendationType>("Semua");
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const activeFilterRef = useRef<"Semua" | RecommendationType>(activeFilter);

  useEffect(() => {
    activeFilterRef.current = activeFilter;
  }, [activeFilter]);

  // Ekstrak nama minat yang dipilih
  const selectedInterestNames = useMemo(() => {
    return userInterests.map((ui) => ui.category.name);
  }, [userInterests]);

  /**
   * Load semua data murni dari Backend API
   */
  const loadData = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setIsError(false);
      setErrorMessage(null);

      // Jalankan pemanggilan data backend secara paralel
      const [
        enrolledClassesRes,
        overviewRes,
        materialsRes,
        historyRes,
        categoriesRes,
        interestsRes,
      ] = await Promise.allSettled([
        fetchMyClasses(),
        fetchRecommendationOverview(),
        fetchRecommendations(activeFilterRef.current),
        fetchRecommendationHistory(),
        fetchCategoriesList(),
        fetchUserInterests(),
      ]);

      // 1. Classes
      if (enrolledClassesRes.status === "fulfilled") {
        setClasses(enrolledClassesRes.value);
      } else {
        console.error("Failed to load enrolled classes:", enrolledClassesRes.reason);
      }

      // 2. Categories
      if (categoriesRes.status === "fulfilled") {
        setCategories(categoriesRes.value);
      }

      // 3. User Interests
      if (interestsRes.status === "fulfilled") {
        setUserInterests(interestsRes.value);
      }

      // 4. Recommendations List
      if (materialsRes.status === "fulfilled") {
        setMaterials(materialsRes.value);

        // Inisialisasi status & feedback dari respons API
        const newFeedbacks: Record<string, FeedbackType> = {};
        const newStatuses: Record<string, InteractionStatus> = {};

        materialsRes.value.forEach((m) => {
          if (m.progressPercentage !== undefined && m.progressPercentage >= 100) {
            newStatuses[m.id] = "Selesai";
          } else if (m.progressPercentage !== undefined && m.progressPercentage > 0) {
            newStatuses[m.id] = "Dipelajari";
          }
        });

        setFeedbacks((prev) => ({ ...newFeedbacks, ...prev }));
        setInteractionStatuses((prev) => ({ ...newStatuses, ...prev }));
      }

      // 5. Overview (Stats & Spotlights)
      if (overviewRes.status === "fulfilled") {
        const { stats: beStats, remedialSpotlight, progressionSpotlight } =
          overviewRes.value;

        setStats(beStats);
        setRemedialData(remedialSpotlight);
        setAdvancedData(progressionSpotlight);
      }

      // 6. History
      if (historyRes.status === "fulfilled") {
        setHistoryItems(historyRes.value.items);

        // Sinkronkan feedback dari history
        const historyFeedbacks: Record<string, FeedbackType> = {};
        const historyStatuses: Record<string, InteractionStatus> = {};

        historyRes.value.items.forEach((item) => {
          if (item.feedback) {
            historyFeedbacks[item.materialId] = item.feedback;
          }
          if (item.interactionStatus) {
            historyStatuses[item.materialId] = item.interactionStatus;
          }
        });

        setFeedbacks((prev) => ({ ...historyFeedbacks, ...prev }));
        setInteractionStatuses((prev) => ({ ...historyStatuses, ...prev }));
      }
    } catch (err) {
      console.error("Error loading recommendations:", err);
      setIsError(true);
      setErrorMessage(
        err instanceof Error ? err.message : "Gagal memuat data pembelajaran"
      );
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * Refetch saat active filter berganti (hanya update rekomendasi tanpa reload seluruh halaman)
   */
  const handleFilterChange = async (filter: "Semua" | RecommendationType) => {
    if (filter === activeFilter) return;
    setActiveFilter(filter);
    setIsFilterLoading(true);
    try {
      const filtered = await fetchRecommendations(filter);
      setMaterials(filtered);
    } catch (err) {
      console.error("Filter change error:", err);
    } finally {
      setIsFilterLoading(false);
    }
  };

  /**
   * Simpan Minat Belajar Siswa
   * Jika array kosong (Reset), kelola di state lokal dan ingatkan siswa
   */
  const handleSaveInterests = async (newCategoryNames: string[]) => {
    if (newCategoryNames.length === 0) {
      // Backend validasi mensyaratkan min 1 kategori. Tangani di state lokal
      setUserInterests([]);
      toast.info("Minat belajar telah di-reset.", {
        description:
          "Pilih minimal 1 topik minat agar preferensimu tersimpan permanen di cloud.",
      });
      return;
    }

    // Cari ID kategori dari daftar categories backend
    const selectedIds: number[] = [];
    newCategoryNames.forEach((name) => {
      const match = categories.find(
        (c) => c.name.toLowerCase() === name.toLowerCase()
      );
      if (match) selectedIds.push(match.id);
    });

    if (selectedIds.length === 0) {
      toast.error("Kategori yang dipilih tidak valid.");
      return;
    }

    try {
      const updated = await updateUserInterests(selectedIds);
      setUserInterests(updated);

      toast.success("Minat belajar berhasil disimpan!", {
        description: `${selectedIds.length} topik minat tersimpan. Rekomendasi materi diperbarui.`,
      });

      // Refetch rekomendasi materi sesuai preferensi baru
      const refreshedMaterials = await fetchRecommendations(activeFilter);
      setMaterials(refreshedMaterials);
    } catch (err) {
      console.error("Failed to save interests:", err);
      toast.error("Gagal menyimpan minat belajar ke server.");
    }
  };

  /**
   * Berikan Feedback Rekomendasi (Relevan / Kurang / Tidak Tertarik)
   */
  const handleFeedbackChange = async (
    materialIdStr: string,
    feedback: FeedbackType
  ) => {
    const isTogglingOff = feedbacks[materialIdStr] === feedback;
    const newFeedback = isTogglingOff ? undefined : feedback;

    // Optimistic UI Update
    setFeedbacks((prev) => {
      const next = { ...prev };
      if (newFeedback) {
        next[materialIdStr] = newFeedback;
      } else {
        delete next[materialIdStr];
      }
      return next;
    });

    // Cari target material numeric ID
    const targetMaterial = materials.find((m) => m.id === materialIdStr);
    const numericId =
      targetMaterial?.materialNumericId ||
      parseInt(materialIdStr.replace("rec-", ""), 10);

    if (!isNaN(numericId) && numericId > 0) {
      try {
        await submitRecommendationFeedback(numericId, newFeedback || null);
      } catch (err) {
        console.warn("Feedback API call failed (might not be enrolled):", err);
      }
    }

    // Update history locally
    setHistoryItems((prev) => {
      const existingIdx = prev.findIndex((h) => h.materialId === materialIdStr);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          feedback: newFeedback,
        };
        return updated;
      } else {
        return [
          {
            id: `hist-${Date.now()}`,
            materialId: materialIdStr,
            materialTitle: targetMaterial?.title || "Materi Pembelajaran",
            date: "Hari ini",
            recommendationType:
              targetMaterial?.recommendationType || "Berdasarkan Minat",
            reason: targetMaterial?.reason || "Direkomendasikan untukmu.",
            interactionStatus:
              interactionStatuses[materialIdStr] || "Belum Dibuka",
            feedback: newFeedback,
          },
          ...prev,
        ];
      }
    });

    if (newFeedback) {
      toast.success(`Feedback disimpan: "${newFeedback}"`, {
        description: `Terima kasih atas masukanmu untuk "${targetMaterial?.title}".`,
      });
    } else {
      toast.info("Feedback dibatalkan.");
    }
  };

  /**
   * Lihat / Buka Materi
   */
  const handleViewMaterial = (material: RecommendedMaterial) => {
    const currentStatus = interactionStatuses[material.id] || "Belum Dibuka";
    if (currentStatus === "Belum Dibuka") {
      setInteractionStatuses((prev) => ({
        ...prev,
        [material.id]: "Dibuka",
      }));

      // Update riwayat lokal
      setHistoryItems((prev) => {
        const existingIdx = prev.findIndex((h) => h.materialId === material.id);
        if (existingIdx >= 0) {
          const updated = [...prev];
          if (updated[existingIdx].interactionStatus === "Belum Dibuka") {
            updated[existingIdx] = {
              ...updated[existingIdx],
              interactionStatus: "Dibuka",
            };
          }
          return updated;
        } else {
          return [
            {
              id: `hist-${Date.now()}`,
              materialId: material.id,
              materialTitle: material.title,
              date: "Hari ini",
              recommendationType: material.recommendationType,
              reason: material.reason,
              interactionStatus: "Dibuka",
              feedback: feedbacks[material.id],
            },
            ...prev,
          ];
        }
      });
    }
  };

  /**
   * Tandai Materi Selesai / Dituntaskan
   */
  const handleMarkCompleted = async (materialIdStr: string) => {
    // Optimistic UI update
    setInteractionStatuses((prev) => ({
      ...prev,
      [materialIdStr]: "Selesai",
    }));

    const targetMaterial = materials.find((m) => m.id === materialIdStr);
    const numericId =
      targetMaterial?.materialNumericId ||
      parseInt(materialIdStr.replace("rec-", ""), 10);

    if (!isNaN(numericId) && numericId > 0) {
      try {
        const result = await completeMaterial(numericId);
        toast.success("Materi berhasil diselesaikan!", {
          description: `Selamat! Kamu mendapatkan +${result.xpEarned} XP.`,
        });

        // Refetch stats agar metrik overview terupdate
        const overview = await fetchRecommendationOverview();
        setStats(overview.stats);
      } catch (err) {
        console.warn("Complete material API failed (using local progression):", err);
        toast.success(`Selamat! Progres "${targetMaterial?.title}" telah diperbarui.`);
      }
    } else {
      toast.success(`Selamat! Progres "${targetMaterial?.title}" telah diperbarui.`);
    }

    // Update history locally
    setHistoryItems((prev) => {
      const existingIdx = prev.findIndex((h) => h.materialId === materialIdStr);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          interactionStatus: "Selesai",
        };
        return updated;
      } else {
        return [
          {
            id: `hist-${Date.now()}`,
            materialId: materialIdStr,
            materialTitle: targetMaterial?.title || "Materi Pembelajaran",
            date: "Hari ini",
            recommendationType:
              targetMaterial?.recommendationType || "Berdasarkan Minat",
            reason: targetMaterial?.reason || "Direkomendasikan untukmu.",
            interactionStatus: "Selesai",
            feedback: feedbacks[materialIdStr],
          },
          ...prev,
        ];
      }
    });
  };

  return {
    classes,
    materials,
    historyItems,
    categories,
    selectedInterestNames,
    remedialData,
    advancedData,
    stats,
    feedbacks,
    interactionStatuses,
    isLoading,
    isFilterLoading,
    isError,
    errorMessage,
    activeFilter,
    handleFilterChange,
    handleSaveInterests,
    handleFeedbackChange,
    handleViewMaterial,
    handleMarkCompleted,
    refetch: loadData,
  };
}
