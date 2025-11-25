"use client";

import { ClassDetailContent } from "@/components/class/class-detail-content";

interface ClassDetailContainerProps {
  classId: string;
}

export function ClassDetailContainer({ classId }: ClassDetailContainerProps) {
  return <ClassDetailContent classId={classId} basePath="/teacher/my-courses" />;
}
