import React, { useState, useEffect } from 'react';
import {
  X,
  Images,
  Tag,
  Loader2,
  Trash2,
  ImagePlus,
  CheckSquare,
  Square,
  Eye,
  Calendar,
  FileText,
  CalendarDays,
  MapPin,
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import type { AlbumItem } from './CreateAlbumForm';
import { Skeleton } from '@/components/ui/Skeleton';

interface GalleryImageItem {
  id: number;
  imageUrl: string;
  createdAt: string;
}

interface ViewAlbumModalProps {
  album: AlbumItem | null;
  onClose: () => void;
  onAddImagesClick: (album: AlbumItem) => void;
  onAlbumUpdated?: () => void;
}

export const ViewAlbumModal: React.FC<ViewAlbumModalProps> = ({
  album,
  onClose,
  onAddImagesClick,
  onAlbumUpdated,
}) => {
  const [images, setImages] = useState<GalleryImageItem[]>([]);
  const [detailedAlbum, setDetailedAlbum] = useState<AlbumItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);
  const [isDescModalOpen, setIsDescModalOpen] = useState(false);

  const fetchAlbumDetails = async () => {
    if (!album) return;
    setIsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await axios.get(`${apiUrl}/gallery/${album.id}`, {
        withCredentials: true,
      });
      const albumData = response.data.album;
      setDetailedAlbum(albumData || album);
      setImages(albumData?.images || []);
      setSelectedIds([]);
    } catch (error) {
      console.error('Failed to load album images:', error);
      toast.error('Failed to load album images');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (album) {
      setDetailedAlbum(album);
      fetchAlbumDetails();
    } else {
      setDetailedAlbum(null);
      setImages([]);
      setSelectedIds([]);
    }
  }, [album]);

  const toggleSelectImage = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === images.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(images.map((img) => img.id));
    }
  };

  const executeBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsDeletingBulk(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      await axios.delete(`${apiUrl}/gallery/images/bulk`, {
        data: { imageIds: selectedIds },
        withCredentials: true,
      });
      toast.success(`${selectedIds.length} image(s) deleted successfully!`);
      setImages((prev) => prev.filter((img) => !selectedIds.includes(img.id)));
      setSelectedIds([]);
      if (onAlbumUpdated) onAlbumUpdated();
    } catch (error: any) {
      console.error('Failed to bulk delete images:', error);
      toast.error(
        error.response?.data?.message || 'Failed to delete selected images'
      );
    } finally {
      setIsDeletingBulk(false);
    }
  };

  const handleBulkDeletePrompt = () => {
    if (selectedIds.length === 0) return;
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
                toast.dismiss(t);
                executeBulkDelete();
              }}
              className="px-3.5 py-1.5 text-xs font-bold bg-slate-900 hover:bg-black text-white rounded-sm transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      ),
      { duration: 8000, position: 'bottom-right' }
    );
  };

  if (!album) return null;

  const currentAlbum = detailedAlbum || album;
  const isAllSelected =
    images.length > 0 && selectedIds.length === images.length;
  const hasDescription = Boolean(currentAlbum.description?.trim());

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-sm shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0 bg-slate-50">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-slate-900">
                {currentAlbum.name}
              </h2>
              {currentAlbum.category && (
                <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <Tag className="w-2.5 h-2.5" />
                  {currentAlbum.category}
                </span>
              )}
            </div>

            {/* Linked Event badge */}
            {currentAlbum.events && currentAlbum.events.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  Linked Event:
                </span>
                <span
                  key={currentAlbum.events[0].id}
                  className="bg-white border border-slate-200 text-slate-800 text-[10px] font-medium px-2 py-0.5 rounded shadow-2xs"
                >
                  {currentAlbum.events[0].name}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
            {hasDescription && (
              <button
                type="button"
                onClick={() => setIsDescModalOpen(true)}
                className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold px-3 py-1.5 rounded-sm text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <FileText className="w-3.5 h-3.5 text-slate-600" />
                <span>View Description</span>
              </button>
            )}
            <button
              onClick={() => onAddImagesClick(currentAlbum)}
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
                <span>{isAllSelected ? 'Deselect All' : 'Select All'}</span>
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Skeleton key={i} className="aspect-square rounded-sm" />
              ))}
            </div>
          ) : images.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center gap-2 text-gray-400 border border-dashed border-gray-200 rounded-sm">
              <Images className="w-8 h-8 text-gray-300" />
              <span className="text-sm font-bold text-gray-700">
                No Photos in this Album
              </span>
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
                const isSelected = selectedIds.includes(img.id);

                return (
                  <div
                    key={img.id}
                    className={`aspect-square rounded-sm overflow-hidden border group relative bg-slate-100 transition-all ${
                      isSelected
                        ? 'ring-2 ring-slate-800 border-transparent shadow-md'
                        : 'border-gray-200 shadow-2xs hover:shadow-md'
                    }`}
                  >
                    {/* Checkbox overlay top-left */}
                    <div
                      className="absolute top-2 left-2 z-10 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelectImage(img.id);
                      }}
                    >
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-slate-800 text-white shadow-xs'
                            : 'bg-white/90 border border-gray-300 hover:bg-white text-transparent'
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
                );
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
          <div
            className="relative max-w-4xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
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

      {/* ── Squarish Description Modal ── */}
      {isDescModalOpen && hasDescription && (
        <div
          className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setIsDescModalOpen(false)}
        >
          <div
            className="bg-white rounded-sm shadow-2xl border border-gray-200 w-full max-w-2xl sm:max-w-3xl overflow-hidden flex flex-col max-h-[88vh] cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between gap-4 bg-gray-50">
              <div className="space-y-0.5 min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-wider">
                  Album Description
                </h3>
                <p className="text-xs text-slate-500 font-medium truncate">
                  {currentAlbum.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsDescModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-sm transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>About this Album</span>
                </h4>
                <div className="text-sm sm:text-[15px] text-slate-700 leading-relaxed whitespace-pre-line bg-gray-50 p-4 sm:p-5 rounded-sm border border-gray-200 font-normal">
                  {currentAlbum.description}
                </div>
              </div>

              {/* Linked Events (if any) */}
              {currentAlbum.events && currentAlbum.events.length > 0 && (
                <div className="pt-3 border-t border-gray-200">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <CalendarDays className="w-4 h-4 text-red-600" />
                    <span>Linked Event</span>
                  </h4>
                  <div className="space-y-2.5">
                    {currentAlbum.events.map((ev) => {
                      const dateText = ev.startDate
                        ? new Date(ev.startDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : null;

                      return (
                        <div
                          key={ev.id}
                          className="flex flex-col sm:flex-row bg-white rounded-sm border border-gray-200 overflow-hidden hover:border-slate-400 transition-all group"
                        >
                          {/* Compact Thumbnail */}
                          <div className="relative sm:w-36 h-24 sm:h-28 shrink-0 bg-slate-100 overflow-hidden">
                            {ev.imageUrl ? (
                              <img
                                src={ev.imageUrl}
                                alt={ev.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 p-2 text-center">
                                <CalendarDays className="w-6 h-6 text-slate-300 mb-0.5" />
                                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                                  Event
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Compact Details */}
                          <div className="flex-1 p-3.5 sm:p-4 flex flex-col justify-center">
                            <div className="space-y-1.5">
                              <h5 className="text-sm font-bold text-slate-900 group-hover:text-red-700 transition-colors leading-snug line-clamp-1">
                                {ev.name}
                              </h5>

                              <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                                {dateText && (
                                  <div className="flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    <span>{dateText}</span>
                                  </div>
                                )}
                                {ev.place && (
                                  <div className="flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    <span className="line-clamp-1">
                                      {ev.place}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-gray-200 bg-gray-50 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsDescModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-sm text-xs font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
