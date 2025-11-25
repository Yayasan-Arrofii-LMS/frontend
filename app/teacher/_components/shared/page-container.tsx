interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className = "" }: PageContainerProps) {
  return (
    <div className={`container mx-auto py-8 px-4 md:px-6 ${className}`}>
      {children}
    </div>
  );
}
