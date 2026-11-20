"use client";

import { useState, useEffect, useCallback } from "react";
import { Workshop, WorkshopFormData } from "@/types/workshop";
import {
  getWorkshopsApi,
  getWorkshopByIdApi,
  createWorkshopApi,
  updateWorkshopApi,
  deleteWorkshopApi,
  registerWorkshopApi,
  cancelWorkshopRegistrationApi,
  approveWorkshopApi,
  rejectWorkshopApi,
  approveParticipantApi,
  rejectParticipantApi,
  WorkshopFilterParams,
} from "@/lib/api/workshop";
import { toast } from "sonner";

export function useWorkshops(initialFilters?: WorkshopFilterParams) {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadWorkshops = useCallback(
    async (filters?: WorkshopFilterParams) => {
      try {
        setIsLoading(true);
        const data = await getWorkshopsApi(filters || initialFilters);
        setWorkshops(Array.isArray(data) ? data : []);
      } catch (err: unknown) {
        console.error("Gagal mengambil data workshops dari backend:", err);
        setWorkshops([]);
      } finally {
        setIsLoading(false);
      }
    },
    [initialFilters]
  );

  useEffect(() => {
    loadWorkshops();
  }, [loadWorkshops]);

  const getWorkshop = useCallback(
    (id: string): Workshop | null => {
      return workshops.find((w) => String(w.id) === String(id)) || null;
    },
    [workshops]
  );

  const fetchWorkshopById = useCallback(
    async (id: string): Promise<Workshop | null> => {
      try {
        const data = await getWorkshopByIdApi(id);
        return data;
      } catch (err: unknown) {
        console.error(`Gagal mengambil detail workshop ${id}:`, err);
        return null;
      }
    },
    []
  );

  const createNewWorkshop = useCallback(
    async (
      formData: WorkshopFormData,
      _instructor?: { id: string; name: string; avatar?: string | null; bio?: string }
    ) => {
      try {
        setIsSubmitting(true);
        const created = await createWorkshopApi(formData);
        await loadWorkshops();
        return { success: true, message: "Workshop baru berhasil dibuat!", data: created };
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Gagal membuat workshop baru";
        toast.error(msg);
        return { success: false, message: msg };
      } finally {
        setIsSubmitting(false);
      }
    },
    [loadWorkshops]
  );

  const updateExistingWorkshop = useCallback(
    async (id: string, formData: Partial<WorkshopFormData>) => {
      try {
        setIsSubmitting(true);
        const updated = await updateWorkshopApi(id, formData);
        await loadWorkshops();
        return { success: true, message: "Workshop berhasil diperbarui!", data: updated };
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Gagal memperbarui workshop";
        toast.error(msg);
        return { success: false, message: msg };
      } finally {
        setIsSubmitting(false);
      }
    },
    [loadWorkshops]
  );

  const deleteExistingWorkshop = useCallback(
    async (id: string) => {
      try {
        setIsSubmitting(true);
        await deleteWorkshopApi(id);
        await loadWorkshops();
        return { success: true, message: "Workshop telah berhasil dihapus." };
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Gagal menghapus workshop";
        toast.error(msg);
        return { success: false, message: msg };
      } finally {
        setIsSubmitting(false);
      }
    },
    [loadWorkshops]
  );

  const registerUserToWorkshop = useCallback(
    async (
      workshopId: string,
      _user?: { id: string; name: string; email: string; avatar?: string | null },
      notes?: string
    ) => {
      try {
        setIsSubmitting(true);
        const updated = await registerWorkshopApi(workshopId, notes);
        await loadWorkshops();
        return {
          success: true,
          message: "Berhasil mendaftar workshop!",
          data: updated,
        };
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Gagal mendaftar workshop";
        return { success: false, message: msg };
      } finally {
        setIsSubmitting(false);
      }
    },
    [loadWorkshops]
  );

  const cancelUserRegistration = useCallback(
    async (workshopId: string, _userId?: string) => {
      try {
        setIsSubmitting(true);
        const updated = await cancelWorkshopRegistrationApi(workshopId);
        await loadWorkshops();
        return {
          success: true,
          message: "Pendaftaran workshop berhasil dibatalkan",
          data: updated,
        };
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : "Gagal membatalkan pendaftaran workshop";
        return { success: false, message: msg };
      } finally {
        setIsSubmitting(false);
      }
    },
    [loadWorkshops]
  );

  const approveWorkshop = useCallback(
    async (id: string) => {
      try {
        setIsSubmitting(true);
        const updated = await approveWorkshopApi(id);
        await loadWorkshops();
        return { success: true, message: "Workshop berhasil disetujui!", data: updated };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Gagal menyetujui workshop";
        toast.error(msg);
        return { success: false, message: msg };
      } finally {
        setIsSubmitting(false);
      }
    },
    [loadWorkshops]
  );

  const rejectWorkshop = useCallback(
    async (id: string, reason: string) => {
      try {
        setIsSubmitting(true);
        const updated = await rejectWorkshopApi(id, reason);
        await loadWorkshops();
        return { success: true, message: "Workshop telah ditolak.", data: updated };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Gagal menolak workshop";
        toast.error(msg);
        return { success: false, message: msg };
      } finally {
        setIsSubmitting(false);
      }
    },
    [loadWorkshops]
  );

  const approveParticipant = useCallback(
    async (workshopId: string, participantId: string) => {
      try {
        setIsSubmitting(true);
        const updated = await approveParticipantApi(workshopId, participantId);
        await loadWorkshops();
        return { success: true, message: "Peserta berhasil disetujui!", data: updated };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Gagal menyetujui peserta";
        toast.error(msg);
        return { success: false, message: msg };
      } finally {
        setIsSubmitting(false);
      }
    },
    [loadWorkshops]
  );

  const rejectParticipant = useCallback(
    async (workshopId: string, participantId: string, reason?: string) => {
      try {
        setIsSubmitting(true);
        const updated = await rejectParticipantApi(workshopId, participantId, reason);
        await loadWorkshops();
        return { success: true, message: "Pendaftaran peserta telah ditolak.", data: updated };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Gagal menolak peserta";
        toast.error(msg);
        return { success: false, message: msg };
      } finally {
        setIsSubmitting(false);
      }
    },
    [loadWorkshops]
  );

  return {
    workshops,
    isLoading,
    isSubmitting,
    refreshWorkshops: loadWorkshops,
    getWorkshop,
    fetchWorkshopById,
    createWorkshop: createNewWorkshop,
    updateWorkshop: updateExistingWorkshop,
    deleteWorkshop: deleteExistingWorkshop,
    approveWorkshop,
    rejectWorkshop,
    registerWorkshop: registerUserToWorkshop,
    cancelRegistration: cancelUserRegistration,
    approveParticipant,
    rejectParticipant,
  };
}
