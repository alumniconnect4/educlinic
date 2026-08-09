import React, { useState, useEffect, useRef } from 'react';
import type { Message } from '../../types';
import { MoreVertical, Edit2, Copy, Trash2 } from 'lucide-react';
import { useStore } from '../../store/mockData';

interface ChatMessageProps {
  message: Message;
  isMe: boolean;
  onEdit: (msg: Message) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isMe,
  onEdit,
}) => {
  const { deleteMessage } = useStore();
  const [showOptions, setShowOptions] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowOptions(false);
      }
    };

    if (showOptions) {
      document.addEventListener('mousedown', handleClickOutside, true);
      document.addEventListener('touchstart', handleClickOutside, true);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('touchstart', handleClickOutside, true);
    };
  }, [showOptions]);

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setShowOptions(false);
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
    setShowOptions(false);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteMessage(message.id);
      setShowDeleteModal(false);
    } catch (err) {
      console.error('Failed to delete message:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    onEdit(message);
    setShowOptions(false);
  };

  const isImageUrl = (text: string) => {
    return (
      typeof text === 'string' &&
      (text.startsWith('http://') ||
        text.startsWith('https://') ||
        text.startsWith('data:image/')) &&
      (text.match(/\.(jpeg|jpg|gif|png|webp)/i) != null ||
        text.includes('/upload/') ||
        text.includes('cloudinary'))
    );
  };

  return (
    <div
      className={`w-full flex flex-col ${isMe ? 'items-end' : 'items-start'} mb-2 group relative`}
      ref={dropdownRef}
    >
      <div
        className={`flex items-center gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'} max-w-[85%] md:max-w-[75%]`}
      >
        <div
          onClick={() => {
            if (window.innerWidth < 768) {
              setShowOptions(!showOptions);
            }
          }}
          className={`w-fit px-4 py-2.5 text-[15px] leading-snug shadow-sm break-words whitespace-pre-wrap cursor-pointer md:cursor-auto active:scale-[0.98] transition-transform md:active:scale-100 ${
            isMe
              ? 'bg-gradient-to-br from-[#3b49df] to-[#2f3ab2] text-white rounded-2xl rounded-tr-sm'
              : 'bg-muted text-foreground rounded-2xl rounded-tl-sm'
          }`}
        >
          {isImageUrl(message.content) ? (
            <img
              src={message.content}
              alt="Shared image"
              className="max-w-[240px] sm:max-w-xs max-h-60 rounded-lg object-cover my-1"
            />
          ) : (
            message.content
          )}
        </div>

        <div className="opacity-100 group-hover:opacity-100 transition-opacity relative">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="hidden md:block p-1.5 text-muted-foreground hover:bg-muted/50 rounded-full transition-colors"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {showOptions && (
            <div
              className={`absolute bottom-full mb-2 ${isMe ? 'right-0' : 'left-0'} z-50 w-36 bg-card/95 backdrop-blur-xl rounded-xl shadow-xl border border-border/60 py-1.5 text-[13px] overflow-hidden flex flex-col origin-bottom animate-in fade-in zoom-in-95 duration-150`}
            >
              <button
                onClick={handleCopy}
                className="w-full text-left px-4 py-2 flex items-center gap-3 hover:bg-muted/60 transition-colors text-foreground font-medium"
              >
                <Copy className="h-4 w-4 opacity-70" /> Copy
              </button>
              {isMe && (
                <>
                  <button
                    onClick={handleEdit}
                    className="w-full text-left px-4 py-2 flex items-center gap-3 hover:bg-muted/60 transition-colors text-foreground font-medium"
                  >
                    <Edit2 className="h-4 w-4 opacity-70" /> Edit
                  </button>
                  <div className="h-px bg-border/40 mx-2 my-0.5" />
                  <button
                    onClick={handleDelete}
                    className="w-full text-left px-4 py-2 flex items-center gap-3 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 transition-colors text-red-500 font-medium"
                  >
                    <Trash2 className="h-4 w-4 opacity-70" /> Delete
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <span className="text-[10px] text-muted-foreground mt-1 px-1 flex items-center gap-1 opacity-80 font-medium">
        {formatTime(message.createdAt)}
        {message.isEdited && <span className="italic ml-1">(edited)</span>}
      </span>

      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-xl w-full max-w-sm flex flex-col gap-4 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Delete Message</h3>
            <p className="text-[15px] text-zinc-500 dark:text-zinc-400">
              Are you sure you want to delete this message? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 mt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2.5 text-sm font-medium rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2.5 text-sm font-medium rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
