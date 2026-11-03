import React from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

interface CoverImageUploadProps {
  coverImage: string;
  setCoverImage: (val: string) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const CoverImageUpload: React.FC<CoverImageUploadProps> = ({
  coverImage,
  setCoverImage,
  onFileUpload,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Add a cover image URL..."
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
          className="bg-muted/30 border-border/80 text-sm focus-visible:ring-1 focus-visible:ring-[#3b49df] flex-1"
        />
        <div className="relative">
          <Input
            type="file"
            accept="image/*"
            onChange={onFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <Button variant="outline" type="button" className="relative z-0">
            Upload
          </Button>
        </div>
      </div>
      {coverImage && (
        <div
          className="w-full h-40 rounded-md bg-muted bg-cover bg-center border border-border/60"
          style={{ backgroundImage: `url(${coverImage})` }}
        />
      )}
    </div>
  );
};
