import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toLocaleString()
}

export function formatCompact(num: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(num)
}

export function getRiskLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' {
  if (score <= 30) return 'LOW'
  if (score <= 70) return 'MEDIUM'
  return 'HIGH'
}

export function getRiskColor(score: number): string {
  if (score <= 30) return 'text-risk-low'
  if (score <= 70) return 'text-risk-medium'
  return 'text-risk-high'
}

export function getRiskBg(score: number): string {
  if (score <= 30) return 'bg-risk-low/10'
  if (score <= 70) return 'bg-risk-medium/10'
  return 'bg-risk-high/10'
}

export function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
