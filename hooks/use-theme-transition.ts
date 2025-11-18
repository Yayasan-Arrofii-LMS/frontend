"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

/**
 * Hook to apply smooth transitions when theme changes
 * Only applies transition after initial mount (user interactions, not page loads)
 */
export function useThemeTransition() {
  const { resolvedTheme } = useTheme();
  const previousTheme = useRef<string | undefined>(undefined);
  const hasHydrated = useRef(false);

  useEffect(() => {
    // Wait for hydration to complete
    if (!hasHydrated.current) {
      hasHydrated.current = true;
      previousTheme.current = resolvedTheme;
      return;
    }

    // Only apply transition if theme actually changed after hydration
    if (previousTheme.current && previousTheme.current !== resolvedTheme) {
      const root = document.documentElement;
      
      // Add transition class
      root.classList.add("theme-transition");

      // Remove transition class after animation completes
      const timer = setTimeout(() => {
        root.classList.remove("theme-transition");
      }, 500);

      // Update previous theme
      previousTheme.current = resolvedTheme;

      return () => clearTimeout(timer);
    }

    previousTheme.current = resolvedTheme;
  }, [resolvedTheme]);
}
