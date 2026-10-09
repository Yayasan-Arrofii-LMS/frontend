"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Workshop,
  WorkshopFormData,
  WorkshopCategory,
  WorkshopType,
} from "@/types/workshop";
import {
  getStoredWorkshops,
  getWorkshopById,
  createWorkshop as createStoredWorkshop,
  updateWorkshop as updateStoredWorkshop,
  deleteWorkshop as deleteStoredWorkshop,
  registerWorkshop as registerStoredWorkshop,
  cancelRegistration as cancelStoredRegistration,
  getMyRegistrations as getStoredMyRegistrations,
} from "@/lib/mock/workshops";

export function useWorkshops() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadWorkshops = useCallback(() => {
    try {
      setIsLoading(true);
      const data = getStoredWorkshops();
      setWorkshops(data);
    } catch (err) {
      console.error("Gagal mengambil data workshops:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWorkshops();

    const handleDataChange = () => {
      loadWorkshops();
    };

    window.addEventListener("workshop-data-changed", handleDataChange);
    return () => {
      window.removeEventListener("workshop-data-changed", handleDataChange);
    };
  }, [loadWorkshops]);

  const getWorkshop = useCallback((id: string): Workshop | null => {
    return getWorkshopById(id);
  }, []);

  const createNewWorkshop = useCallback(
    (
      formData: WorkshopFormData,
      instructor: { id: string; name: string; avatar?: string | null; bio?: string }
    ) => {
      const created = createStoredWorkshop(formData, instructor);
      loadWorkshops();
      return created;
    },
    [loadWorkshops]
  );

  const updateExistingWorkshop = useCallback(
    (id: string, formData: Partial<WorkshopFormData>) => {
      const updated = updateStoredWorkshop(id, formData);
      loadWorkshops();
      return updated;
    },
    [loadWorkshops]
  );

  const deleteExistingWorkshop = useCallback(
    (id: string) => {
      const success = deleteStoredWorkshop(id);
      loadWorkshops();
      return success;
    },
    [loadWorkshops]
  );

  const registerUserToWorkshop = useCallback(
    (
      workshopId: string,
      user: { id: string; name: string; email: string; avatar?: string | null }
    ) => {
      const result = registerStoredWorkshop(workshopId, user);
      loadWorkshops();
      return result;
    },
    [loadWorkshops]
  );

  const cancelUserRegistration = useCallback(
    (workshopId: string, userId: string) => {
      const result = cancelStoredRegistration(workshopId, userId);
      loadWorkshops();
      return result;
    },
    [loadWorkshops]
  );

  const getUserRegistrations = useCallback((userId: string) => {
    return getStoredMyRegistrations(userId);
  }, []);

  return {
    workshops,
    isLoading,
    refreshWorkshops: loadWorkshops,
    getWorkshop,
    createWorkshop: createNewWorkshop,
    updateWorkshop: updateExistingWorkshop,
    deleteWorkshop: deleteExistingWorkshop,
    registerWorkshop: registerUserToWorkshop,
    cancelRegistration: cancelUserRegistration,
    getUserRegistrations,
  };
}
