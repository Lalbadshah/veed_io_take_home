"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import type { Video } from "@/app/types/video"
import { formatDuration, formatDate } from "@/lib/utils"
import { X } from "lucide-react"

interface VideoModalProps {
  video: Video
  onClose: () => void
}

export default function VideoModal({ video, onClose }: VideoModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-transparent flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70 z-10"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="aspect-video bg-black relative">
            <img
              src={video.thumbnail_url || "/placeholder.svg"}
              alt={video.title}
              className="w-full h-full object-contain"
            />
            <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white px-2 py-1 rounded">
              {formatDuration(video.duration)}
            </div>
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-2xl font-bold mb-2">{video.title}</h2>

          <div className="flex justify-between text-gray-500 mb-4">
            <span>{formatDate(video.created_at)}</span>
            <span>{video.views.toLocaleString()} views</span>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {video.tags.map((tag) => (
                <span key={tag} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Video Information</h3>
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td className="py-1 font-medium">ID:</td>
                  <td>{video.id}</td>
                </tr>
                <tr>
                  <td className="py-1 font-medium">Duration:</td>
                  <td>{formatDuration(video.duration)}</td>
                </tr>
                <tr>
                  <td className="py-1 font-medium">Created:</td>
                  <td>{new Date(video.created_at).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

