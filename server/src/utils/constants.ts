export const DEFAULT_AVATAR_URL =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80';

/**
 * Checks if a string is a base64 image data URI or raw base64 string
 */
export const isBase64Image = (str?: string | null): boolean => {
  if (!str || typeof str !== 'string') return false;
  const trimmed = str.trim();
  if (trimmed.startsWith('data:image/')) return true;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/')) {
    return false;
  }
  // Check if it matches base64 pattern and is substantial length
  if (trimmed.length > 100 && /^[A-Za-z0-9+/=]+$/.test(trimmed)) {
    return true;
  }
  return false;
};
