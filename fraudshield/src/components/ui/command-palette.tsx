import * as React from "react"
import { Search, CornerDownLeft } from "lucide-react"
import { cn } from "@/lib/utils"

interface CommandResult {
  id: string
  label: string
  icon?: React.ReactNode
  shortcut?: string[]
  onSelect: () => void
}

interface CommandGroup {
  label: string
  results: CommandResult[]
}

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  onSearch: (query: string) => void
  results: CommandGroup[]
}

const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSearch,
  results,
}) => {
  const [query, setQuery] = React.useState("")
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (isOpen) {
      setQuery("")
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        if (isOpen) {
          onClose()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  const allResults = results.flatMap((group) => group.results)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev < allResults.length - 1 ? prev + 1 : 0
        )
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : allResults.length - 1
        )
        break
      case "Enter":
        e.preventDefault()
        if (allResults[selectedIndex]) {
          allResults[selectedIndex].onSelect()
          onClose()
        }
        break
      case "Escape":
        onClose()
        break
    }
  }

  if (!isOpen) return null

  let flatIndex = 0

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
        onClick={onClose}
      />
      <div className="relative z-50 w-full max-w-lg mx-4 rounded-xl border border-border/50 bg-card shadow-2xl animate-in zoom-in-95 fade-in duration-150 overflow-hidden">
        <div className="flex items-center border-b border-border/50 px-4">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              onSearch(e.target.value)
              setSelectedIndex(0)
            }}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent px-3 py-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <kbd className="pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-border/50 bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            ESC
          </kbd>
        </div>

        <div className="max-h-[300px] overflow-y-auto p-2">
          {results.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </div>
          ) : (
            results.map((group) => (
              <div key={group.label} className="mb-2">
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  {group.label}
                </div>
                {group.results.map((result) => {
                  const currentIndex = flatIndex++
                  return (
                    <button
                      key={result.id}
                      onClick={() => {
                        result.onSelect()
                        onClose()
                      }}
                      onMouseEnter={() => setSelectedIndex(currentIndex)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                        currentIndex === selectedIndex
                          ? "bg-accent text-accent-foreground"
                          : "text-foreground hover:bg-accent/50"
                      )}
                    >
                      {result.icon && (
                        <span className="h-4 w-4 text-muted-foreground">
                          {result.icon}
                        </span>
                      )}
                      <span className="flex-1 text-left">{result.label}</span>
                      {result.shortcut && (
                        <div className="flex items-center gap-1">
                          {result.shortcut.map((key) => (
                            <kbd
                              key={key}
                              className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border/50 bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground"
                            >
                              {key}
                            </kbd>
                          ))}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border/50 px-4 py-2">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border/50 bg-muted px-1.5 font-mono text-[10px] font-medium">
                ↑↓
              </kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <CornerDownLeft className="h-3 w-3" />
              Select
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export { CommandPalette }
