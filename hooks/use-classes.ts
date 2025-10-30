import { useState, useEffect, useCallback } from "react";
import { Class } from "@/types/class";
import { fetchClasses, deleteClass } from "@/lib/api/classes";
import { toast } from "sonner";

interface ClassMeta {
  itemCount: number;
  totalItems: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

interface UseClassesReturn {
  classes: Class[];
  meta: ClassMeta | null;
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  searchValue: string;
  debouncedSearch: string;
  isDeletingClass: boolean;
  setCurrentPage: (page: number) => void;
  setSearchValue: (search: string) => void;
  handlePageChange: (page: number) => void;
  handleSearchChange: (search: string) => void;
  loadClasses: () => Promise<void>;
  handleDeleteClass: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useClasses(): UseClassesReturn {
  const [classes, setClasses] = useState<Class[]>([]);
  const [meta, setMeta] = useState<ClassMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingClass, setIsDeletingClass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search value
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue);
    }, 600);

    return () => clearTimeout(timer);
  }, [searchValue]);

  // Load classes whenever page or search changes
  const loadClasses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await fetchClasses(currentPage, debouncedSearch);

      setClasses(result.classes);
      setMeta(result.meta);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Gagal memuat data kelas";
      setError(errorMessage);
      toast.error("Gagal memuat data kelas");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearch]);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleSearchChange = useCallback((search: string) => {
    setSearchValue(search);
    setCurrentPage(1); // Reset to first page on search
  }, []);

  const handleDeleteClass = useCallback(async (id: string) => {
    setIsDeletingClass(true);
    try {
      await deleteClass(id);
      toast.success("Kelas berhasil dihapus");
      await loadClasses();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Gagal menghapus kelas";
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsDeletingClass(false);
    }
  }, [loadClasses]);

  const refetch = useCallback(async () => {
    await loadClasses();
  }, [loadClasses]);

  return {
    classes,
    meta,
    isLoading,
    error,
    currentPage,
    searchValue,
    debouncedSearch,
    isDeletingClass,
    setCurrentPage,
    setSearchValue,
    handlePageChange,
    handleSearchChange,
    loadClasses,
    handleDeleteClass,
    refetch,
  };
}
