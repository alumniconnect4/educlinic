import React, { useState, useRef } from "react"
import { X, Upload, ImagePlus, Loader2, GripVertical } from "lucide-react"
import { toast } from "sonner"
import type { AlbumItem } from "./CreateAlbumForm"

interface AddImagesModalProps {
  album: AlbumItem
  onClose: () => void
  onUpload: (
    albumId: number,
    images: string[],
    onProgress?: (percent: number, current: number, totalCount: number) => void
  ) => Promise<void>
  isUploading: boolean
}

export const AddImagesModal: React.FC<AddImagesModalProps> = ({
  album,
  onClose,
  onUpload,
  isUploading
}) => {
  const [previews, setPreviews] = useState<string[]>([])
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [currentUploadingIndex, setCurrentUploadingIndex] = useState<number>(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const BATCH_LIMIT = 10

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isUploading) return
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const remainingSlots = BATCH_LIMIT - previews.length
    if (remainingSlots <= 0) {
      toast.error(`Maximum limit of ${BATCH_LIMIT} images reached for this batch.`)
      e.target.value = ""
      return
    }

    if (files.length > remainingSlots) {
      toast.warning(`Only ${remainingSlots} more image(s) can be added to reach the limit of ${BATCH_LIMIT}.`)
    }

    const filesToProcess = files.slice(0, remainingSlots)

    filesToProcess.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviews(prev => {
          if (prev.length >= BATCH_LIMIT) return prev
          return [...prev, reader.result as string]
        })
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ""
  }

  const removePreview = (idx: number) => {
    if (isUploading) return
    setPreviews(prev => prev.filter((_, i) => i !== idx))
  }

  // ── Drag & Drop reordering ──
  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (isUploading) return
    setDraggedIdx(index)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    if (isUploading) return
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    if (dragOverIdx !== index) {
      setDragOverIdx(index)
    }
  }

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    if (isUploading) return
    e.preventDefault()
    if (draggedIdx === null || draggedIdx === targetIndex) {
      setDraggedIdx(null)
      setDragOverIdx(null)
      return
    }

    setPreviews(prev => {
      const updated = [...prev]
      const [movedItem] = updated.splice(draggedIdx, 1)
      updated.splice(targetIndex, 0, movedItem)
      return updated
    })

    setDraggedIdx(null)
    setDragOverIdx(null)
  }

  const handleDragEnd = () => {
    setDraggedIdx(null)
    setDragOverIdx(null)
  }

  const handleUpload = async () => {
    if (previews.length === 0 || isUploading) return
    setUploadProgress(0)
    setCurrentUploadingIndex(0)
    try {
      await onUpload(album.id, previews, (percent, current) => {
        setUploadProgress(percent)
        setCurrentUploadingIndex(current)
      })
      setPreviews([])
      setUploadProgress(null)
      setCurrentUploadingIndex(0)
      onClose()
    } catch (err) {
      setUploadProgress(null)
      setCurrentUploadingIndex(0)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-sm shadow-xl w-full max-w-xl flex flex-col max-h-[90vh] overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between shrink-0 bg-slate-50">
          <div>
            <h2 className="text-sm font-bold text-[#333] uppercase tracking-wider flex items-center gap-2">
              <ImagePlus className="w-4 h-4 text-slate-800" />
              Add Images
            </h2>
            <p className="text-xs text-gray-400 mt-0.5 font-normal">
              Album: <span className="font-medium text-slate-600">{album.name}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          {/* Progress bar live synced with backend */}
          {isUploading && (
            <div className="space-y-2 bg-slate-50 border border-slate-200 p-4 rounded-sm shadow-2xs">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-slate-800 shrink-0" />
                  <span>
                    Uploading image {currentUploadingIndex > 0 ? currentUploadingIndex : 1} of {previews.length} to cloud storage...
                  </span>
                </span>
                <span className="text-slate-900 font-bold text-sm">{uploadProgress ?? 0}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-[#334155] h-full transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress ?? 0}%` }}
                />
              </div>
              <p className="text-[11px] text-gray-400">
                Please wait while photos are processed and saved to database.
              </p>
            </div>
          )}

          {/* Upload drop zone */}
          <div
            onClick={() => {
              if (isUploading) return
              if (previews.length >= BATCH_LIMIT) {
                toast.error(`Batch limit of ${BATCH_LIMIT} images reached. Delete some or upload current batch.`)
                return
              }
              fileInputRef.current?.click()
            }}
            className={`border-2 border-dashed rounded-sm p-7 text-center transition-all ${
              isUploading
                ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                : previews.length >= BATCH_LIMIT
                ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
                : "border-gray-200 cursor-pointer hover:border-slate-400 hover:bg-slate-50"
            }`}
          >
            <Upload className="w-7 h-7 mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-slate-500 font-medium">Click to select images</p>
            <p className="text-xs text-gray-400 mt-0.5">
              PNG, JPG, WEBP — max 10 images per batch
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              disabled={isUploading}
              className="hidden"
              onChange={handleFiles}
            />
          </div>

          {/* Preview grid with Drag & Drop */}
          {previews.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Selected ({previews.length}/{BATCH_LIMIT})
                </p>
                <span className="text-[10px] text-slate-400 font-normal">
                  Drag thumbnails to reorder before uploading
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                {previews.map((src, idx) => {
                  const isDragging = draggedIdx === idx
                  const isDragOver = dragOverIdx === idx
                  const isCurrentlyUploadingThis = isUploading && currentUploadingIndex === idx + 1

                  return (
                    <div
                      key={idx}
                      draggable={!isUploading}
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDrop={(e) => handleDrop(e, idx)}
                      onDragEnd={handleDragEnd}
                      className={`relative group aspect-square rounded-sm overflow-hidden border transition-all ${
                        isUploading
                          ? "opacity-60 cursor-not-allowed border-gray-200"
                          : "cursor-grab active:cursor-grabbing select-none"
                      } ${
                        isDragging
                          ? "opacity-30 border-dashed border-slate-400 scale-95"
                          : isDragOver
                          ? "border-slate-800 ring-2 ring-slate-800 scale-[1.02] shadow-md"
                          : isCurrentlyUploadingThis
                          ? "ring-2 ring-blue-500 border-blue-500"
                          : "border-gray-200 hover:border-slate-400 hover:shadow-sm"
                      }`}
                    >
                      {/* Image Thumbnail */}
                      <img
                        src={src}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-full object-cover pointer-events-none"
                      />

                      {/* Top-left Order Badge & Drag handle */}
                      <div className="absolute top-1 left-1 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5">
                        <GripVertical className="w-2.5 h-2.5 text-gray-300" />
                        <span>#{idx + 1}</span>
                      </div>

                      {/* Currently uploading spinner badge */}
                      {isCurrentlyUploadingThis && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center text-white text-xs font-bold gap-1">
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                        </div>
                      )}

                      {/* Top-right Delete Button */}
                      {!isUploading && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            removePreview(idx)
                          }}
                          className="absolute top-1 right-1 bg-slate-800 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 cursor-pointer shadow-xs"
                          title="Remove"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div className="px-6 py-4 border-t border-gray-200 shrink-0 flex items-center justify-end gap-3 bg-gray-50">
          <button
            onClick={onClose}
            disabled={isUploading}
            className="px-3.5 py-1.5 text-xs text-slate-600 border border-gray-200 rounded-sm bg-white hover:bg-gray-100 transition-colors font-medium cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={isUploading || previews.length === 0}
            className="bg-[#334155] hover:bg-[#1e293b] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold px-4 py-1.5 rounded-sm text-xs transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Uploading ({uploadProgress ?? 0}%)...
              </>
            ) : (
              <>
                <ImagePlus className="w-3.5 h-3.5" />
                Upload {previews.length > 0
                  ? `${previews.length} Image${previews.length > 1 ? "s" : ""}`
                  : "Images"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
