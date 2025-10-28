"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuthToken, removeAuthToken } from "@/lib/api/auth";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = getAuthToken();
    setIsAuthenticated(!!token);
    setIsLoading(false);
  };

  const logout = () => {
    removeAuthToken();
    setIsAuthenticated(false);
    router.push("/login");
  };

  return {
    isAuthenticated,
    isLoading,
    logout,
    checkAuth,
  };
}
