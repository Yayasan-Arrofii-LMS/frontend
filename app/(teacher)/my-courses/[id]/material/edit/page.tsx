import { EditMaterialContainer } from "../../../../_components";

export default function EditMaterialPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    sectionId: string;
    materialId: string;
    title: string;
    content: string;
    xp?: string;
    openFilesTab?: string;
  }>;
}) {
  return <EditMaterialContainer params={params} searchParams={searchParams} />;
}
