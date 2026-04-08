"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TooltipProviderProps {
  delayDuration?: number;
  children: React.ReactNode;
}

const TooltipContext = React.createContext<{ delayDuration: number }>({
  delayDuration: 200,
});

function TooltipProvider({
  delayDuration = 200,
  children,
}: TooltipProviderProps) {
  return (
    <TooltipContext.Provider value={{ delayDuration }}>
      {children}
    </TooltipContext.Provider>
  );
}

interface TooltipInternalContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
}

const TooltipInternalContext = React.createContext<
  TooltipInternalContextValue | undefined
>(undefined);

function useTooltipContext() {
  const context = React.useContext(TooltipInternalContext);
  if (!context) {
    throw new Error(
      "Tooltip components must be used within a <Tooltip> provider"
    );
  }
  return context;
}

interface TooltipProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function Tooltip({
  open: controlledOpen,
  onOpenChange,
  defaultOpen = false,
  children,
}: TooltipProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const { delayDuration } = React.useContext(TooltipContext);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleOpenChange = React.useCallback(
    (value: boolean) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      if (value && delayDuration > 0) {
        timeoutRef.current = setTimeout(() => {
          if (!isControlled) setUncontrolledOpen(true);
          onOpenChange?.(true);
        }, delayDuration);
      } else {
        if (!isControlled) setUncontrolledOpen(value);
        onOpenChange?.(value);
      }
    },
    [isControlled, onOpenChange, delayDuration]
  );

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <TooltipInternalContext.Provider
      value={{ open, onOpenChange: handleOpenChange, triggerRef }}
    >
      <div className="relative inline-flex">{children}</div>
    </TooltipInternalContext.Provider>
  );
}

const TooltipTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ asChild, ...props }, ref) => {
  const { onOpenChange } = useTooltipContext();

  return (
    <button
      ref={ref}
      type="button"
      onMouseEnter={() => onOpenChange(true)}
      onMouseLeave={() => onOpenChange(false)}
      onFocus={() => onOpenChange(true)}
      onBlur={() => onOpenChange(false)}
      {...props}
    />
  );
});
TooltipTrigger.displayName = "TooltipTrigger";

interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
}

const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ className, side = "top", sideOffset = 4, ...props }, ref) => {
    const { open } = useTooltipContext();

    if (!open) return null;

    return (
      <div
        ref={ref}
        role="tooltip"
        className={cn(
          "absolute z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground shadow-md",
          side === "top" && "bottom-full left-1/2 -translate-x-1/2 mb-1",
          side === "bottom" && "top-full left-1/2 -translate-x-1/2 mt-1",
          side === "left" && "right-full top-1/2 -translate-y-1/2 mr-1",
          side === "right" && "left-full top-1/2 -translate-y-1/2 ml-1",
          className
        )}
        style={{
          marginTop: side === "bottom" ? `${sideOffset}px` : undefined,
          marginBottom: side === "top" ? `${sideOffset}px` : undefined,
          marginLeft: side === "right" ? `${sideOffset}px` : undefined,
          marginRight: side === "left" ? `${sideOffset}px` : undefined,
        }}
        {...props}
      />
    );
  }
);
TooltipContent.displayName = "TooltipContent";

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
