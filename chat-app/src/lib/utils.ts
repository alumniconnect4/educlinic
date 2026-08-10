import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCloudinaryUrl(url: string, size = 160): string {
  if (!url || typeof url !== 'string') return url;
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    const uploadIndex = url.indexOf('/upload/');
    if (uploadIndex !== -1) {
      const prefix = url.substring(0, uploadIndex + 8);
      const rest = url.substring(uploadIndex + 8);
      const transform = `c_fill,g_face,w_${size},h_${size},q_auto,f_auto/`;
      if (
        rest.startsWith('c_fill') ||
        rest.startsWith('w_') ||
        rest.startsWith('c_scale') ||
        rest.startsWith('c_crop')
      ) {
        return prefix + transform + rest.replace(/^[^/]+\//, '');
      }
      return prefix + transform + rest;
    }
  }
  return url;
}

export function getAvatarUrl(
  userOrName?:
    | string
    | { name?: string; avatar?: string; avatarUrl?: string }
    | null,
  avatarParam?: string | null,
  size = 160
): string {
  let url: string | undefined | null = null;

  if (typeof userOrName === 'object' && userOrName !== null) {
    url = userOrName.avatarUrl || userOrName.avatar || avatarParam;
  } else {
    url = avatarParam;
  }

  if (url && typeof url === 'string' && url.trim() !== '') {
    const trimmed = url.trim();
    if (
      trimmed.startsWith('http://') ||
      trimmed.startsWith('https://') ||
      trimmed.startsWith('data:') ||
      trimmed.startsWith('blob:')
    ) {
      return formatCloudinaryUrl(trimmed, size);
    }
    const apiBase =
      (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000';
    const baseUrl = apiBase.replace(/\/api\/?$/, '');
    return formatCloudinaryUrl(
      `${baseUrl}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`,
      size
    );
  }

  return `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%23cbd5e1'/><circle cx='50' cy='38' r='18' fill='%2364748b'/><path d='M14 88 a36 36 0 0 1 72 0 Z' fill='%2364748b'/></svg>`;
}
