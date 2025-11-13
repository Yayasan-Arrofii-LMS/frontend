"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuthToken, removeAuthToken } from "@/lib/api/auth";

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  profilePicture?: string | null;
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    
    // Listen for auth changes
    const handleAuthChange = () => {
      checkAuth();
    };
    
    window.addEventListener("auth-changed", handleAuthChange);
    
    return () => {
      window.removeEventListener("auth-changed", handleAuthChange);
    };
  }, []);

  const checkAuth = async () => {
    const token = getAuthToken();
    if (!token) {
      setIsAuthenticated(false);
      setIsLoading(false);
      setUser(null);
      return;
    }

    setIsAuthenticated(true);
    
    // Fetch user profile
    try {
      const response = await fetch("/api/auth/profile");
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setUser(result.data);
        }
      } else {
        // If profile API fails, still show authenticated state
        // but without user details
        console.warn("Failed to fetch profile, but token exists");
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      // Still show authenticated if token exists
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    removeAuthToken();
    setIsAuthenticated(false);
    setUser(null);
    router.push("/login");
  };

  return {
    isAuthenticated,
    isLoading,
    user,
    logout,
    checkAuth,
  };
}
