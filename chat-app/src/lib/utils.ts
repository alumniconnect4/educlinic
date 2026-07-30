import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAvatarUrl(
  userOrName?: string | { name?: string; avatar?: string; avatarUrl?: string } | null,
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

  const seed = name ? encodeURIComponent(name) : 'DEV';
  return `https://api.dicebear.com/7.x/notionists/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf,ffd5dc`;
}
