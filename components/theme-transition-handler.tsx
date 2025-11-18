"use client";

import { useThemeTransition } from "@/hooks/use-theme-transition";

/**
 * Component that handles smooth theme transitions globally
 * Place this at the root of your app to enable transitions for all theme changes
 */
export function ThemeTransitionHandler() {
  useThemeTransition();
  return null;
}
