import * as React from "react"
import { cn } from "@/lib/utils"

interface DropdownItem {
  label: string
  icon?: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  danger?: boolean
}

interface DropdownMenuProps {
  trigger: React.ReactNode
  items: DropdownItem[]
  align?: "left" | "right"
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  trigger,
  items,
  align = "left",
}) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative inline-block" ref={menuRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>
      {isOpen && (
        <div
          className={cn(
            "absolute z-50 mt-2 min-w-[180px] rounded-lg border border-border/50 bg-card p-1 shadow-xl animate-in zoom-in-95 fade-in duration-150",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                if (!item.disabled) {
                  item.onClick?.()
                  setIsOpen(false)
                }
              }}
              disabled={item.disabled}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                item.danger
                  ? "text-red-400 hover:bg-red-500/10"
                  : "text-foreground hover:bg-accent",
                item.disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {item.icon && <span className="h-4 w-4">{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export { DropdownMenu }
