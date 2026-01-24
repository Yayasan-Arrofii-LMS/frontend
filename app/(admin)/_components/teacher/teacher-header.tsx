"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface TeacherHeaderProps {
  totalItems?: number;
}

export function TeacherHeader({ totalItems }: TeacherHeaderProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="px-4 lg:px-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Manajemen Guru
        </h1>
        <p className="text-muted-foreground">
          Kelola data guru dan informasi profil mereka
          {totalItems !== undefined && (
            <span className="ml-2 text-sm">
              ({totalItems} total guru)
            </span>
          )}
        </p>
        <p className="text-muted-foreground text-sm flex items-center gap-2">
          Password default: 
          <span className="font-mono">
            {showPassword ? "Password@123" : "••••••••••••"}
          </span>
          <button
            onClick={() => setShowPassword(!showPassword)}
            className="inline-flex items-center hover:text-foreground transition-colors"
            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
          >
            {showPassword ? (
              <EyeOff className="h-3.5 w-3.5" />
            ) : (
              <Eye className="h-3.5 w-3.5" />
            )}
          </button>
        </p>
      </div>
    </div>
  );
}
