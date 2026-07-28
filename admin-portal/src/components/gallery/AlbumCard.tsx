import React from "react"
import { ImagePlus, Pencil, Trash2, Images, Tag } from "lucide-react"
import type { AlbumItem } from "./CreateAlbumForm"

interface AlbumCardProps {
  album: AlbumItem
  onAddImages: (album: AlbumItem) => void
  onEdit: (album: AlbumItem) => void
  onDelete: (album: AlbumItem) => void
  onView: (album: AlbumItem) => void
}

const DEFAULT_ALBUM_COVER =
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1170&auto=format&fit=crop"

export const AlbumCard: React.FC<AlbumCardProps> = ({
  album,
  onAddImages,
  onEdit,
  onDelete,
  onView
}) => {
  const imageCount = album._count?.images ?? album.imageCount ?? 0

  return (
    <div className="flex flex-col sm:flex-row bg-white border border-gray-200 rounded-sm overflow-hidden shadow-2xs hover:shadow-sm transition-all group">
      {/* ── Left: Cover Image ── */}
      <div
        onClick={() => onView(album)}
        title="Click to view album"
        className="sm:w-56 md:w-64 sm:h-auto h-44 flex-shrink-0 relative overflow-hidden bg-slate-100 cursor-pointer"
      >
        <img
          src={album.coverImageUrl || DEFAULT_ALBUM_COVER}
          alt={album.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            ;(e.target as HTMLImageElement).src = DEFAULT_ALBUM_COVER
          }}
        />
        {/* Category badge */}
        {album.category && (
          <div className="absolute top-2.5 left-2.5">
            <span className="bg-slate-900/75 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase shadow-xs flex items-center gap-1">
              <Tag className="w-2.5 h-2.5" />
              {album.category}
            </span>
          </div>
        )}
      </div>

      {/* ── Right: Content ── */}
      <div className="flex-1 p-5 md:p-6 flex flex-col justify-between">
        <div>
          {/* Title row with edit/delete icons */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3
              onClick={() => onView(album)}
              title="Click to view album"
              className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors leading-snug cursor-pointer select-none"
            >
              {album.name}
            </h3>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => onEdit(album)}
                title="Edit Album"
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(album)}
                title="Delete Album"
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Photo count line */}
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <Images className="w-4 h-4 text-gray-400 shrink-0" />
            <span>
              {imageCount > 0
                ? `${imageCount} Photo${imageCount !== 1 ? "s" : ""} in this Album`
                : "No photos yet"}
            </span>
          </div>

          {/* Description */}
          {album.description && (
            <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              {album.description}
            </p>
          )}
        </div>

        {/* ── Action Buttons — Red View Album + Light Slate Add Images ── */}
        <div className="pt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onView(album)}
            className="bg-[#a82020] hover:bg-[#8f1b1b] text-white font-medium px-3.5 py-1.5 rounded-sm text-xs transition-colors shadow-2xs cursor-pointer"
          >
            View Album
          </button>
          <button
            type="button"
            onClick={() => onAddImages(album)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-semibold px-3.5 py-1.5 rounded-sm text-xs transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
          >
            <ImagePlus className="w-3.5 h-3.5 text-slate-600" />
            <span>Add Images</span>
          </button>
        </div>
      </div>
    </div>
  )
}
