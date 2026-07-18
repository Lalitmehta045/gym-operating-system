"use client"

import React, { useState, useRef, useEffect } from "react"
import { Calendar as CalendarIcon, ChevronDown, Check } from "lucide-react"
import { useSectionFilter, PresetRange, DateRange as LocalDateRange } from "@/hooks/useSectionFilter"
import { format, isSameDay } from "date-fns"
import { DayPicker, DateRange } from "react-day-picker"
import "react-day-picker/dist/style.css"
import { motion, AnimatePresence } from "framer-motion"

interface DateFilterProps {
  paramPrefix: string;
}

export function DateFilter({ paramPrefix }: DateFilterProps) {
  const { dateRange, setDateRange } = useSectionFilter(paramPrefix)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Local state for the popover so we don't apply immediately until "Apply" is clicked for custom
  const [localPreset, setLocalPreset] = useState<PresetRange>(dateRange.label)
  const [localRange, setLocalRange] = useState<DateRange | undefined>({
    from: dateRange.from,
    to: dateRange.to
  })

  // Sync local state when opened
  useEffect(() => {
    if (isOpen) {
      setLocalPreset(dateRange.label)
      setLocalRange({ from: dateRange.from, to: dateRange.to })
    }
  }, [isOpen, dateRange])

  // Click outside and escape to close
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false)
    }
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleKeyDown)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen])

  const presets: PresetRange[] = [
    "Today",
    "Yesterday",
    "This Week",
    "Last Week",
    "Last 7 Days",
    "Last 30 Days",
    "This Month",
    "Last Month",
    "Last 3 Months",
    "Last 6 Months",
    "This Year",
    "Custom Range"
  ]

  const formatRange = (range: LocalDateRange) => {
    if (range.label !== "Custom Range") {
      return range.label
    }
    if (range.from && range.to) {
      if (isSameDay(range.from, range.to)) {
        return format(range.from, "MMM d, yyyy")
      }
      return `${format(range.from, "MMM d, yyyy")} – ${format(range.to, "MMM d, yyyy")}`
    }
    if (range.from) {
      return format(range.from, "MMM d, yyyy")
    }
    return "Custom Range"
  }

  const handleApply = () => {
    setDateRange(localPreset, localRange?.from, localRange?.to)
    setIsOpen(false)
  }

  const handleSelectPreset = (preset: PresetRange) => {
    setLocalPreset(preset)
    // If a non-custom preset is clicked, we apply immediately for great UX (like Vercel)
    if (preset !== "Custom Range") {
      setDateRange(preset)
      setIsOpen(false)
    }
  }

  const handleDayClick = (range: DateRange | undefined) => {
    setLocalPreset("Custom Range")
    setLocalRange(range)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-[var(--ink)] bg-[var(--canvas-light)] border border-[var(--hairline)] rounded-lg hover:bg-[var(--canvas-paper)] hover:border-[var(--hairline-strong)] transition-all shadow-sm group"
      >
        <CalendarIcon className="w-4 h-4 text-[var(--mute)] group-hover:text-[var(--ink-soft)] transition-colors" />
        {formatRange(dateRange)}
        <ChevronDown className={`w-4 h-4 text-[var(--mute)] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 bg-[var(--canvas-light)] border border-[var(--hairline)] rounded-xl shadow-xl z-50 overflow-hidden flex flex-col md:flex-row min-w-[320px] md:min-w-[600px]"
          >
            {/* Presets Sidebar */}
            <div className="w-full md:w-[220px] border-b md:border-b-0 md:border-r border-[var(--hairline-soft)] bg-[var(--canvas-paper)]/30 p-2 flex flex-col gap-1 max-h-[300px] md:max-h-none overflow-y-auto">
              {presets.map((preset) => (
                <button
                  key={preset}
                  onClick={() => handleSelectPreset(preset)}
                  className={`flex items-center justify-between px-3 py-2 text-sm text-left rounded-md transition-colors ${
                    localPreset === preset 
                      ? "bg-[#6C47FF]/10 text-[#6C47FF] font-medium" 
                      : "text-[var(--ink-soft)] hover:bg-[var(--canvas-paper)] hover:text-[var(--ink)]"
                  }`}
                >
                  <span>{preset}</span>
                  {localPreset === preset && (
                    <Check className="w-4 h-4" />
                  )}
                </button>
              ))}
            </div>

            {/* Custom Range Picker & Actions */}
            <div className="flex flex-col p-4">
              <div className="flex-1">
                <DayPicker
                  mode="range"
                  selected={localRange}
                  onSelect={handleDayClick}
                  numberOfMonths={2}
                  className="!m-0 premium-calendar"
                  modifiersClassNames={{
                    selected: "bg-[#6C47FF] text-white hover:bg-[#5b3ce0]",
                    range_middle: "bg-[#6C47FF]/10 text-[var(--ink)] !rounded-none",
                    range_start: "bg-[#6C47FF] text-white !rounded-l-md !rounded-r-none",
                    range_end: "bg-[#6C47FF] text-white !rounded-r-md !rounded-l-none",
                    today: "font-bold text-[#6C47FF]"
                  }}
                  styles={{
                    root: { '--rdp-cell-size': '36px', '--rdp-accent-color': '#6C47FF', '--rdp-background-color': '#f3f0ff', margin: 0 } as React.CSSProperties,
                  }}
                />
              </div>

              {localPreset === "Custom Range" && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--hairline-soft)]">
                  <div className="text-sm font-medium text-[var(--ink-soft)]">
                    {localRange?.from ? format(localRange.from, "MMM d, yyyy") : "Start"} 
                    {" – "} 
                    {localRange?.to ? format(localRange.to, "MMM d, yyyy") : "End"}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setIsOpen(false)}
                      className="px-3 py-1.5 text-sm font-medium text-[var(--ink-soft)] hover:bg-[var(--canvas-paper)] rounded-md transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleApply}
                      disabled={!localRange?.from}
                      className="px-3 py-1.5 text-sm font-medium text-white bg-[#6C47FF] hover:bg-[#5b3ce0] disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors shadow-sm"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
