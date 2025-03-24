"use client"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import VideoGrid from "@/components/video-grid"
import FilterPanel from "@/components/filter-panel"
import VideoModal from "@/components/video-modal"
import type { Video } from "@/app/types/video"
import { fetchVideos, fetchTags } from "@/lib/api"

export default function Dashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const page = useMemo(() => Number(searchParams.get("page") || 1), [searchParams])
  const search = useMemo(() => searchParams.get("search") || "", [searchParams])
  const selectedTags = useMemo(() => searchParams.getAll("tags"), [searchParams])
  const startDate = useMemo(() => searchParams.get("startDate") || "", [searchParams])
  const endDate = useMemo(() => searchParams.get("endDate") || "", [searchParams])
  const sortBy = useMemo(() => searchParams.get("sortBy") || "date-desc", [searchParams])

  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [metadata, setMetadata] = useState({
    currentPage: 1,
    pageSize: 12,
    totalPages: 1,
    totalVideos: 0,
  })

  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)

  useEffect(() => {
    const loadVideos = async () => {
      setLoading(true)
      try {
        const result = await fetchVideos({
          page,
          pageSize: 12,
          tags: selectedTags,
          search,
          startDate,
          endDate,
          sortBy: sortBy as "date-asc" | "date-desc" | "alpha-asc" | "alpha-desc",
        })

        setVideos(result.videos)
        setMetadata(result.metadata)
        setError(null)
      } catch (err) {
        setError("Failed to load videos. Please try again later.")
        console.error("Error fetching videos:", err)
      } finally {
        setLoading(false)
      }
    }

    loadVideos()
  }, [page, search, selectedTags, startDate, endDate, sortBy])

  useEffect(() => {
    const loadTags = async () => {
      try {
        const tagsList = await fetchTags()
        setTags(tagsList)
      } catch (err) {
        console.error("Error fetching tags:", err)
      }
    }

    loadTags()
  }, [])

  // Update URL with filters - so shared links yield same results
  const updateFilters = ({
    newSearch,
    newTags,
    newStartDate,
    newEndDate,
    newSortBy,
    newPage,
  }: {
    newSearch?: string
    newTags?: string[]
    newStartDate?: string
    newEndDate?: string
    newSortBy?: string
    newPage?: number
  }) => {
    const params = new URLSearchParams()

    if (newSearch || search) params.set("search", newSearch ?? search)
    if (newPage) params.set("page", newPage.toString())
    if (newStartDate || startDate) params.set("startDate", newStartDate ?? startDate)
    if (newEndDate || endDate) params.set("endDate", newEndDate ?? endDate)
    if (newSortBy || sortBy) params.set("sortBy", newSortBy ?? sortBy)

    const tagsToUse = newTags ?? selectedTags
    tagsToUse.forEach((tag) => params.append("tags", tag))

    if (
      !newPage &&
      (newSearch !== undefined ||
        newTags !== undefined ||
        newStartDate !== undefined ||
        newEndDate !== undefined ||
        newSortBy !== undefined)
    ) {
      params.set("page", "1")
    }

    router.push(`?${params.toString()}`)
  }

  const handleVideoClick = (video: Video) => {
    setSelectedVideo(video)
  }

  const handleCloseModal = () => {
    setSelectedVideo(null)
  }

  const handlePageChange = (newPage: number) => {
    updateFilters({ newPage })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Video Dashboard</h1>

        <FilterPanel
          tags={tags}
          selectedTags={selectedTags}
          search={search}
          startDate={startDate}
          endDate={endDate}
          sortBy={sortBy}
          onUpdateFilters={updateFilters}
        />

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

        <VideoGrid videos={videos} loading={loading} onVideoClick={handleVideoClick} />

        {!loading && videos.length > 0 && (
          <div className="mt-8 flex justify-center">
            <Pagination
              currentPage={metadata.currentPage}
              totalPages={metadata.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        {!loading && videos.length === 0 && !error && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No videos found matching your filters.</p>
          </div>
        )}

        {selectedVideo && <VideoModal video={selectedVideo} onClose={handleCloseModal} />}
      </div>
    </div>
  )
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  const getVisiblePages = () => {
    if (totalPages <= 7) return pages

    if (currentPage <= 4) {
      return [...pages.slice(0, 5), "...", totalPages]
    } else if (currentPage >= totalPages - 3) {
      return [1, "...", ...pages.slice(totalPages - 5)]
    } else {
      return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages]
    }
  }

  const visiblePages = getVisiblePages()

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded border disabled:opacity-50"
      >
        Previous
      </button>

      {visiblePages.map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === "number" && onPageChange(page)}
          disabled={page === "..."}
          className={`px-3 py-1 rounded ${
            page === currentPage ? "bg-blue-500 text-white" : "border hover:bg-gray-100"
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded border disabled:opacity-50"
      >
        Next
      </button>
    </div>
  )
}

