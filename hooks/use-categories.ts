"use client";

import { useState, useEffect, useCallback } from "react";
import { Category } from "@/types/category";
import { fetchCategories } from "@/lib/api/category";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const data = await fetchCategories();
    setCategories(data);
    setIsLoading(false);
    return data;
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function init() {
      setIsLoading(true);
      const data = await fetchCategories();
      if (isMounted) {
        setCategories(data);
        setIsLoading(false);
      }
    }
    init();
    return () => {
      isMounted = false;
    };
  }, []);

  const addCategory = useCallback((newCategory: Category) => {
    setCategories((prev) => {
      if (
        prev.some(
          (c) =>
            c.id === newCategory.id ||
            c.name.toLowerCase() === newCategory.name.toLowerCase()
        )
      ) {
        return prev;
      }
      return [...prev, newCategory];
    });
  }, []);

  return { categories, setCategories, isLoading, refetch: load, addCategory };
}
