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
import { Button } from '../ui/button';

interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
  onApplyCrop: (croppedDataUrl: string) => void;
}

const VIEWPORT_SIZE = 280;

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
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
    if (!isDragging) return;
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setOffset({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y,
      });
    }
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomStep = 0.08;
    const newZoom =
      e.deltaY < 0
        ? Math.min(zoom + zoomStep, 4)
        : Math.max(zoom - zoomStep, 0.5);
    setZoom(parseFloat(newZoom.toFixed(2)));
  };

  const handleReset = () => {
    setOffset({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setFitMode('cover');
  };

  const handleRotate = () => {
    setRotation((r) => (r + 90) % 360);
  };

  const handleApply = () => {
    if (!imageRef.current || !naturalSize.width || !naturalSize.height) {
      onApplyCrop(imageSrc);
      return;
    }

    try {
      const canvas = document.createElement('canvas');
      canvas.width = resolution;
      canvas.height = resolution;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        onApplyCrop(imageSrc);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Fill white background for transparent images
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, resolution, resolution);

      const scale = resolution / VIEWPORT_SIZE;

      ctx.save();
      // Center origin
      ctx.translate(resolution / 2, resolution / 2);

      // User drag offset
      ctx.translate(offset.x * scale, offset.y * scale);

      // Rotation
      ctx.rotate((rotation * Math.PI) / 180);

      // Sized and zoomed draw
      const drawWidth = baseWidth * zoom * scale;
      const drawHeight = baseHeight * zoom * scale;

      ctx.drawImage(
        imageRef.current,
        -drawWidth / 2,
        -drawHeight / 2,
        drawWidth,
        drawHeight
      );

      ctx.restore();

      const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.92);
      onApplyCrop(croppedDataUrl);
    } catch (err) {
      console.error('Error generating cropped image:', err);
      onApplyCrop(imageSrc);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in-0 duration-150">
      <div className="bg-card text-card-foreground border border-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-md text-primary">
              <Maximize2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Crop & Adjust Picture
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Position, zoom, and adjust resolution
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-accent transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-5 flex flex-col items-center overflow-y-auto space-y-4">
          {/* Interactive Crop Viewport */}
          <div
            className={`relative w-[280px] h-[280px] ${
              maskShape === 'circle' ? 'rounded-full' : 'rounded-lg'
            } overflow-hidden border-2 border-primary/40 bg-muted/50 cursor-grab active:cursor-grabbing select-none touch-none shadow-inner flex items-center justify-center`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
          >
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Crop Preview"
              onLoad={handleImageLoad}
              draggable={false}
              className="absolute pointer-events-none select-none max-w-none origin-center transition-none"
              style={{
                width: `${baseWidth * zoom}px`,
                height: `${baseHeight * zoom}px`,
                left: `calc(50% + ${offset.x}px)`,
                top: `calc(50% + ${offset.y}px)`,
                transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
              }}
            />

            {/* Dark Mask for Circular Framing */}
            {maskShape === 'circle' && (
              <div className="absolute inset-0 rounded-full pointer-events-none border border-white/20 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]"></div>
            )}

            {/* Rule-of-Thirds Grid Guides */}
            <div
              className={`absolute inset-0 ${
                maskShape === 'circle' ? 'rounded-full' : 'rounded-lg'
              } pointer-events-none grid grid-cols-3 grid-rows-3 opacity-25`}
            >
              <div className="border-r border-b border-white"></div>
              <div className="border-r border-b border-white"></div>
              <div className="border-b border-white"></div>
              <div className="border-r border-b border-white"></div>
              <div className="border-r border-b border-white"></div>
              <div className="border-b border-white"></div>
              <div className="border-r border-white"></div>
              <div className="border-r border-white"></div>
              <div></div>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground text-center">
            Drag to pan &bull; Scroll or use slider to zoom &bull; Click tools to rotate
          </p>

          {/* Zoom Slider */}
          <div className="w-full space-y-1.5 px-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
              <span className="flex items-center gap-1.5">
                <ZoomIn className="w-3.5 h-3.5 text-primary" />
                <span>Zoom Scale</span>
              </span>
              <span className="font-mono font-bold text-foreground">
                {Math.round(zoom * 100)}%
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(parseFloat((z - 0.1).toFixed(2)), 0.5))}
                className="w-7 h-7 bg-muted hover:bg-accent rounded-md flex items-center justify-center text-foreground font-bold transition-colors cursor-pointer text-sm"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <input
                type="range"
                min="0.5"
                max="4"
                step="0.02"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="flex-1 accent-primary cursor-pointer h-1.5 bg-muted rounded-lg appearance-none"
              />
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(parseFloat((z + 0.1).toFixed(2)), 4))}
                className="w-7 h-7 bg-muted hover:bg-accent rounded-md flex items-center justify-center text-foreground font-bold transition-colors cursor-pointer text-sm"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Controls: Fit Mode & Tools */}
          <div className="w-full grid grid-cols-2 gap-2 pt-1">
            {/* Fit Mode Button */}
            <div className="flex items-center bg-muted/60 p-1 rounded-lg border border-border">
              <button
                type="button"
                onClick={() => {
                  setFitMode('cover');
                  setOffset({ x: 0, y: 0 });
                }}
                className={`flex-1 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  fitMode === 'cover'
                    ? 'bg-card text-foreground shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Fill (Cover)
              </button>
              <button
                type="button"
                onClick={() => {
                  setFitMode('contain');
                  setOffset({ x: 0, y: 0 });
                }}
                className={`flex-1 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  fitMode === 'contain'
                    ? 'bg-card text-foreground shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Fit Entire
              </button>
            </div>

            {/* Shape Preview Toggle */}
            <div className="flex items-center bg-muted/60 p-1 rounded-lg border border-border">
              <button
                type="button"
                onClick={() => setMaskShape('circle')}
                className={`flex-1 py-1 flex items-center justify-center gap-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  maskShape === 'circle'
                    ? 'bg-card text-foreground shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Circle Preview"
              >
                <Circle className="w-3 h-3" />
                <span>Circle</span>
              </button>
              <button
                type="button"
                onClick={() => setMaskShape('square')}
                className={`flex-1 py-1 flex items-center justify-center gap-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  maskShape === 'square'
                    ? 'bg-card text-foreground shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Square Preview"
              >
                <Square className="w-3 h-3" />
                <span>Square</span>
              </button>
            </div>
          </div>

          {/* Quick Actions: Rotate, Reset & Resolution Selection */}
          <div className="w-full flex items-center justify-between gap-2 pt-1 border-t border-border/60">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleRotate}
                className="px-2.5 py-1.5 text-xs bg-muted hover:bg-accent rounded-md text-foreground flex items-center gap-1.5 font-medium transition-colors cursor-pointer border border-border"
                title="Rotate 90 degrees"
              >
                <RotateCw className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Rotate 90&deg;</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-2.5 py-1.5 text-xs bg-muted hover:bg-accent rounded-md text-foreground flex items-center gap-1.5 font-medium transition-colors cursor-pointer border border-border"
                title="Reset all adjustments"
              >
                <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Reset</span>
              </button>
            </div>

            {/* Resolution Selector */}
            <div className="flex items-center gap-1 bg-muted/70 p-0.5 rounded-md border border-border text-[11px]">
              <span className="text-muted-foreground pl-1.5 pr-0.5 font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Res:</span>
              </span>
              {[
                { label: '320p', value: 320 },
                { label: '512p (HD)', value: 512 },
                { label: '800p', value: 800 },
              ].map((res) => (
                <button
                  key={res.value}
                  type="button"
                  onClick={() => setResolution(res.value)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-all cursor-pointer ${
                    resolution === res.value
                      ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {res.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-muted/30 border-t border-border flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="cursor-pointer text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleApply}
            className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer text-xs flex items-center gap-1.5 shadow-sm"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply &amp; Save Picture</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

