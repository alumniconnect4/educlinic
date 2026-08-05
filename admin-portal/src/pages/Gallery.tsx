import { useState, useEffect } from "react"
import { Search, Images, Trash2, X } from "lucide-react"
import { toast } from "sonner"
import axios from "axios"

import { CreateAlbumForm, type CreateAlbumFormData, type AlbumItem } from "@/components/gallery/CreateAlbumForm"
import { AlbumCard } from "@/components/gallery/AlbumCard"
import { AddImagesModal } from "@/components/gallery/AddImagesModal"
import { EditAlbumModal } from "@/components/gallery/EditAlbumModal"
import { ViewAlbumModal } from "@/components/gallery/ViewAlbumModal"
import { Skeleton } from "@/components/ui/Skeleton"

export default function Gallery() {
  const [albums, setAlbums] = useState<AlbumItem[]>([])
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6
  const [isLoading, setIsLoading] = useState(false)

  // Search
  const [searchQuery, setSearchQuery] = useState("")

  // Form & Modals state
  const [isCreating, setIsCreating] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const [addingImagesTo, setAddingImagesTo] = useState<AlbumItem | null>(null)
  const [editingAlbum, setEditingAlbum] = useState<AlbumItem | null>(null)
  const [viewingAlbum, setViewingAlbum] = useState<AlbumItem | null>(null)

  // Fetch albums from backend API
  const fetchAlbums = async () => {
    setIsLoading(true)
    try {
      const offset = (currentPage - 1) * itemsPerPage
      const params = new URLSearchParams()
      if (searchQuery.trim()) params.append("search", searchQuery.trim())

      const queryString = params.toString() ? `?${params.toString()}` : ""
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await axios.get(
        `${apiUrl}/gallery/all/${itemsPerPage}/${offset}${queryString}`,
        { withCredentials: true }
      )
      setAlbums(response.data.albums || [])
      setTotal(response.data.total || 0)
    } catch (error) {
      console.error("Failed to fetch albums:", error)
      toast.error("Failed to load photo albums")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAlbums()
    }, 300)
    return () => clearTimeout(timer)
  }, [currentPage, searchQuery])

  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage))

  // Create album handler
  const handleCreateAlbum = async (formData: CreateAlbumFormData) => {
    setIsCreating(true)
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      await axios.post(
        `${apiUrl}/gallery/create`,
        {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          category: formData.category.trim(),
          coverImageUrl: formData.coverImageUrl || undefined
        },
        { withCredentials: true }
      )

      toast.success("Album created successfully!")
      setCurrentPage(1)
      fetchAlbums()
    } catch (error: any) {
      console.error("Failed to create album:", error)
      toast.error(error.response?.data?.message || "Failed to create album")
    } finally {
      setIsCreating(false)
    }
  }

  // Update album handler
  const handleUpdateAlbum = async (albumId: number, updatedData: any) => {
    setIsUpdating(true)
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      await axios.patch(
        `${apiUrl}/gallery/update/${albumId}`,
        {
          name: updatedData.name.trim(),
          description: updatedData.description.trim() || undefined,
          category: updatedData.category.trim(),
          coverImageUrl: updatedData.coverImageUrl || undefined
        },
        { withCredentials: true }
      )

      toast.success("Album updated successfully!")
      setEditingAlbum(null)
      fetchAlbums()
    } catch (error: any) {
      console.error("Failed to update album:", error)
      toast.error(error.response?.data?.message || "Failed to update album")
    } finally {
      setIsUpdating(false)
    }
  }

  // Add images sequentially for real-time live sync progress bar with backend Cloudinary uploads
  const handleAddImages = async (
    albumId: number,
    images: string[],
    onProgress?: (percent: number, current: number, totalCount: number) => void
  ) => {
    setIsUploading(true)
    try {
      const totalCount = images.length
      for (let i = 0; i < totalCount; i++) {
        const apiUrl = import.meta.env.VITE_API_URL;
        await axios.post(
          `${apiUrl}/gallery/${albumId}/image`,
          { image: images[i] },
          { withCredentials: true }
        )

        const percent = Math.round(((i + 1) / totalCount) * 100)
        if (onProgress) {
          onProgress(percent, i + 1, totalCount)
        }
      }

      toast.success(`${images.length} image${images.length > 1 ? "s" : ""} added successfully!`)
      setAddingImagesTo(null)
      fetchAlbums()
    } catch (error: any) {
      console.error("Failed to upload images:", error)
      toast.error(error.response?.data?.message || "Failed to upload images")
      throw error
    } finally {
      setIsUploading(false)
    }
  }

  // Delete album handler
  const executeDeleteAlbum = async (albumId: number) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      await axios.delete(
        `${apiUrl}/gallery/delete/${albumId}`,
        { withCredentials: true }
      )
      toast.success("Album deleted successfully!")
      fetchAlbums()
    } catch (error: any) {
      console.error("Failed to delete album:", error)
      toast.error(error.response?.data?.message || "Failed to delete album")
    }
  }

  const handleDeleteAlbumPrompt = (album: AlbumItem) => {
    toast.custom(
      (t) => (
        <div className="bg-white border border-gray-200 rounded-sm shadow-xl p-4 w-full max-w-sm font-sans text-slate-800 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Delete Album?
                </h4>
                <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">
                  "{album.name}" and all photos will be removed.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => toast.dismiss(t)}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-sm hover:bg-gray-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => toast.dismiss(t)}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-gray-100 rounded-sm transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                toast.dismiss(t)
                executeDeleteAlbum(album.id)
              }}
              className="px-3.5 py-1.5 text-xs font-bold bg-slate-900 hover:bg-black text-white rounded-sm transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      ),
      { duration: 8000, position: "bottom-right" }
    )
  }

  return (
    <div className="w-full h-[calc(100vh-64px)] min-h-[640px] p-6 lg:p-8 flex flex-col">
      {/* Main Grid: Create Form + Albums Directory List */}
      <div className="w-full flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[360px_1fr] xl:grid-cols-[380px_1fr] gap-6 lg:gap-8 relative">
        {/* Left Panel: Create Album Form */}
        <CreateAlbumForm onSubmit={handleCreateAlbum} isCreating={isCreating} />

        {/* Right Panel: Photo Albums Directory */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-sm flex flex-col h-full overflow-hidden">
          {/* Header Bar inside Right Panel */}
          <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-bold text-[#333] uppercase tracking-wider flex items-center gap-2">
                <Images className="w-4 h-4 text-slate-800" />
                PHOTO ALBUMS
              </h3>
              <span className="bg-slate-100 border border-slate-200 text-slate-700 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                {total} Total
              </span>
            </div>

            {/* Search Bar */}
            <div className="relative w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search albums by name, category..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-9 pr-3 py-1.5 border border-gray-200 rounded-full text-xs w-full sm:w-64 focus:outline-none focus:border-slate-800"
              />
              <Search className="w-4 h-4 absolute left-3 top-2 text-gray-400" />
            </div>
          </div>

          {/* Album Cards List Body */}
          <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex flex-col sm:flex-row bg-white border border-gray-200 rounded-sm overflow-hidden p-0 gap-4">
                    <Skeleton className="sm:w-56 md:w-64 h-44 shrink-0" />
                    <div className="flex-1 p-5 flex flex-col justify-between space-y-3">
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-8 w-28" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : albums.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center gap-2 text-gray-400 border border-dashed border-gray-200 rounded-sm">
                <Images className="w-8 h-8 text-gray-300" />
                <span className="text-sm font-bold text-gray-700">No Albums Found</span>
                <span className="text-xs text-gray-400">
                  Fill in the form on the left to create a new photo album.
                </span>
              </div>
            ) : (
              <div className="space-y-4">
                {albums.map((album) => (
                  <AlbumCard
                    key={album.id}
                    album={album}
                    onAddImages={(alb) => setAddingImagesTo(alb)}
                    onEdit={(alb) => setEditingAlbum(alb)}
                    onDelete={(alb) => handleDeleteAlbumPrompt(alb)}
                    onView={(alb) => setViewingAlbum(alb)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Pagination Footer matching Events Page */}
          {total > 0 && (
            <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between shrink-0 text-xs text-gray-600">
              <div>
                Showing{" "}
                <strong className="font-bold text-slate-800">
                  {Math.min((currentPage - 1) * itemsPerPage + 1, total)}
                </strong>{" "}
                to{" "}
                <strong className="font-bold text-slate-800">
                  {Math.min(currentPage * itemsPerPage, total)}
                </strong>{" "}
                of <strong className="font-bold text-slate-900">{total}</strong> albums
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  className="px-3 py-1.5 rounded border border-gray-200 bg-white text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setCurrentPage(num)}
                    className={`px-3 py-1.5 rounded border text-xs font-bold transition-colors cursor-pointer ${
                      currentPage === num
                        ? "border-slate-800 bg-slate-800 text-white"
                        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  className="px-3 py-1.5 rounded border border-gray-200 bg-white text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {addingImagesTo && (
        <AddImagesModal
          album={addingImagesTo}
          onClose={() => setAddingImagesTo(null)}
          onUpload={handleAddImages}
          isUploading={isUploading}
        />
      )}

      {editingAlbum && (
        <EditAlbumModal
          album={editingAlbum}
          onClose={() => setEditingAlbum(null)}
          onSubmit={handleUpdateAlbum}
          isUpdating={isUpdating}
        />
      )}

      {viewingAlbum && (
        <ViewAlbumModal
          album={viewingAlbum}
          onClose={() => setViewingAlbum(null)}
          onAddImagesClick={(alb) => setAddingImagesTo(alb)}
          onAlbumUpdated={fetchAlbums}
        />
      )}
    </div>
  );
}
