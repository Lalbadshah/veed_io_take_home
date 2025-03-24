"use client"

import type { Video } from "@/app/types/video"
import Image from "next/image"
import { formatDuration, formatDate } from "@/lib/utils"

interface VideoGridProps {
  videos: Video[]
  loading: boolean
  onVideoClick: (video: Video) => void
}

export default function VideoGrid({ videos, loading, onVideoClick }: VideoGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="aspect-video bg-gray-200 animate-pulse" />
            <div className="p-4">
              <div className="h-5 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {videos.map((video) => (
        <div
          key={video.id}
          className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform transition hover:scale-105 hover:shadow-lg"
          onClick={() => onVideoClick(video)}
        >
          <div className="relative aspect-video">
            <Image src={video.thumbnail_url || "/placeholder.svg"} alt={video.title} fill className="object-cover" />
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
              {formatDuration(video.duration)}
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-1 line-clamp-2">{video.title}</h3>
            <div className="flex justify-between text-sm text-gray-500">
              <span>{formatDate(video.created_at)}</span>
              <span>{video.views.toLocaleString()} views</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {video.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
              {video.tags.length > 3 && (
                <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">+{video.tags.length - 3}</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

