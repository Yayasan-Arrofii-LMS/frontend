interface AuthLayoutProps {
  children: React.ReactNode;
  maxWidth?: "xs" | "sm" | "md";
}

const widthClasses = {
  xs: "max-w-xs",
  sm: "max-w-sm",
  md: "max-w-md",
};

export function AuthLayout({ children, maxWidth = "sm" }: AuthLayoutProps) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className={`w-full ${widthClasses[maxWidth]}`}>
        {children}
      </div>
    </div>
  );
}
