import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import {
  Search,
  CreditCard,
  Users,
  Smartphone,
  Globe,
  FolderSearch,
  AlertTriangle,
  ArrowRight,
  Hash,
  FileText,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useApp } from "@/stores/app-context"
import { transactions, customers, devices, ipAddresses, investigations, alerts } from "@/data/mock"

interface SearchResult {
  id: string
  title: string
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  category: string
}

export function CommandPalette() {
  const { state, setCommandPalette } = useApp()
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()

    const matches: SearchResult[] = []

    transactions.forEach((t) => {
      if (
        t.id.toLowerCase().includes(q) ||
        t.customerName.toLowerCase().includes(q) ||
        t.merchant.toLowerCase().includes(q)
      ) {
        matches.push({
          id: t.id,
          title: `${t.id} - $${t.amount.toLocaleString()}`,
          subtitle: `${t.customerName} - ${t.merchant}`,
          icon: CreditCard,
          href: `/transactions/${t.id}`,
          category: "Transactions",
        })
      }
    })

    customers.forEach((c) => {
      if (
        c.id.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
      ) {
        matches.push({
          id: c.id,
          title: `${c.name}`,
          subtitle: `${c.id} - ${c.email}`,
          icon: Users,
          href: `/customers/${c.id}`,
          category: "Customers",
        })
      }
    })

    devices.forEach((d) => {
      if (d.id.toLowerCase().includes(q)) {
        matches.push({
          id: d.id,
          title: d.id,
          subtitle: `${d.type} - ${d.os} - Risk: ${d.riskScore}`,
          icon: Smartphone,
          href: `/devices`,
          category: "Devices",
        })
      }
    })

    ipAddresses.forEach((ip) => {
      if (ip.ip.includes(q)) {
        matches.push({
          id: ip.ip,
          title: ip.ip,
          subtitle: `${ip.city}, ${ip.country} - Risk: ${ip.riskScore}`,
          icon: Globe,
          href: `/ip-intelligence`,
          category: "IP Addresses",
        })
      }
    })

    investigations.forEach((inv) => {
      if (
        inv.id.toLowerCase().includes(q) ||
        inv.title.toLowerCase().includes(q)
      ) {
        matches.push({
          id: inv.id,
          title: inv.title,
          subtitle: `${inv.id} - ${inv.status}`,
          icon: FolderSearch,
          href: `/investigations/${inv.id}`,
          category: "Investigations",
        })
      }
    })

    alerts.forEach((a) => {
      if (
        a.id.toLowerCase().includes(q) ||
        a.title.toLowerCase().includes(q) ||
        a.customerName.toLowerCase().includes(q)
      ) {
        matches.push({
          id: a.id,
          title: a.title,
          subtitle: `${a.id} - ${a.customerName} - ${a.severity}`,
          icon: AlertTriangle,
          href: `/alerts/${a.id}`,
          category: "Alerts",
        })
      }
    })

    return matches.slice(0, 20)
  }, [query])

  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {}
    results.forEach((r) => {
      if (!groups[r.category]) groups[r.category] = []
      groups[r.category].push(r)
    })
    return groups
  }, [results])

  const flatResults = useMemo(() => results, [results])

  const handleQueryChange = (value: string) => {
    setQuery(value)
    setSelectedIndex(0)
  }

  useEffect(() => {
    if (state.isCommandPaletteOpen) {
      setQuery("")
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [state.isCommandPaletteOpen])

  const handleSelect = useCallback(
    (href: string) => {
      navigate(href)
      setCommandPalette(false)
    },
    [navigate, setCommandPalette]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex((i) => Math.min(i + 1, flatResults.length - 1))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === "Enter" && flatResults[selectedIndex]) {
        handleSelect(flatResults[selectedIndex].href)
      } else if (e.key === "Escape") {
        setCommandPalette(false)
      }
    },
    [flatResults, selectedIndex, handleSelect, setCommandPalette]
  )

  if (!state.isCommandPaletteOpen) return null

  let runningIndex = -1

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={() => setCommandPalette(false)}
      />

      {/* Palette */}
      <div className="absolute left-1/2 top-[20%] w-full max-w-2xl -translate-x-1/2 animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="mx-4 overflow-hidden rounded-2xl border border-border/50 bg-card shadow-2xl">
          {/* Search input */}
          <div className="flex items-center gap-3 border-b border-border/50 px-4">
            <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search transactions, customers, devices, IPs, investigations..."
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-14 flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <kbd className="flex items-center gap-1 rounded-md border border-border/50 bg-muted/50 px-2 py-1 text-[10px] font-medium text-muted-foreground">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-[400px] overflow-y-auto p-2 scrollbar-thin">
            {!query.trim() ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted/50">
                  <Search className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Start typing to search across all entities
                </p>
                <p className="mt-1 text-xs text-muted-foreground/60">
                  Try searching for a customer name, transaction ID, or IP address
                </p>
              </div>
            ) : flatResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted/50">
                  <Hash className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">No results found</p>
                <p className="mt-1 text-xs text-muted-foreground/60">
                  Try a different search term
                </p>
              </div>
            ) : (
              Object.entries(groupedResults).map(([category, items]) => (
                <div key={category} className="mb-2">
                  <div className="flex items-center gap-2 px-3 py-1.5">
                    <FileText className="h-3 w-3 text-muted-foreground/50" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                      {category}
                    </span>
                    <span className="ml-auto text-[10px] text-muted-foreground/40">
                      {items.length}
                    </span>
                  </div>
                  {items.map((item) => {
                    runningIndex++
                    const idx = runningIndex
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item.href)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                          selectedIndex === idx
                            ? "bg-accent/50 text-foreground"
                            : "text-muted-foreground hover:bg-accent/30"
                        )}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{item.title}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {item.subtitle}
                          </p>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
                      </button>
                    )
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {flatResults.length > 0 && (
            <div className="flex items-center gap-4 border-t border-border/50 px-4 py-2.5">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60">
                <kbd className="rounded border border-border/50 bg-muted/50 px-1 py-0.5 font-mono text-[10px]">
                  &uarr;&darr;
                </kbd>
                Navigate
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60">
                <kbd className="rounded border border-border/50 bg-muted/50 px-1.5 py-0.5 font-mono text-[10px]">
                  &crarr;
                </kbd>
                Select
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60">
                <kbd className="rounded border border-border/50 bg-muted/50 px-1.5 py-0.5 font-mono text-[10px]">
                  esc
                </kbd>
                Close
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
