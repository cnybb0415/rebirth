"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type TabsContextValue = {
  value: string;
  setValue: (value: string) => void;
  triggers: string[];
  registerTrigger: (value: string) => void;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("Tabs components must be used within <Tabs>");
  return ctx;
}

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  className,
  children,
}: {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}) {
  const isControlled = typeof value === "string";
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue ?? "");
  const currentValue = isControlled ? (value as string) : uncontrolledValue;

  const [triggers, setTriggers] = React.useState<string[]>([]);

  const setValue = React.useCallback(
    (next: string) => {
      if (!isControlled) setUncontrolledValue(next);
      onValueChange?.(next);
    },
    [isControlled, onValueChange]
  );

  const registerTrigger = React.useCallback((next: string) => {
    setTriggers((prev) => (prev.includes(next) ? prev : [...prev, next]));
  }, []);

  return (
    <TabsContext.Provider value={{ value: currentValue, setValue, triggers, registerTrigger }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  className,
  children,
  "aria-label": ariaLabel,
}: React.HTMLAttributes<HTMLDivElement> & { "aria-label"?: string }) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "flex flex-nowrap items-center gap-2 rounded-2xl border border-foreground/10 bg-white p-2 shadow-sm overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className
      )}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  variant = "pill",
  className,
  children,
}: {
  value: string;
  variant?: "pill" | "underline" | "sidebar";
  className?: string;
  children: React.ReactNode;
}) {
  const { value: active, setValue, triggers, registerTrigger } = useTabsContext();
  const ref = React.useRef<HTMLButtonElement | null>(null);

  React.useEffect(() => {
    registerTrigger(value);
  }, [registerTrigger, value]);

  const selected = active === value;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight" && e.key !== "Home" && e.key !== "End") return;
    e.preventDefault();

    const list = triggers;
    if (list.length === 0) return;

    const currentIndex = Math.max(0, list.indexOf(active));
    let nextIndex = currentIndex;

    if (e.key === "Home") nextIndex = 0;
    else if (e.key === "End") nextIndex = list.length - 1;
    else if (e.key === "ArrowLeft") nextIndex = (currentIndex - 1 + list.length) % list.length;
    else if (e.key === "ArrowRight") nextIndex = (currentIndex + 1) % list.length;

    const nextValue = list[nextIndex];
    setValue(nextValue);
  };

  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      aria-selected={selected}
      tabIndex={selected ? 0 : -1}
      onClick={() => setValue(value)}
      onKeyDown={onKeyDown}
      className={cn(
        "inline-flex shrink-0 items-center justify-center text-sm leading-none whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20",
        variant === "pill" &&
          "h-9 rounded-xl px-4 font-semibold",
        variant === "pill" &&
          (selected
            ? "bg-foreground text-background"
            : "bg-transparent text-foreground hover:bg-gray-50"),

        variant === "underline" &&
          "h-9 rounded-none border-b-2 px-1 font-semibold",
        variant === "underline" &&
          (selected
            ? "border-foreground text-foreground"
            : "border-transparent text-foreground/70 hover:text-foreground"),

        variant === "sidebar" &&
          "h-9 w-full justify-start rounded-xl px-3 font-semibold",
        variant === "sidebar" &&
          (selected
            ? "bg-gray-50 text-foreground"
            : "bg-transparent text-foreground/80 hover:bg-gray-50 hover:text-foreground"),
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { value: active } = useTabsContext();
  if (active !== value) return null;
  return (
    <div role="tabpanel" className={cn("mt-4", className)}>
      {children}
    </div>
  );
}
