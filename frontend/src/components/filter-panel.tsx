"use client"

import type React from "react"

import { useState } from "react"
import { Calendar, Search, ChevronDown } from "lucide-react"

interface FilterPanelProps {
  tags: string[]
  selectedTags: string[]
  search: string
  startDate: string
  endDate: string
  sortBy: string
  onUpdateFilters: (filters: {
    newSearch?: string
    newTags?: string[]
    newStartDate?: string
    newEndDate?: string
    newSortBy?: string
  }) => void
}

export default function FilterPanel({
  tags,
  selectedTags,
  search,
  startDate,
  endDate,
  sortBy,
  onUpdateFilters,
}: FilterPanelProps) {
  const [isTagsOpen, setIsTagsOpen] = useState(false)
  const [searchInput, setSearchInput] = useState(search)
  const [showDateFilter, setShowDateFilter] = useState(false)

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdateFilters({ newSearch: searchInput })
  }

  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag) ? selectedTags.filter((t) => t !== tag) : [...selectedTags, tag]

    onUpdateFilters({ newTags })
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdateFilters({ newSortBy: e.target.value })
  }

  const handleDateChange = (type: "start" | "end", value: string) => {
    if (type === "start") {
      onUpdateFilters({ newStartDate: value })
    } else {
      onUpdateFilters({ newEndDate: value })
    }
  }

  const clearFilters = () => {
    setSearchInput("")
    onUpdateFilters({
      newSearch: "",
      newTags: [],
      newStartDate: "",
      newEndDate: "",
      newSortBy: "date-desc",
    })
  }

  const hasActiveFilters = search || selectedTags.length > 0 || startDate || endDate || sortBy !== "date-desc"

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
        <form onSubmit={handleSearchSubmit} className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search videos..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <button
              type="submit"
              className="absolute right-2 top-1.5 bg-blue-500 text-white px-3 py-1 rounded-md text-sm"
            >
              Search
            </button>
          </div>
        </form>

        <button
          onClick={() => setShowDateFilter(!showDateFilter)}
          className={`flex items-center gap-2 px-4 py-2 border rounded-lg ${
            startDate || endDate ? "bg-blue-50 border-blue-200" : ""
          }`}
        >
          <Calendar className="h-5 w-5" />
          <span>Date Range</span>
        </button>

        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="whitespace-nowrap">
            Sort by:
          </label>
          <select
            id="sort"
            value={sortBy}
            onChange={handleSortChange}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="alpha-asc">A-Z</option>
            <option value="alpha-desc">Z-A</option>
          </select>
        </div>

        {hasActiveFilters && (
          <button onClick={clearFilters} className="text-red-500 hover:text-red-700 text-sm whitespace-nowrap">
            Clear Filters
          </button>
        )}
      </div>

      {showDateFilter && (
        <div className="flex flex-col sm:flex-row gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <label htmlFor="startDate" className="block text-sm font-medium mb-1">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => handleDateChange("start", e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="endDate" className="block text-sm font-medium mb-1">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => handleDateChange("end", e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      )}

      <div>
        <button onClick={() => setIsTagsOpen(!isTagsOpen)} className="flex items-center gap-2 mb-2 text-sm font-medium">
          <ChevronDown className={`h-4 w-4 transition-transform ${isTagsOpen ? "rotate-180" : ""}`} />
          Tags {selectedTags.length > 0 && `(${selectedTags.length} selected)`}
        </button>

        {isTagsOpen && (
          <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-lg max-h-40 overflow-y-auto">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagToggle(tag)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedTags.includes(tag) ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                {tag}
              </button>
            ))}
            {tags.length === 0 && <p className="text-gray-500 text-sm">Loading tags...</p>}
          </div>
        )}
      </div>
    </div>
  )
}

