import React, { useState, useEffect } from "react"
import { X, Images, Tag, Loader2, Trash2, ImagePlus, CheckSquare, Square, Eye } from "lucide-react"
import axios from "axios"
import { toast } from "sonner"
import type { AlbumItem } from "./CreateAlbumForm"

interface GalleryImageItem {
  id: number
  imageUrl: string
  createdAt: string
}

interface ViewAlbumModalProps {
  album: AlbumItem | null
  onClose: () => void
  onAddImagesClick: (album: AlbumItem) => void
  onAlbumUpdated?: () => void
}

export const ViewAlbumModal: React.FC<ViewAlbumModalProps> = ({
  album,
  onClose,
  onAddImagesClick,
  onAlbumUpdated
}) => {
  const [images, setImages] = useState<GalleryImageItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [isDeletingBulk, setIsDeletingBulk] = useState(false)

  const fetchAlbumDetails = async () => {
    if (!album) return
    setIsLoading(true)
    try {
      const response = await axios.get(
        `http://localhost:4000/api/gallery/${album.id}`,
        { withCredentials: true }
      )
      setImages(response.data.album.images || [])
      setSelectedIds([])
    } catch (error) {
      console.error("Failed to load album images:", error)
      toast.error("Failed to load album images")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (album) {
      fetchAlbumDetails()
    } else {
      setImages([])
      setSelectedIds([])
    }
  }, [album])

  const toggleSelectImage = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === images.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(images.map(img => img.id))
    }
  }

  const executeBulkDelete = async () => {
    if (selectedIds.length === 0) return
    setIsDeletingBulk(true)
    try {
      await axios.delete(
        "http://localhost:4000/api/gallery/images/bulk",
        {
          data: { imageIds: selectedIds },
          withCredentials: true
        }
      )
      toast.success(`${selectedIds.length} image(s) deleted successfully!`)
      setImages(prev => prev.filter(img => !selectedIds.includes(img.id)))
      setSelectedIds([])
      if (onAlbumUpdated) onAlbumUpdated()
    } catch (error: any) {
      console.error("Failed to bulk delete images:", error)
      toast.error(error.response?.data?.message || "Failed to delete selected images")
    } finally {
      setIsDeletingBulk(false)
    }
  }

  const handleBulkDeletePrompt = () => {
    if (selectedIds.length === 0) return
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
                  Delete {selectedIds.length} Image(s)?
                </h4>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Selected photos will be permanently deleted.
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
                executeBulkDelete()
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

  if (!album) return null

  const isAllSelected = images.length > 0 && selectedIds.length === images.length

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-sm shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between shrink-0 bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">{album.name}</h2>
              {album.category && (
                <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <Tag className="w-2.5 h-2.5" />
                  {album.category}
                </span>
              )}
            </div>
            {album.description && (
              <p className="text-xs text-gray-500 mt-0.5">{album.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onAddImagesClick(album)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-semibold px-3 py-1.5 rounded-sm text-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <ImagePlus className="w-3.5 h-3.5 text-slate-600" />
              <span>Add Images</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Selection Toolbar (if images exist) */}
        {images.length > 0 && (
          <div className="px-6 py-2.5 border-b border-gray-200 bg-slate-50/50 flex items-center justify-between shrink-0 text-xs">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleSelectAll}
                className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
              >
                {isAllSelected ? (
                  <CheckSquare className="w-4 h-4 text-slate-800" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
                <span>{isAllSelected ? "Deselect All" : "Select All"}</span>
              </button>
              {selectedIds.length > 0 && (
                <span className="text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded text-[11px] font-bold">
                  {selectedIds.length} selected
                </span>
              )}
            </div>

            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={handleBulkDeletePrompt}
                disabled={isDeletingBulk}
                className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold px-3 py-1 rounded-sm text-xs transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {isDeletingBulk ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>Delete Selected ({selectedIds.length})</span>
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-2 text-gray-400">
              <Loader2 className="w-7 h-7 animate-spin text-slate-800" />
              <span className="text-xs font-medium">Loading album photos...</span>
            </div>
          ) : images.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center gap-2 text-gray-400 border border-dashed border-gray-200 rounded-sm">
              <Images className="w-8 h-8 text-gray-300" />
              <span className="text-sm font-bold text-gray-700">No Photos in this Album</span>
              <span className="text-xs text-gray-400">
                Click "Add Images" above to upload photos to this album.
              </span>
              <button
                onClick={() => onAddImagesClick(album)}
                className="mt-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-semibold px-4 py-1.5 rounded-sm text-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <ImagePlus className="w-3.5 h-3.5" />
                <span>Upload Photos Now</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((img) => {
                const isSelected = selectedIds.includes(img.id)

                return (
                  <div
                    key={img.id}
                    className={`aspect-square rounded-sm overflow-hidden border group relative bg-slate-100 transition-all ${
                      isSelected
                        ? "ring-2 ring-slate-800 border-transparent shadow-md"
                        : "border-gray-200 shadow-2xs hover:shadow-md"
                    }`}
                  >
                    {/* Checkbox overlay top-left */}
                    <div
                      className="absolute top-2 left-2 z-10 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleSelectImage(img.id)
                      }}
                    >
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center transition-all ${
                          isSelected
                            ? "bg-slate-800 text-white shadow-xs"
                            : "bg-white/90 border border-gray-300 hover:bg-white text-transparent"
                        }`}
                      >
                        ✓
                      </div>
                    </div>

                    {/* Image */}
                    <img
                      src={img.imageUrl}
                      alt={`Gallery ${img.id}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                      onClick={() => setSelectedImage(img.imageUrl)}
                    />

                    {/* View Eye hover overlay center */}
                    <div
                      className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                      onClick={() => setSelectedImage(img.imageUrl)}
                    >
                      <div className="bg-white/90 text-slate-800 p-2 rounded-full shadow-md hover:scale-110 transition-transform">
                        <Eye className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between shrink-0 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <Images className="w-4 h-4 text-gray-400" />
            <span>Total {images.length} photo(s)</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-sm text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* Lightbox Preview */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 p-1 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={selectedImage}
              alt="Full preview"
              className="max-w-full max-h-[85vh] object-contain rounded-sm shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  )
}
