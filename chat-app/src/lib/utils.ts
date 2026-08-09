import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAvatarUrl(
  userOrName?:
    | string
    | { name?: string; avatar?: string; avatarUrl?: string }
    | null,
  avatarParam?: string | null
) {
  let name: string | undefined = undefined;
  let url: string | undefined | null = null;

  if (typeof userOrName === 'object' && userOrName !== null) {
    name = userOrName.name;
    url = userOrName.avatarUrl || userOrName.avatar || avatarParam;
  } else if (typeof userOrName === 'string') {
    name = userOrName;
    url = avatarParam;
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
      return trimmed;
    }
    const apiBase =
      (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000';
    const baseUrl = apiBase.replace(/\/api\/?$/, '');
    return `${baseUrl}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
  }

  return `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%23cbd5e1'/><circle cx='50' cy='38' r='18' fill='%2364748b'/><path d='M14 88 a36 36 0 0 1 72 0 Z' fill='%2364748b'/></svg>`;
}
