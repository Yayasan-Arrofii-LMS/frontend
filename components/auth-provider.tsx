"use client";

import { useEffect, useRef } from "react";
import { getAuthToken, removeAuthToken } from "@/lib/api/auth";

/**
 * AuthProvider component that validates the auth token on initial page load.
 * If the token is invalid or expired, it will be automatically removed to prevent bugs.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const hasChecked = useRef(false);

  useEffect(() => {
    // Ensure this only runs once on mount
    if (hasChecked.current) return;
    hasChecked.current = true;

    const validateToken = async () => {
      const token = getAuthToken();
      
      // If no token exists, nothing to validate
      if (!token) return;

      try {
        // Call the profile API to validate the token
        const response = await fetch("/api/auth/profile");
        
        // If the response is not ok (401, 500, etc.), remove the token
        if (!response.ok) {
          console.warn("Token validation failed, clearing auth token");
          removeAuthToken();
          
          // Reload the page to reset the app state
          window.location.reload();
          return;
        }

        const result = await response.json();
        
        // Check if the API returned an error
        if (!result.success) {
          console.warn("Token validation failed:", result.message);
          removeAuthToken();
          
          // Reload the page to reset the app state
          window.location.reload();
        }
      } catch (error) {
        // If there's a network error or other issue, clear the token to be safe
        console.error("Error validating token:", error);
        removeAuthToken();
        
        // Reload the page to reset the app state
        window.location.reload();
      }
    };

    validateToken();
  }, []);

  return <>{children}</>;
}
