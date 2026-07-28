import React, { useState, useRef } from "react"
import { CalendarPlus, Upload, X, Loader2 } from "lucide-react"

export const SCHOOL_CATEGORIES = [
  "School of Engineering",
  "School of Sciences",
  "School of Agriculture",
  "School of Business Studies",
  "School of Computer Applications",
  "School of Humanities",
  "School of Education",
  "School of Law",
  "School of Pharmacy",
  "School of Medicine",
  "Alumni Association",
  "Institution Wide"
]

export interface CreateEventFormData {
  name: string
  description: string
  organizedBy: string
  place: string
  eventType: "OFFLINE" | "ONLINE"
  visibility: "GLOBAL" | "DEPARTMENTAL"
  startDate: string
  endDate: string
  imageUrl: string
  startRegistrationsNow?: boolean
  registrationLimit?: number | "" | null
}

export type EventFormData = CreateEventFormData;

export interface EventItem extends CreateEventFormData {
  id: number
  createdAt?: string
  updatedAt?: string
  startRegistrationsNow?: boolean
  registrationLimit?: number | null
  _count?: {
    registrations: number
  }
  verifiedRegistrationsCount?: number
}

interface CreateEventFormProps {
  onSubmit: (formData: CreateEventFormData) => Promise<void>
  isCreating: boolean
}

export const CreateEventForm: React.FC<CreateEventFormProps> = ({
  onSubmit,
  isCreating
}) => {
  const [formData, setFormData] = useState<CreateEventFormData>({
    name: "",
    description: "",
    organizedBy: "",
    place: "",
    eventType: "OFFLINE",
    visibility: "GLOBAL",
    startDate: "",
    endDate: "",
    imageUrl: "",
    startRegistrationsNow: true,
    registrationLimit: ""
  })

  const [imageMode, setImageMode] = useState<"FILE" | "URL">("FILE")
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    await onSubmit(formData)
    // Reset on success
    setFormData({
      name: "",
      description: "",
      organizedBy: "",
      place: "",
      eventType: "OFFLINE",
      visibility: "GLOBAL",
      startDate: "",
      endDate: "",
      imageUrl: "",
      startRegistrationsNow: true,
      registrationLimit: ""
    })
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-sm flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 shrink-0">
        <h3 className="text-[#333] font-bold text-sm uppercase tracking-wider flex items-center gap-2">
          <CalendarPlus className="w-4 h-4 text-slate-800" />
          NEW EVENT REGISTRATION
        </h3>
        <p className="text-xs text-gray-500 mt-0.5 font-normal">
          Create a new student or alumni meetup event
        </p>
      </div>

      {/* Form Content */}
      <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Event Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
              EVENT TITLE <span className="text-red-500">*</span>
            </label>
            <input
              required
              placeholder="e.g. Annual Alumni Meetup 2026"
              className="w-full h-10 rounded-sm border border-gray-300 bg-white px-3 text-sm focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-colors"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          {/* Organized By */}
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

          {/* Location / Venue */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
              VENUE / LOCATION <span className="text-red-500">*</span>
            </label>
            <input
              required
              placeholder="e.g. Main Campus Auditorium"
              className="w-full h-10 rounded-sm border border-gray-300 bg-white px-3 text-sm focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-colors"
              value={formData.place}
              onChange={(e) => setFormData({ ...formData, place: e.target.value })}
            />
          </div>

          {/* Event Type & Visibility */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                EVENT TYPE <span className="text-red-500">*</span>
              </label>
              <select
                required
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

          {/* Start Date & End Date */}
          <div className="space-y-3">
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
            <div className="flex items-center gap-2 pt-1">
              <input
                id="start-reg-now"
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
                htmlFor="start-reg-now"
                className="text-xs font-semibold text-gray-700 cursor-pointer select-none"
              >
                Start registrations now (Open immediately)
              </label>
            </div>
          </div>

          {/* Cover Image Upload / URL */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                COVER IMAGE
              </label>
              <div className="flex gap-2 text-[11px] font-semibold text-gray-500">
                <button
                  type="button"
                  onClick={() => setImageMode("FILE")}
                  className={`hover:text-slate-800 ${
                    imageMode === "FILE" ? "text-slate-900 font-bold underline" : ""
                  }`}
                >
                  Upload File
                </button>
                <span>|</span>
                <button
                  type="button"
                  onClick={() => setImageMode("URL")}
                  className={`hover:text-slate-800 ${
                    imageMode === "URL" ? "text-slate-900 font-bold underline" : ""
                  }`}
                >
                  Paste URL
                </button>
              </div>
            </div>

            {imageMode === "FILE" ? (
              <div className="border border-dashed border-gray-300 rounded-sm p-3 bg-gray-50 text-center hover:bg-gray-100 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="create-event-file"
                />
                <label
                  htmlFor="create-event-file"
                  className="cursor-pointer flex items-center justify-center gap-2 text-xs text-gray-600 font-medium"
                >
                  <Upload className="w-4 h-4 text-gray-500" />
                  <span>Choose Cover Image</span>
                </label>
              </div>
            ) : (
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                className="w-full h-10 rounded-sm border border-gray-300 bg-white px-3 text-xs focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-colors"
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
              />
            )}

            {formData.imageUrl && (
              <div className="relative mt-2 h-24 rounded-sm border border-gray-200 overflow-hidden bg-gray-100">
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, imageUrl: "" })}
                  className="absolute top-1 right-1 bg-slate-900/80 text-white p-1 rounded-full hover:bg-slate-900"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Description */}
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
              rows={8}
              placeholder="Provide event details, itinerary, or instructions... You can use # Headings, **bold**, - lists, [Link text](https://url) or ![image alt](https://url)"
              className="w-full min-h-[140px] max-h-[350px] rounded-sm border border-gray-300 bg-white p-3.5 text-sm focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-colors overflow-y-auto leading-relaxed"
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

          {/* Submit Button (Matching Admin Portal Navy Button Style) */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isCreating}
              className="w-full h-11 bg-[#334155] hover:bg-[#1e293b] disabled:bg-gray-400 text-white text-xs font-bold uppercase tracking-wider rounded-sm transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>CREATING EVENT...</span>
                </>
              ) : (
                <span>CREATE EVENT PROFILE</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
