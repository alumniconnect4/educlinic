import React, { useState, useEffect, useRef } from "react"
import { X, Pencil, Upload, Loader2, Link2 } from "lucide-react"
import { ALBUM_CATEGORIES, type AlbumItem } from "./CreateAlbumForm"

interface EditAlbumModalProps {
  album: AlbumItem | null
  onClose: () => void
  onSubmit: (albumId: number, updatedData: { name: string; description: string; category: string; coverImageUrl: string }) => Promise<void>
  isUpdating: boolean
}

export const EditAlbumModal: React.FC<EditAlbumModalProps> = ({
  album,
  onClose,
  onSubmit,
  isUpdating
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    coverImageUrl: ""
  })
  const [imageMode, setImageMode] = useState<"FILE" | "URL">("FILE")
  const [coverPreview, setCoverPreview] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (album) {
      setFormData({
        name: album.name || "",
        description: album.description || "",
        category: album.category || "",
        coverImageUrl: album.coverImageUrl || ""
      })
      setCoverPreview(album.coverImageUrl || "")
    }
  }, [album])

  if (!album) return null

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
    await onSubmit(album.id, formData)
  }

  const inputClass =
    "w-full px-3 py-2 text-sm border border-gray-200 rounded-sm bg-white placeholder-gray-300 text-slate-800 focus:outline-none focus:border-slate-800 transition-colors"
  const labelClass = "block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5"

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-sm shadow-xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-sm font-bold text-[#333] uppercase tracking-wider flex items-center gap-2">
              <Pencil className="w-4 h-4 text-slate-800" />
              Edit Album
            </h2>
            <p className="text-xs text-gray-400 mt-0.5 font-normal">
              Update album details and cover image
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div>
            <label className={labelClass}>Album Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Convocation 2025"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Category <span className="text-red-500">*</span></label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={inputClass}
              required
            >
              <option value="">Select a category</option>
              {ALBUM_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Cover Image</label>

            <div className="flex bg-slate-100 p-0.5 rounded-sm border border-slate-200 text-xs font-medium mb-3">
              {(["FILE", "URL"] as const).map(mode => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => { setImageMode(mode); clearImage() }}
                  className={`flex-1 py-1.5 rounded-sm transition-colors ${
                    imageMode === mode
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
                className="border-2 border-dashed border-gray-200 rounded-sm p-4 text-center cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition-all"
              >
                {coverPreview ? (
                  <div className="relative">
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      className="w-full h-32 object-cover rounded-sm"
                    />
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); clearImage() }}
                      className="absolute top-1.5 right-1.5 bg-red-600 text-white rounded-full p-0.5 hover:bg-red-700 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-6 h-6 mx-auto text-gray-300 mb-1.5" />
                    <p className="text-xs text-gray-400">Click to browse for new cover image</p>
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
                    className={`${inputClass} pl-9`}
                  />
                </div>
                {coverPreview && (
                  <div className="relative mt-2">
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      className="w-full h-32 object-cover rounded-sm"
                      onError={() => setCoverPreview("")}
                    />
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute top-1.5 right-1.5 bg-red-600 text-white rounded-full p-0.5 hover:bg-red-700 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-slate-600 border border-gray-200 rounded-sm bg-white hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating || !formData.name.trim() || !formData.category}
              className="bg-[#a82020] hover:bg-[#8f1b1b] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-4 py-1.5 rounded-sm text-xs transition-colors shadow-2xs flex items-center gap-1.5"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
