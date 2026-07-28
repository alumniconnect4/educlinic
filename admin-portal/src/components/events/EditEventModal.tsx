import React, { useState, useEffect, useRef } from "react"
import { X, Pencil, Upload, Loader2 } from "lucide-react"
import { SCHOOL_CATEGORIES, type EventItem } from "./CreateEventForm"

interface EditEventModalProps {
  event: EventItem | null
  onClose: () => void
  onSubmit: (eventId: number, data: any) => Promise<void>
  isUpdating: boolean
}

export const EditEventModal: React.FC<EditEventModalProps> = ({
  event,
  onClose,
  onSubmit,
  isUpdating
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    organizedBy: "",
    place: "",
    eventType: "OFFLINE" as "OFFLINE" | "ONLINE",
    visibility: "GLOBAL" as "GLOBAL" | "DEPARTMENTAL",
    startDate: "",
    endDate: "",
    imageUrl: "",
    startRegistrationsNow: true,
    registrationLimit: "" as number | ""
  })
  const [imageMode, setImageMode] = useState<"FILE" | "URL">("FILE")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatForInput = (isoString: string) => {
    if (!isoString) return ""
    const date = new Date(isoString)
    if (isNaN(date.getTime())) return ""
    const offset = date.getTimezoneOffset() * 60000
    const localDate = new Date(date.getTime() - offset)
    return localDate.toISOString().slice(0, 16)
  }

  useEffect(() => {
    if (event) {
      setFormData({
        name: event.name || "",
        description: event.description || "",
        organizedBy: event.organizedBy || "",
        place: event.place || "",
        eventType: event.eventType,
        visibility: event.visibility,
        startDate: formatForInput(event.startDate),
        endDate: formatForInput(event.endDate),
        imageUrl: event.imageUrl || "",
        startRegistrationsNow: event.startRegistrationsNow ?? true,
        registrationLimit: event.registrationLimit ?? ""
      })
      setImageMode("FILE")
    }
  }, [event])

  if (!event) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, imageUrl: reader.result as string }))
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(event.id, formData)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-sm max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150 my-auto">
        <div className="bg-slate-900 px-6 py-3.5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Pencil className="w-4 h-4 text-[#a82020]" />
            <h3 className="text-sm font-bold uppercase tracking-wider">EDIT EVENT</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
              EVENT TITLE <span className="text-red-500">*</span>
            </label>
            <input
              required
              className="w-full h-10 rounded-sm border border-gray-300 bg-white px-3 text-sm focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-colors"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                ORGANIZED BY <span className="text-red-500">*</span>
              </label>
              <select
                required
                className="w-full h-10 rounded-sm border border-gray-300 bg-white px-3 text-sm text-gray-700 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-colors"
                value={formData.organizedBy}
                onChange={(e) =>
                  setFormData({ ...formData, organizedBy: e.target.value })
                }
              >
                <option value="" disabled>
                  Select school / organizing body...
                </option>
                {SCHOOL_CATEGORIES.map((school) => (
                  <option key={school} value={school}>
                    {school}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                LOCATION / VENUE <span className="text-red-500">*</span>
              </label>
              <input
                required
                className="w-full h-10 rounded-sm border border-gray-300 bg-white px-3 text-sm focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-colors"
                value={formData.place}
                onChange={(e) => setFormData({ ...formData, place: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                EVENT TYPE <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full h-10 rounded-sm border border-gray-300 bg-white px-3 text-xs text-gray-700 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-colors"
                value={formData.eventType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    eventType: e.target.value as "OFFLINE" | "ONLINE"
                  })
                }
              >
                <option value="OFFLINE">Offline (In-Person)</option>
                <option value="ONLINE">Online (Virtual)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                REGISTRATION LIMIT
              </label>
              <input
                type="number"
                min="1"
                placeholder="No limit (Optional)"
                className="w-full h-10 rounded-sm border border-gray-300 bg-white px-3 text-xs text-gray-700 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-colors"
                value={formData.registrationLimit ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    registrationLimit: e.target.value ? Number(e.target.value) : ""
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                START DATE & TIME <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  required
                  type="date"
                  className="w-full h-10 rounded-sm border border-gray-300 bg-white px-3 text-xs text-gray-700 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-colors"
                  value={formData.startDate ? formData.startDate.split("T")[0] : ""}
                  onChange={(e) => {
                    const val = e.target.value
                    if (!val) {
                      setFormData({ ...formData, startDate: "" })
                    } else {
                      const timePart = formData.startDate.split("T")[1]?.slice(0, 5) || "09:00"
                      setFormData({ ...formData, startDate: `${val}T${timePart}` })
                    }
                  }}
                />
                <input
                  required
                  type="time"
                  className="w-full h-10 rounded-sm border border-gray-300 bg-white px-3 text-xs text-gray-700 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-colors"
                  value={formData.startDate ? formData.startDate.split("T")[1]?.slice(0, 5) || "" : ""}
                  onChange={(e) => {
                    const val = e.target.value
                    const datePart = formData.startDate.split("T")[0] || new Date().toISOString().split("T")[0]
                    setFormData({ ...formData, startDate: `${datePart}T${val}` })
                  }}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                END DATE & TIME <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  required
                  type="date"
                  className="w-full h-10 rounded-sm border border-gray-300 bg-white px-3 text-xs text-gray-700 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-colors"
                  value={formData.endDate ? formData.endDate.split("T")[0] : ""}
                  onChange={(e) => {
                    const val = e.target.value
                    if (!val) {
                      setFormData({ ...formData, endDate: "" })
                    } else {
                      const timePart = formData.endDate.split("T")[1]?.slice(0, 5) || "17:00"
                      setFormData({ ...formData, endDate: `${val}T${timePart}` })
                    }
                  }}
                />
                <input
                  required
                  type="time"
                  className="w-full h-10 rounded-sm border border-gray-300 bg-white px-3 text-xs text-gray-700 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-colors"
                  value={formData.endDate ? formData.endDate.split("T")[1]?.slice(0, 5) || "" : ""}
                  onChange={(e) => {
                    const val = e.target.value
                    const datePart = formData.endDate.split("T")[0] || (formData.startDate.split("T")[0] || new Date().toISOString().split("T")[0])
                    setFormData({ ...formData, endDate: `${datePart}T${val}` })
                  }}
                />
              </div>
            </div>

            {/* Start Registrations Checkbox */}
            <div className="flex items-center gap-2 sm:col-span-2 pt-1">
              <input
                id="edit-start-reg-now"
                type="checkbox"
                checked={formData.startRegistrationsNow ?? true}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    startRegistrationsNow: e.target.checked
                  })
                }
                className="w-4 h-4 rounded border-gray-300 text-slate-800 focus:ring-slate-800 cursor-pointer"
              />
              <label
                htmlFor="edit-start-reg-now"
                className="text-xs font-semibold text-gray-700 cursor-pointer select-none"
              >
                Start registrations now (Open immediately)
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                COVER IMAGE
              </label>
              <div className="flex gap-2 text-[11px] font-semibold text-gray-500">
                <button
                  type="button"
                  onClick={() => setImageMode("FILE")}
                  className={`hover:text-slate-800 cursor-pointer ${
                    imageMode === "FILE" ? "text-slate-900 font-bold underline" : ""
                  }`}
                >
                  Upload File
                </button>
                <span>|</span>
                <button
                  type="button"
                  onClick={() => setImageMode("URL")}
                  className={`hover:text-slate-800 cursor-pointer ${
                    imageMode === "URL" ? "text-slate-900 font-bold underline" : ""
                  }`}
                >
                  Paste URL
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-gray-50 p-3 rounded border border-gray-200">
              {/* Left: Old / Current Image Thumbnail */}
              <div className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded border border-gray-300 overflow-hidden bg-white relative">
                <img
                  src={
                    formData.imageUrl ||
                    event.imageUrl ||
                    "https://images.unsplash.com/photo-1740065592671-9cb593ee9b78?q=80&w=1173&auto=format&fit=crop"
                  }
                  alt="Cover Preview"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-0 inset-x-0 bg-slate-900/80 text-white text-[9px] font-bold text-center py-0.5 uppercase">
                  CURRENT
                </span>
              </div>

              {/* Right: Side Option to Upload New or Paste URL */}
              <div className="flex-1">
                {imageMode === "FILE" ? (
                  <div className="border border-dashed border-gray-300 rounded-sm p-3 bg-white text-center hover:bg-gray-50 transition-colors">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="edit-event-file"
                    />
                    <label
                      htmlFor="edit-event-file"
                      className="cursor-pointer flex flex-col items-center justify-center gap-1 text-xs text-gray-700 font-bold"
                    >
                      <Upload className="w-5 h-5 text-gray-500" />
                      <span>Choose New Cover Image</span>
                      <span className="text-[10px] font-normal text-gray-400">
                        Upload to replace current image
                      </span>
                    </label>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      className="w-full h-10 rounded-sm border border-gray-300 bg-white px-3 text-xs focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-colors"
                      value={formData.imageUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, imageUrl: e.target.value })
                      }
                    />
                    <span className="text-[10px] text-gray-400 block">
                      Paste a direct image URL to replace current cover
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                DESCRIPTION
              </label>
              <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                Supports Markdown, Links & Images
              </span>
            </div>
            <textarea
              rows={12}
              placeholder="Provide event details, itinerary, or instructions... You can use # Headings, **bold**, - lists, [Link text](https://url) or ![image alt](https://url)"
              className="w-full min-h-[240px] max-h-[500px] rounded-sm border border-gray-300 bg-white p-3.5 text-sm focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-colors overflow-y-auto leading-relaxed"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-gray-500 pt-0.5">
              <span><b># Heading</b></span>
              <span><b>**bold**</b></span>
              <span><b>- Bullet list</b></span>
              <span><b>[Text](https://url)</b></span>
              <span><b>![Image Alt](https://url)</b></span>
            </div>
          </div>
          </div>

          <div className="shrink-0 px-6 py-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-sm text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="px-5 py-2 bg-[#334155] hover:bg-[#1e293b] disabled:bg-gray-400 text-white font-bold uppercase text-xs tracking-wider rounded-sm transition-colors flex items-center gap-2 cursor-pointer"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>SAVING...</span>
                </>
              ) : (
                <span>SAVE CHANGES</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
