import React from "react"
import { AlertCircle, Loader2 } from "lucide-react"
import type { EventItem } from "./CreateEventForm"

interface DeleteEventModalProps {
  event: EventItem | null
  onClose: () => void
  onConfirm: () => Promise<void>
  isDeleting: boolean
}

export const DeleteEventModal: React.FC<DeleteEventModalProps> = ({
  event,
  onClose,
  onConfirm,
  isDeleting
}) => {
  if (!event) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-sm max-w-md w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">
            DELETE EVENT CONFIRMATION
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Are you sure you want to delete{" "}
            <strong className="text-slate-800 font-bold">{event.name}</strong>?
            This action cannot be undone.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-sm text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            CANCEL
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="flex-1 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white rounded-sm text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>DELETING...</span>
              </>
            ) : (
              <span>DELETE EVENT</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
