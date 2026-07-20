import * as React from "react"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "./Drawer"
import { Button } from "./Button"
import { SlidersHorizontal } from "lucide-react"

interface AdvancedFiltersDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  onApply: () => void;
  onClearAll: () => void;
  children: React.ReactNode;
}

export function AdvancedFiltersDrawer({
  open,
  onOpenChange,
  title = "Advanced Filters",
  description = "Refine your results.",
  onApply,
  onClearAll,
  children,
}: AdvancedFiltersDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="border-b border-[var(--hairline-soft)] pb-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-[var(--on-primary)]" />
            <DrawerTitle>{title}</DrawerTitle>
          </div>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        
        <div className="flex-1 overflow-y-auto py-6 space-y-6">
          {children}
        </div>

        <DrawerFooter className="border-t border-[var(--hairline-soft)] pt-4">
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onClearAll}>
              Clear All
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="primary" className="flex-1" onClick={() => {
              onApply();
              onOpenChange(false);
            }}>
              Apply
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
