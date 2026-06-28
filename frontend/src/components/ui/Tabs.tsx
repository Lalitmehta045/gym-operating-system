import * as React from "react"
import { cn } from "@/lib/utils"

const TabsContext = React.createContext<{
  value: string;
  onValueChange: (value: string) => void;
} | null>(null);

export function Tabs({ defaultValue, value, onValueChange, children, className }: any) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const currentValue = value !== undefined ? value : internalValue;
  const changeValue = onValueChange || setInternalValue;

  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: changeValue }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, children }: any) {
  return (
    <div className={cn("flex space-x-2 border-b border-[#ebebeb]", className)}>
      {children}
    </div>
  );
}

export function TabsTrigger({ value, className, children }: any) {
  const context = React.useContext(TabsContext);
  const isActive = context?.value === value;

  return (
    <button
      type="button"
      onClick={() => context?.onValueChange(value)}
      className={cn(
        "px-4 py-2 text-sm font-medium transition-colors border-b-2",
        isActive
          ? "border-black text-black"
          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, className, children }: any) {
  const context = React.useContext(TabsContext);
  if (context?.value !== value) return null;
  return <div className={cn("mt-4", className)}>{children}</div>;
}
