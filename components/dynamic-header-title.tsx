"use client"

import { usePathname } from "next/navigation"
import { useMemo } from "react"

const pageTitles: Record<string, string> = {
  "/dashboard": "Dasbor",
  "/teacher": "Guru",
  "/class": "Kelas",
}

export function DynamicHeaderTitle() {
  const pathname = usePathname()

  const title = useMemo(() => {
    return pageTitles[pathname] ?? "Documents"
  }, [pathname])

  return <h1 className="text-base font-medium">{title}</h1>
}
