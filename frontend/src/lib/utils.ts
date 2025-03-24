import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)

  // If it's this year, just show month and day
  const now = new Date()
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  // Otherwise show month, day, and year
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

