"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    // Just toggle theme, transition is handled by useThemeTransition hook globally
    setTheme(theme === "dark" ? "light" : "dark")
  }

  if (!mounted) {
    return (
      <div className="relative inline-flex h-10 w-[4.5rem] items-center rounded-full bg-secondary/50">
        <div className="h-8 w-8 rounded-full bg-background shadow-sm" />
      </div>
    )
  }

  const isDark = theme === "dark"

  return (
    <button
      onClick={toggleTheme}
      className="group relative inline-flex h-10 w-[4.5rem] items-center rounded-full bg-secondary/80 hover:bg-secondary transition-all duration-300 ease-in-out hover:shadow-md hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
      aria-label="Toggle theme"
    >
      {/* Track glow effect */}
      <div className="absolute inset-0 rounded-full bg-primary/5 dark:bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Sliding circle with spring animation */}
      <div
        className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background border border-border shadow-md transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isDark ? "translate-x-[2.25rem]" : "translate-x-1"
        } group-hover:shadow-lg overflow-hidden`}
      >
        {/* Sun icon - slides from right in light mode */}
        <Sun
          className={`absolute h-[1.1rem] w-[1.1rem] text-primary transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
            isDark 
              ? "-translate-x-8 scale-75 rotate-45 opacity-0" 
              : "translate-x-0 scale-100 rotate-0 opacity-100"
          }`}
        />
        
        {/* Moon icon - slides from left in dark mode */}
        <Moon
          className={`absolute h-4 w-4 text-primary transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
            isDark 
              ? "translate-x-0 scale-100 rotate-0 opacity-100" 
              : "translate-x-8 scale-75 -rotate-45 opacity-0"
          }`}
        />
      </div>

      {/* Decorative indicators with smooth fade */}
      <div className={`absolute left-2 transition-all duration-500 ${
        isDark ? "opacity-100 scale-100" : "opacity-0 scale-50"
      }`}>
        <div className="h-1 w-1 rounded-full bg-primary/40 animate-pulse" />
      </div>
      
      <div className={`absolute right-2 transition-all duration-500 ${
        !isDark ? "opacity-100 scale-100" : "opacity-0 scale-50"
      }`}>
        <div className="h-1 w-1 rounded-full bg-primary/40 animate-pulse" style={{ animationDelay: "150ms" }} />
      </div>
    </button>
  )
}
