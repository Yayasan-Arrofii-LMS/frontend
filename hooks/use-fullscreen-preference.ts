"use client";

import { useState, useEffect } from "react";

type ViewMode = "modal" | "fullscreen";

const STORAGE_KEY = "material-quiz-view-preference";

export function useFullscreenPreference() {
  const [preference, setPreferenceState] = useState<ViewMode>("modal");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "fullscreen" || saved === "modal") {
      setPreferenceState(saved);
    }
  }, []);

  const setPreference = (mode: ViewMode) => {
    setPreferenceState(mode);
    localStorage.setItem(STORAGE_KEY, mode);
  };

  const togglePreference = () => {
    const newMode = preference === "modal" ? "fullscreen" : "modal";
    setPreference(newMode);
    return newMode;
  };

  return {
    preference: mounted ? preference : "modal",
    setPreference,
    togglePreference,
    isFullscreen: mounted && preference === "fullscreen",
    isModal: mounted && preference === "modal",
  };
}
