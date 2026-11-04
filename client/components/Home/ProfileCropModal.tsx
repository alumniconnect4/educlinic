'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  Check,
  X,
  Maximize2,
  Circle,
  Square,
  Sparkles,
} from 'lucide-react';

interface ProfileCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
  onApplyCrop: (croppedDataUrl: string) => void;
}

const VIEWPORT_SIZE = 280;

export const ProfileCropModal: React.FC<ProfileCropModalProps> = ({
  isOpen,
  imageSrc,
  onClose,
  onApplyCrop,
}) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [fitMode, setFitMode] = useState<'cover' | 'contain'>('cover');
  const [resolution, setResolution] = useState<number>(512);
  const [maskShape, setMaskShape] = useState<'circle' | 'square'>('circle');

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isOpen) {
      setOffset({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
      setFitMode('cover');
    }
  }, [isOpen, imageSrc]);

  if (!isOpen) return null;

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    setNaturalSize({ width: naturalWidth, height: naturalHeight });
  };

  const isRotated = rotation % 180 !== 0;
  const visualNaturalWidth = isRotated ? naturalSize.height : naturalSize.width;
  const visualNaturalHeight = isRotated ? naturalSize.width : naturalSize.height;

  const minVisual = Math.min(visualNaturalWidth, visualNaturalHeight) || 1;
  const maxVisual = Math.max(visualNaturalWidth, visualNaturalHeight) || 1;

  const baseScale =
    fitMode === 'cover'
      ? VIEWPORT_SIZE / minVisual
      : VIEWPORT_SIZE / maxVisual;

  const baseWidth = naturalSize.width * baseScale;
  const baseHeight = naturalSize.height * baseScale;

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch drag handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      const touch = e.touches[0];
      setDragStart({
        x: touch.clientX - offset.x,
        y: touch.clientY - offset.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setOffset({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleRotate = (angle: number) => {
    setRotation((prev) => (prev + angle + 360) % 360);
  };

  const handleReset = () => {
    setOffset({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setFitMode('cover');
  };

  const handleCropAndApply = () => {
    if (!imageRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = resolution;
    canvas.height = resolution;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.clearRect(0, 0, resolution, resolution);
    ctx.save();

    // Center pivot point
    ctx.translate(resolution / 2, resolution / 2);

    const scaleFactor = resolution / VIEWPORT_SIZE;
    ctx.translate(offset.x * scaleFactor, offset.y * scaleFactor);
    ctx.rotate((rotation * Math.PI) / 180);

    const currentBaseWidth = baseWidth * scaleFactor * zoom;
    const currentBaseHeight = baseHeight * scaleFactor * zoom;

    ctx.drawImage(
      imageRef.current,
      -currentBaseWidth / 2,
      -currentBaseHeight / 2,
      currentBaseWidth,
      currentBaseHeight
    );

    ctx.restore();

    const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    onApplyCrop(croppedDataUrl);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col border border-gray-100 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <Maximize2 className="h-5 w-5 text-[#d60000]" />
            <h3 className="font-bold text-gray-900 text-lg">Crop & Adjust Photo</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 flex flex-col items-center space-y-4">
          {/* Interactive Viewport Canvas */}
          <div
            className="relative flex items-center justify-center overflow-hidden bg-gray-900 rounded-xl select-none cursor-grab active:cursor-grabbing border-2 border-dashed border-gray-300"
            style={{ width: VIEWPORT_SIZE, height: VIEWPORT_SIZE }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Image Element */}
            <img
              ref={imageRef}
              src={imageSrc}
              alt="To crop"
              onLoad={handleImageLoad}
              draggable={false}
              className="absolute pointer-events-none transition-transform duration-75 origin-center max-w-none"
              style={{
                width: `${baseWidth * zoom}px`,
                height: `${baseHeight * zoom}px`,
                transform: `translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg)`,
              }}
            />

            {/* Circular or Square Vignette Overlay */}
            <div
              className={`absolute inset-0 pointer-events-none border-2 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] ${
                maskShape === 'circle' ? 'rounded-full' : 'rounded-none'
              }`}
            />

            {/* Rule of thirds grid lines */}
            <div
              className={`absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-30 ${
                maskShape === 'circle' ? 'rounded-full overflow-hidden' : ''
              }`}
            >
              <div className="border-r border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-b border-white" />
              <div className="border-r border-white" />
              <div className="border-r border-white" />
              <div />
            </div>

            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-[10px] text-white/90 backdrop-blur-xs pointer-events-none">
              Drag to reposition
            </div>
          </div>

          {/* Controls Panel */}
          <div className="w-full space-y-3 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
            {/* Zoom Slider */}
            <div className="flex items-center space-x-3">
              <ZoomOut className="h-4 w-4 text-gray-400 shrink-0" />
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#d60000]"
              />
              <ZoomIn className="h-4 w-4 text-gray-400 shrink-0" />
              <span className="text-xs text-gray-500 font-mono w-10 text-right">
                {Math.round(zoom * 100)}%
              </span>
            </div>

            {/* Rotation and Fit Controls */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-200 text-xs">
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => handleRotate(-90)}
                  className="px-2 py-1 bg-white border border-gray-200 hover:bg-gray-100 rounded text-gray-700 flex items-center gap-1 transition"
                  title="Rotate Counter-Clockwise"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>-90°</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRotate(90)}
                  className="px-2 py-1 bg-white border border-gray-200 hover:bg-gray-100 rounded text-gray-700 flex items-center gap-1 transition"
                  title="Rotate Clockwise"
                >
                  <RotateCw className="h-3.5 w-3.5" />
                  <span>+90°</span>
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-2 py-1 text-gray-500 hover:text-gray-800 transition"
                >
                  Reset
                </button>
              </div>

              {/* Mask Shape Toggle */}
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => setMaskShape('circle')}
                  className={`p-1 rounded border transition ${
                    maskShape === 'circle'
                      ? 'bg-red-50 text-[#d60000] border-red-200 font-semibold'
                      : 'bg-white text-gray-500 border-gray-200'
                  }`}
                  title="Circle Crop Mask"
                >
                  <Circle className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setMaskShape('square')}
                  className={`p-1 rounded border transition ${
                    maskShape === 'square'
                      ? 'bg-red-50 text-[#d60000] border-red-200 font-semibold'
                      : 'bg-white text-gray-500 border-gray-200'
                  }`}
                  title="Square Crop Mask"
                >
                  <Square className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Fit mode & Resolution Selector */}
            <div className="flex items-center justify-between text-xs pt-1 text-gray-600">
              <div className="flex items-center space-x-2">
                <span>Fit:</span>
                <button
                  type="button"
                  onClick={() => setFitMode('cover')}
                  className={`px-2 py-0.5 rounded transition ${
                    fitMode === 'cover'
                      ? 'bg-white shadow-2xs font-bold text-[#d60000] border border-red-200'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Fill
                </button>
                <button
                  type="button"
                  onClick={() => setFitMode('contain')}
                  className={`px-2 py-0.5 rounded transition ${
                    fitMode === 'contain'
                      ? 'bg-white shadow-2xs font-bold text-[#d60000] border border-red-200'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Fit In
                </button>
              </div>

              <div className="flex items-center space-x-1">
                <span>Resolution:</span>
                <select
                  value={resolution}
                  onChange={(e) => setResolution(parseInt(e.target.value, 10))}
                  className="bg-white border border-gray-200 text-gray-700 rounded px-1.5 py-0.5 text-xs outline-none focus:border-[#d60000]"
                >
                  <option value={256}>256px</option>
                  <option value={512}>512px (HD)</option>
                  <option value={1024}>1024px (Ultra)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-end space-x-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCropAndApply}
            className="px-4 py-2 bg-[#d60000] hover:bg-[#b30000] text-white rounded-lg text-sm font-semibold flex items-center space-x-1.5 shadow-sm transition cursor-pointer"
          >
            <Check className="h-4 w-4" />
            <span>Apply Crop</span>
          </button>
        </div>
      </div>
    </div>
  );
};

