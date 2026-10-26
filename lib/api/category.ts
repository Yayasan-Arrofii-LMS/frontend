import { Category } from "@/types/category";
import { authenticatedFetch } from "./client";

export async function fetchCategories(): Promise<Category[]> {
  try {
    const result = await authenticatedFetch<Category[]>("/categories", {
      method: "GET",
      cache: "no-store",
    });

    return result.data || [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}