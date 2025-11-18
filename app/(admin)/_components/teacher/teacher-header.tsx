interface TeacherHeaderProps {
  totalItems?: number;
}

export function TeacherHeader({ totalItems }: TeacherHeaderProps) {
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
      </div>
    </div>
  );
}
