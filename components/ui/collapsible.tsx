"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

const CollapsibleContext = React.createContext<{
  open: boolean;
  onOpenChange?: (open: boolean) => void;
}>({ open: false });

interface CollapsibleProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
}

const Collapsible = React.forwardRef<HTMLDivElement, CollapsibleProps>(
  ({ children, open: controlledOpen, onOpenChange, defaultOpen = false, ...props }, ref) => {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
    const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;

    const handleOpenChange = React.useCallback(
      (newOpen: boolean) => {
        if (controlledOpen === undefined) {
          setUncontrolledOpen(newOpen);
        }
        onOpenChange?.(newOpen);
      },
      [controlledOpen, onOpenChange]
    );

    return (
      <CollapsibleContext.Provider value={{ open, onOpenChange: handleOpenChange }}>
        <div ref={ref} {...props}>
          {children}
        </div>
      </CollapsibleContext.Provider>
    );
  }
);
Collapsible.displayName = "Collapsible";

export interface CollapsibleTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const CollapsibleTrigger = React.forwardRef<
  HTMLButtonElement,
  CollapsibleTriggerProps
>(({ children, className, onClick, asChild = false, ...props }, ref) => {
  const { open, onOpenChange } = React.useContext(CollapsibleContext);
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      ref={ref}
      type={asChild ? undefined : "button"}
      className={cn(className)}
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        onOpenChange?.(!open);
        onClick?.(e);
      }}
      {...props}
    >
      {children}
    </Comp>
  );
});
CollapsibleTrigger.displayName = "CollapsibleTrigger";

const CollapsibleContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
  const { open } = React.useContext(CollapsibleContext);

  if (!open) return null;

  return (
    <div ref={ref} className={cn(className)} {...props}>
      {children}
    </div>
  );
});
CollapsibleContent.displayName = "CollapsibleContent";

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
