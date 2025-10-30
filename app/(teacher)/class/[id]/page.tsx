import { ClassDetailContent } from "@/components/class/class-detail-content";

export default function ClassDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <ClassDetailContent classId={params.id} />
    </div>
  );
}
