import React, { useState, useRef } from "react"
import { FolderPlus, Upload, X, Loader2, Link2 } from "lucide-react"

export interface CreateAlbumFormData {
  name: string
  description: string
  category: string
  coverImageUrl: string
}

export interface AlbumItem {
  id: number
  name: string
  description?: string | null
  category: string
  coverImageUrl?: string | null
  imageCount?: number
  createdAt?: string
  updatedAt?: string
  _count?: { images: number }
}

interface CreateAlbumFormProps {
  onSubmit: (formData: CreateAlbumFormData) => Promise<void>
  isCreating: boolean
}

export const ALBUM_CATEGORIES = [
  "Convocation",
  "Cultural Events",
  "Sports",
  "Alumni Meet",
  "Seminars & Workshops",
  "Campus Life",
  "Faculty & Staff",
  "Infrastructure",
  "Awards & Recognition",
  "Miscellaneous"
]

export const CreateAlbumForm: React.FC<CreateAlbumFormProps> = ({ onSubmit, isCreating }) => {
  const [formData, setFormData] = useState<CreateAlbumFormData>({
    name: "",
    description: "",
    category: "",
    coverImageUrl: ""
  })
  const [imageMode, setImageMode] = useState<"FILE" | "URL">("FILE")
  const [coverPreview, setCoverPreview] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      setCoverPreview(result)
      setFormData(prev => ({ ...prev, coverImageUrl: result }))
    }
    reader.readAsDataURL(file)
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (name === "coverImageUrl" && imageMode === "URL") {
      setCoverPreview(value)
    }
  }

  const clearImage = () => {
    setCoverPreview("")
    setFormData(prev => ({ ...prev, coverImageUrl: "" }))
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
    setFormData({ name: "", description: "", category: "", coverImageUrl: "" })
    setCoverPreview("")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const labelClass =
    "block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5"

  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-sm flex flex-col h-full overflow-hidden">
      {/* ── Header ── */}
      <div className="px-5 py-4 border-b border-gray-200 shrink-0">
        <h3 className="text-sm font-bold text-[#333] uppercase tracking-wider flex items-center gap-2">
          <FolderPlus className="w-4 h-4 text-slate-800" />
          Create New Album
        </h3>
        <p className="text-xs text-gray-400 mt-1 font-normal normal-case tracking-normal">
          Fill in the details to create a new photo album
        </p>
      </div>

      {/* ── Form Body ── */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

        {/* Album Name */}
        <div>
          <label className={labelClass}>
            Album Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Convocation 2025"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-sm bg-white placeholder-gray-300 text-slate-800 focus:outline-none focus:border-slate-800 transition-colors"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className={labelClass}>
            Category <span className="text-red-500">*</span>
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-sm bg-white text-slate-800 focus:outline-none focus:border-slate-800 transition-colors cursor-pointer"
            required
          >
            <option value="">Select a category</option>
            {ALBUM_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className={labelClass}>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Brief description of the album..."
            rows={3}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-sm bg-white placeholder-gray-300 text-slate-800 focus:outline-none focus:border-slate-800 transition-colors resize-none"
          />
        </div>

        {/* Cover Image */}
        <div>
          <label className={labelClass}>Cover Image</label>

          {/* Mode toggle */}
          <div className="flex bg-slate-100 p-0.5 rounded-sm border border-slate-200 text-xs font-medium mb-3">
            {(["FILE", "URL"] as const).map(mode => (
              <button
                key={mode}
                type="button"
                onClick={() => { setImageMode(mode); clearImage() }}
                className={`flex-1 py-1.5 rounded-sm transition-colors cursor-pointer ${imageMode === mode
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                {mode === "FILE" ? "Upload File" : "Paste URL"}
              </button>
            ))}
          </div>

          {imageMode === "FILE" ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-sm p-5 text-center cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition-all"
            >
              {coverPreview ? (
                <div className="relative">
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    className="w-full h-36 object-cover rounded-sm"
                  />
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); clearImage() }}
                    className="absolute top-1.5 right-1.5 bg-slate-800 text-white rounded-full p-0.5 hover:bg-slate-900 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-7 h-7 mx-auto text-gray-300 mb-2" />
                  <p className="text-xs text-gray-400">Click to browse for cover image</p>
                  <p className="text-[10px] text-gray-300 mt-0.5">PNG, JPG, WEBP up to 10MB</p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <div className="relative">
                <Link2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                <input
                  type="url"
                  name="coverImageUrl"
                  value={formData.coverImageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/cover.jpg"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-sm bg-white placeholder-gray-300 text-slate-800 focus:outline-none focus:border-slate-800 transition-colors pl-9"
                />
              </div>
              {coverPreview && (
                <div className="relative mt-2">
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    className="w-full h-36 object-cover rounded-sm"
                    onError={() => setCoverPreview("")}
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute top-1.5 right-1.5 bg-slate-800 text-white rounded-full p-0.5 hover:bg-slate-900 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Submit Button — Dark Slate / Navy Admin Button matching CreateEventForm ── */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isCreating}
            className="w-full h-11 bg-[#334155] hover:bg-[#1e293b] disabled:bg-gray-300 text-white text-xs font-bold uppercase tracking-wider rounded-sm transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>CREATING ALBUM...</span>
              </>
            ) : (
              <>
                <FolderPlus className="w-4 h-4" />
                <span>CREATE PHOTO ALBUM</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
