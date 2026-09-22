import * as React from "react"
import { cn } from "@/lib/utils"

interface AvatarProps {
  name: string
  size?: "sm" | "md" | "lg"
  src?: string
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function getColorFromName(name: string): string {
  const colors = [
    "bg-blue-500/20 text-blue-400",
    "bg-purple-500/20 text-purple-400",
    "bg-emerald-500/20 text-emerald-400",
    "bg-amber-500/20 text-amber-400",
    "bg-pink-500/20 text-pink-400",
    "bg-cyan-500/20 text-cyan-400",
    "bg-rose-500/20 text-rose-400",
    "bg-indigo-500/20 text-indigo-400",
  ]

  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }

  return colors[Math.abs(hash) % colors.length]
}

const Avatar: React.FC<AvatarProps> = ({ name, size = "md", src }) => {
  const [imageError, setImageError] = React.useState(false)
  const showImage = src && !imageError

  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-full overflow-hidden",
        sizeClasses[size],
        !showImage && getColorFromName(name)
      )}
    >
      {showImage ? (
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span className="font-semibold">{getInitials(name)}</span>
      )}
    </div>
  )
}

export { Avatar }
