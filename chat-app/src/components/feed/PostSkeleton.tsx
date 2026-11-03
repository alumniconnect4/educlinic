import React from 'react';
import { Skeleton } from '../ui/skeleton';

export const PostSkeleton: React.FC = () => {
  return (
    <div className="bg-card border border-border/60 rounded-md p-4 sm:p-5 shadow-2xs mb-4">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>

      <Skeleton className="h-64 w-full rounded-md mb-4" />

      <div className="flex items-center gap-4 pt-3 border-t border-border/40">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-16" />
      </div>
    </div>
  );
};
