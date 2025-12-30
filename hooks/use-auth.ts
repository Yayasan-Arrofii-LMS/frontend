"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuthToken, removeAuthToken, getUserInfo } from "@/lib/api/auth";

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
    
    // Get user info from localStorage first
    const userInfo = getUserInfo();
    
    // Fetch user profile from API for latest role info
    try {
      const response = await fetch("/api/auth/profile");
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          // Merge localStorage user info with API response
          setUser({
            id: result.data.id || "1",
            name: userInfo?.name || result.data.name || "User",
            email: userInfo?.email || result.data.email || "",
            username: userInfo?.username || result.data.username || "",
            role: result.data.role || userInfo?.role || "Student",
            profilePicture: result.data.avatar || result.data.profilePicture || null,
          });
        }
      } else {
        // If profile API returns error (401, 500, etc.), clear token
        console.warn("Profile API failed, clearing auth token");
        removeAuthToken();
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      // Clear token on network error to prevent stuck tokens
      removeAuthToken();
      setIsAuthenticated(false);
      setUser(null);
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
