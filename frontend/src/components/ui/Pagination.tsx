import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav className={cn("flex items-center space-x-1", className)} aria-label="Pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none"
      >
        <span className="sr-only">Previous page</span>
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div className="flex items-center space-x-1">
        <span className="text-sm font-medium text-gray-700">Page {currentPage} of {totalPages}</span>
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none"
      >
        <span className="sr-only">Next page</span>
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  )
}
