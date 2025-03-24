export interface Video {
  id: string
  title: string
  thumbnail_url: string
  created_at: string
  duration: number
  views: number
  tags: string[]
}

export interface PaginationOptions {
  page: number
  pageSize: number
  tags?: string[]
  search?: string
  startDate?: string
  endDate?: string
  sortBy?: "date-asc" | "date-desc" | "alpha-asc" | "alpha-desc"
}

export interface VideoResponse {
  videos: Video[]
  metadata: {
    currentPage: number
    pageSize: number
    totalPages: number
    totalVideos: number
    appliedFilters: {
      tags: string[]
      searchQuery: string
      startDate?: string
      endDate?: string
      sortBy?: "date-asc" | "date-desc" | "alpha-asc" | "alpha-desc"
    }
  }
}

