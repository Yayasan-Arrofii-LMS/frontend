"use client";

import { useState, useEffect } from "react";
import { Category } from "@/types/category";
import { fetchCategories } from "@/lib/api/category";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setIsLoading(true);
      const data = await fetchCategories();
      if (isMounted) {
        setCategories(data);
        setIsLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return { categories, isLoading };
}
