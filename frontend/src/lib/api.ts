import type { PaginationOptions, VideoResponse } from "@/app/types/video"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"

export async function fetchVideos(options: PaginationOptions): Promise<VideoResponse> {
  const params = new URLSearchParams()

  params.append("page", options.page.toString())
  params.append("pageSize", options.pageSize.toString())

  if (options.search) {
    params.append("search", options.search)
  }

  if (options.startDate) {
    params.append("startDate", options.startDate)
  }

  if (options.endDate) {
    params.append("endDate", options.endDate)
  }

  if (options.sortBy) {
    params.append("sortBy", options.sortBy)
  }

  if (options.tags && options.tags.length > 0) {
    options.tags.forEach((tag) => params.append("tags", tag))
  }

  try {
    const response = await fetch(`${API_URL}/videos?${params.toString()}`)

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching videos:", error)
    throw error
  }
}

export async function fetchTags(): Promise<string[]> {
  try {
    const response = await fetch(`${API_URL}/tags`)

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching tags:", error)
    throw error
  }
}

