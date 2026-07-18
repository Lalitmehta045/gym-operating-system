import { useSearchParams, useRouter } from "next/navigation"
import { useMemo, useCallback } from "react"
import { startOfDay, startOfWeek, startOfMonth, startOfYear, subDays, subMonths, endOfDay, subWeeks } from "date-fns"

export type PresetRange = 
  | "Today" 
  | "Yesterday" 
  | "This Week" 
  | "Last Week" 
  | "Last 7 Days" 
  | "Last 30 Days" 
  | "This Month" 
  | "Last Month" 
  | "Last 3 Months"
  | "Last 6 Months"
  | "This Year"
  | "Custom Range"

export interface DateRange {
  label: PresetRange
  from?: Date
  to?: Date
}

export function useSectionFilter(paramPrefix: string, defaultPreset: PresetRange = "This Month") {
  const searchParams = useSearchParams()
  const router = useRouter()

  const rangeParam = `${paramPrefix}Range`
  const fromParam = `${paramPrefix}From`
  const toParam = `${paramPrefix}To`

  const dateRange = useMemo<DateRange>(() => {
    const rawLabel = searchParams.get(rangeParam)
    const label = (rawLabel as PresetRange) || defaultPreset
    const fromStr = searchParams.get(fromParam)
    const toStr = searchParams.get(toParam)

    if (label === "Custom Range") {
      return {
        label,
        from: fromStr ? new Date(fromStr) : undefined,
        to: toStr ? new Date(toStr) : undefined,
      }
    }

    const now = new Date()
    let from: Date
    let to: Date = endOfDay(now)

    switch (label) {
      case "Today":
        from = startOfDay(now)
        break
      case "Yesterday":
        from = startOfDay(subDays(now, 1))
        to = endOfDay(subDays(now, 1))
        break
      case "This Week":
        from = startOfWeek(now, { weekStartsOn: 1 })
        break
      case "Last Week":
        from = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 })
        to = endOfDay(subDays(from, 6))
        break
      case "Last 7 Days":
        from = startOfDay(subDays(now, 7))
        break
      case "Last 30 Days":
        from = startOfDay(subDays(now, 30))
        break
      case "This Month":
        from = startOfMonth(now)
        break
      case "Last Month":
        from = startOfMonth(subMonths(now, 1))
        to = endOfDay(subDays(startOfMonth(now), 1))
        break
      case "Last 3 Months":
        from = startOfMonth(subMonths(now, 3))
        break
      case "Last 6 Months":
        from = startOfMonth(subMonths(now, 6))
        break
      case "This Year":
        from = startOfYear(now)
        break
      default:
        from = startOfMonth(now)
    }

    return { label, from, to }
  }, [searchParams, rangeParam, fromParam, toParam, defaultPreset])

  const setDateRange = useCallback((label: PresetRange, from?: Date, to?: Date) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(rangeParam, label)

    if (label === "Custom Range" && from && to) {
      params.set(fromParam, from.toISOString())
      params.set(toParam, to.toISOString())
    } else {
      params.delete(fromParam)
      params.delete(toParam)
    }

    router.replace(`?${params.toString()}`, { scroll: false })
  }, [searchParams, router, rangeParam, fromParam, toParam])

  return {
    dateRange,
    setDateRange
  }
}
