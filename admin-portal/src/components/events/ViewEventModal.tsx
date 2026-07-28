import React from "react"
import { X, Pencil, Trash2, Share2 } from "lucide-react"
import { toast } from "sonner"
import type { EventItem } from "./CreateEventForm"

interface ViewEventModalProps {
  event: EventItem | null
  onClose: () => void
  onEdit?: (event: EventItem) => void
  onDelete?: (event: EventItem) => void
  onShare?: (event: EventItem) => void
}

const DEFAULT_EVENT_IMAGE =
  "https://images.unsplash.com/photo-1740065592671-9cb593ee9b78?q=80&w=1173&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"

export const ViewEventModal: React.FC<ViewEventModalProps> = ({
  event,
  onClose,
  onEdit,
  onDelete,
  onShare
}) => {
  if (!event) return null

  const formatEventDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return dateString
      const datePart = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      })
      const timePart = date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      })
      return `${datePart}, ${timePart}`
    } catch {
      return dateString
    }
  }

  const handleCopyLink = () => {
    const url = `http://localhost:3000/events/${event.id}`
    navigator.clipboard.writeText(url)
    toast.success(`Copied Event URL: ${url}`)
  }

  const renderMarkdownDescription = (text: string) => {
    if (!text)
      return (
        <p className="text-gray-500 italic">
          No description provided for this event.
        </p>
      )

    const lines = text.split(/\r?\n/)
    const elements: React.ReactNode[] = []
    let listItems: string[] = []

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul
            key={`ul-${elements.length}`}
            className="list-disc list-inside space-y-1.5 my-3 text-slate-700 pl-2"
          >
            {listItems.map((li, idx) => (
              <li key={idx} className="leading-relaxed">
                {formatInlineMarkdown(li)}
              </li>
            ))}
          </ul>
        )
        listItems = []
      }
    }

    const formatInlineMarkdown = (line: string): React.ReactNode => {
      // Check for markdown image ![alt](url)
      const imgRegex = /!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g
      const imgMatch = imgRegex.exec(line)
      if (imgMatch) {
        return (
          <span className="block my-3">
            <img
              src={imgMatch[2]}
              alt={imgMatch[1] || "Event image"}
              className="max-h-72 w-auto rounded-lg border border-gray-200 shadow-xs object-contain"
              onError={(e) => {
                ;(e.target as HTMLImageElement).style.display = "none"
              }}
            />
            {imgMatch[1] && (
              <span className="block text-[11px] text-gray-500 mt-1 italic">
                {imgMatch[1]}
              </span>
            )}
          </span>
        )
      }

      // Format links [title](url) and **bold**
      const parts: React.ReactNode[] = []
      let remaining = line
      let idx = 0
      const tokenRegex =
        /(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\))|(\*\*([^*]+)\*\*)/g
      let lastIndex = 0
      let match: RegExpExecArray | null

      while ((match = tokenRegex.exec(remaining)) !== null) {
        if (match.index > lastIndex) {
          parts.push(remaining.substring(lastIndex, match.index))
        }
        if (match[1]) {
          parts.push(
            <a
              key={idx++}
              href={match[3]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline font-medium cursor-pointer"
            >
              {match[2]}
            </a>
          )
        } else if (match[4]) {
          parts.push(
            <strong key={idx++} className="font-bold text-slate-900">
              {match[5]}
            </strong>
          )
        }
        lastIndex = tokenRegex.lastIndex
      }

      if (lastIndex < remaining.length) {
        parts.push(remaining.substring(lastIndex))
      }

      return parts.length > 0 ? parts : line
    }

    lines.forEach((rawLine, idx) => {
      const line = rawLine.trim()
      if (line.startsWith("- ") || line.startsWith("* ")) {
        listItems.push(line.substring(2))
      } else {
        flushList()
        if (!line) {
          elements.push(<div key={`space-${idx}`} className="h-2" />)
        } else if (line.startsWith("### ")) {
          elements.push(
            <h4
              key={`h4-${idx}`}
              className="text-base font-bold text-slate-900 mt-4 mb-2"
            >
              {formatInlineMarkdown(line.substring(4))}
            </h4>
          )
        } else if (line.startsWith("## ")) {
          elements.push(
            <h3
              key={`h3-${idx}`}
              className="text-lg font-bold text-slate-900 mt-5 mb-2 border-b border-gray-100 pb-1"
            >
              {formatInlineMarkdown(line.substring(3))}
            </h3>
          )
        } else if (line.startsWith("# ")) {
          elements.push(
            <h2
              key={`h2-${idx}`}
              className="text-xl font-bold text-slate-900 mt-5 mb-2 border-b border-gray-200 pb-1"
            >
              {formatInlineMarkdown(line.substring(2))}
            </h2>
          )
        } else {
          elements.push(
            <p
              key={`p-${idx}`}
              className="text-sm text-slate-700 leading-relaxed"
            >
              {formatInlineMarkdown(line)}
            </p>
          )
        }
      }
    })
    flushList()

    return <div className="space-y-1.5">{elements}</div>
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-none max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-xl border border-gray-400 my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Simple Official Government-Style Header */}
        <div className="px-6 py-3.5 border-b border-gray-300 bg-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#a82020] inline-block" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              OFFICIAL EVENT RECORD — {event.eventType} ({event.visibility})
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-gray-600 hover:text-black p-1 transition-colors cursor-pointer"
            title="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Top Rectangular Cover Image */}
          <div className="w-full h-52 border border-gray-300 bg-gray-100 overflow-hidden mb-6 rounded-none">
            <img
              src={event.imageUrl || DEFAULT_EVENT_IMAGE}
              alt={event.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                ;(e.target as HTMLImageElement).src = DEFAULT_EVENT_IMAGE
              }}
            />
          </div>

          {/* Simple Government Site Specification Table */}
          <div className="border border-gray-300 divide-y divide-gray-300 w-full text-xs">
            <div className="flex flex-col sm:flex-row">
              <div className="bg-gray-100 sm:w-1/3 p-3 font-bold text-gray-700 uppercase border-b sm:border-b-0 sm:border-r border-gray-300 flex items-center">
                EVENT NAME
              </div>
              <div className="bg-white sm:w-2/3 p-3 font-bold text-slate-900 text-sm">
                {event.name}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row">
              <div className="bg-gray-100 sm:w-1/3 p-3 font-bold text-gray-700 uppercase border-b sm:border-b-0 sm:border-r border-gray-300 flex items-center">
                ORGANIZED BY
              </div>
              <div className="bg-white sm:w-2/3 p-3 font-semibold text-slate-800">
                {event.organizedBy}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row">
              <div className="bg-gray-100 sm:w-1/3 p-3 font-bold text-gray-700 uppercase border-b sm:border-b-0 sm:border-r border-gray-300 flex items-center">
                VENUE / LOCATION
              </div>
              <div className="bg-white sm:w-2/3 p-3 font-semibold text-slate-800">
                {event.place}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row">
              <div className="bg-gray-100 sm:w-1/3 p-3 font-bold text-gray-700 uppercase border-b sm:border-b-0 sm:border-r border-gray-300 flex items-center">
                START DATE & TIME
              </div>
              <div className="bg-white sm:w-2/3 p-3 font-bold text-slate-900">
                {formatEventDate(event.startDate)}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row">
              <div className="bg-gray-100 sm:w-1/3 p-3 font-bold text-gray-700 uppercase border-b sm:border-b-0 sm:border-r border-gray-300 flex items-center">
                END DATE & TIME
              </div>
              <div className="bg-white sm:w-2/3 p-3 font-semibold text-slate-800">
                {formatEventDate(event.endDate)}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row">
              <div className="bg-gray-100 sm:w-1/3 p-3 font-bold text-gray-700 uppercase border-b sm:border-b-0 sm:border-r border-gray-300 flex items-center">
                REGISTRATION LIMIT
              </div>
              <div className="bg-white sm:w-2/3 p-3 font-semibold text-slate-800">
                {event.registrationLimit
                  ? `${event.registrationLimit} seats available`
                  : "Unlimited (No restriction)"}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row">
              <div className="bg-gray-100 sm:w-1/3 p-3 font-bold text-gray-700 uppercase border-b sm:border-b-0 sm:border-r border-gray-300 flex items-center">
                STATUS & VISIBILITY
              </div>
              <div className="bg-white sm:w-2/3 p-3 font-semibold text-slate-800">
                {event.startRegistrationsNow ?? true
                  ? "Registrations Open"
                  : "Starts Later"}{" "}
                — {event.visibility} ({event.eventType})
              </div>
            </div>
          </div>

          {/* Description at the end - simple rectangular box */}
          <div className="mt-6">
            <div className="bg-gray-100 border border-gray-300 px-3.5 py-2 font-bold text-gray-700 uppercase text-xs">
              DESCRIPTION & DETAILS
            </div>
            <div className="bg-white border-x border-b border-gray-300 p-4 text-xs text-slate-800 leading-relaxed font-normal min-h-24">
              {renderMarkdownDescription(event.description)}
            </div>
          </div>
        </div>

        {/* Rectangular Simple Footer */}
        <div className="shrink-0 bg-gray-100 border-t border-gray-300 px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onShare ? () => onShare(event) : handleCopyLink}
            className="px-3.5 py-1.5 bg-white hover:bg-gray-200 border border-gray-400 text-slate-800 font-bold uppercase text-xs rounded-none transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-[#a82020]" />
            <span>COPY LINK</span>
          </button>

          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onEdit(event)
                }}
                className="px-4 py-1.5 border border-gray-400 bg-white hover:bg-gray-200 text-slate-800 font-bold uppercase text-xs rounded-none transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5 text-blue-700" />
                <span>EDIT EVENT</span>
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onDelete(event)
                }}
                className="px-4 py-1.5 border border-red-300 bg-white hover:bg-red-50 text-red-700 font-bold uppercase text-xs rounded-none transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>DELETE EVENT</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-1.5 bg-[#222] hover:bg-black text-white font-bold uppercase text-xs rounded-none transition-colors cursor-pointer"
            >
              CLOSE
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
