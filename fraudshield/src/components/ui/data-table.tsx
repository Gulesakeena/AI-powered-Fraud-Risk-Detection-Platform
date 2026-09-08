import * as React from "react"
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "./input"
import { Button } from "./button"
import { Skeleton } from "./skeleton"

interface Column<T> {
  key: string
  label: string
  render?: (item: T) => React.ReactNode
  sortable?: boolean
  width?: string
}

interface Pagination {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  onRowClick?: (item: T) => void
  searchable?: boolean
  searchPlaceholder?: string
  emptyMessage?: string
  pagination?: Pagination
  loading?: boolean
  selectable?: boolean
  onSelectionChange?: (selectedItems: T[]) => void
  filters?: React.ReactNode
}

function DataTable<T extends Record<string, any>>({
  columns,
  data,
  onRowClick,
  searchable = false,
  searchPlaceholder = "Search...",
  emptyMessage = "No data available",
  pagination,
  loading = false,
  selectable = false,
  onSelectionChange,
  filters,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [sortConfig, setSortConfig] = React.useState<{
    key: string
    direction: "asc" | "desc"
  } | null>(null)
  const [selectedRows, setSelectedRows] = React.useState<Set<number>>(new Set())

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev?.key === key && prev.direction === "asc" ? "desc" : "asc",
    }))
  }

  const filteredData = React.useMemo(() => {
    let result = [...data]

    if (searchQuery) {
      result = result.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    }

    if (sortConfig) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key]
        const bVal = b[sortConfig.key]
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1
        return 0
      })
    }

    return result
  }, [data, searchQuery, sortConfig])

  const handleSelectAll = () => {
    if (selectedRows.size === filteredData.length) {
      setSelectedRows(new Set())
      onSelectionChange?.([])
    } else {
      const newSelected = new Set(filteredData.map((_, i) => i))
      setSelectedRows(newSelected)
      onSelectionChange?.(filteredData)
    }
  }

  const handleSelectRow = (index: number) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedRows(newSelected)
    onSelectionChange?.(filteredData.filter((_, i) => newSelected.has(i)))
  }

  return (
    <div className="w-full">
      {(searchable || filters) && (
        <div className="flex items-center gap-4 mb-4">
          {searchable && (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          )}
          {filters && <div className="flex items-center gap-2">{filters}</div>}
        </div>
      )}

      <div className="rounded-xl border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                {selectable && (
                  <th className="w-12 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.size === filteredData.length && filteredData.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-border"
                    />
                  </th>
                )}
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      "px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider",
                      column.sortable && "cursor-pointer hover:text-foreground transition-colors"
                    )}
                    style={{ width: column.width }}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-1">
                      {column.label}
                      {column.sortable && (
                        <span className="text-muted-foreground/50">
                          {sortConfig?.key === column.key ? (
                            sortConfig.direction === "asc" ? (
                              <ArrowUp className="h-3 w-3" />
                            ) : (
                              <ArrowDown className="h-3 w-3" />
                            )
                          ) : (
                            <ArrowUpDown className="h-3 w-3" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/30">
                    {selectable && (
                      <td className="px-4 py-3">
                        <Skeleton className="h-4 w-4" />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td key={column.key} className="px-4 py-3">
                        <Skeleton className="h-4 w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (selectable ? 1 : 0)}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                filteredData.map((item, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className={cn(
                      "border-b border-border/30 transition-colors",
                      onRowClick && "cursor-pointer hover:bg-muted/30",
                      selectedRows.has(rowIndex) && "bg-primary/5"
                    )}
                    onClick={() => onRowClick?.(item)}
                  >
                    {selectable && (
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedRows.has(rowIndex)}
                          onChange={() => handleSelectRow(rowIndex)}
                          className="rounded border-border"
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td key={column.key} className="px-4 py-3 text-sm text-foreground">
                        {column.render
                          ? column.render(item)
                          : item[column.key]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pagination && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Page {pagination.currentPage} of {pagination.totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export { DataTable }
export type { Column, DataTableProps }
