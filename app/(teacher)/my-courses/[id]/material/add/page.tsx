import { AddMaterialContainer } from "../../../../_components";

export default function AddMaterialPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sectionId: string }>;
}) {
  return <AddMaterialContainer params={params} searchParams={searchParams} />;
}
