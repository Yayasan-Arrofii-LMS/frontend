import { ClassDetailContent } from "@/components/class/class-detail-content";

export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <ClassDetailContent classId={id} />
    </div>
  );
}
