export const DEFAULT_AVATAR_URL =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80';

/**
 * Checks if a string is a base64 image data URI or raw base64 string
 */
export const isBase64Image = (str?: string | null): boolean => {
  if (!str || typeof str !== 'string') return false;
  const trimmed = str.trim();
  if (trimmed.startsWith('data:image/')) return true;
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('/')
  ) {
    return false;
  }
  // Check if it matches base64 pattern and is substantial length
  if (trimmed.length > 100 && /^[A-Za-z0-9+/=]+$/.test(trimmed)) {
    return true;
  }
  return false;
};

/**
 * Validates that an image is in a supported web format (.png, .jpeg, .jpg, .webp).
 * Strictly rejects HEIC/HEIF and unsupported formats.
 */
export const validateImageFormat = (
  str?: string | null,
  fieldName = 'Image'
): { valid: boolean; message?: string } => {
  if (!str || typeof str !== 'string') return { valid: true };
  const trimmed = str.trim();

  // Check URL format if it's an external link
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    const lower = trimmed.toLowerCase();
    if (
      lower.includes('.heic') ||
      lower.includes('.heif')
    ) {
      return {
        valid: false,
        message: `${fieldName}: HEIC format is not supported. Please upload a PNG, JPEG, JPG, or WebP image.`,
      };
    }
    return { valid: true };
  }

  // Check data URI format
  if (trimmed.startsWith('data:')) {
    const lower = trimmed.toLowerCase();
    if (
      lower.startsWith('data:image/heic') ||
      lower.startsWith('data:image/heif')
    ) {
      return {
        valid: false,
        message: `${fieldName}: HEIC format is not supported. Please upload a PNG, JPEG, JPG, or WebP image.`,
      };
    }

    const match = lower.match(/^data:image\/(png|jpeg|jpg|webp);base64,/);
    if (!match) {
      return {
        valid: false,
        message: `${fieldName}: Unsupported image format. Allowed formats are PNG, JPEG, JPG, and WebP.`,
      };
    }

    // Inspect decoded buffer header to ensure underlying bytes are not HEIC, PDF, etc.
    try {
      const base64Data = trimmed.replace(/^data:image\/[a-z]+;base64,/i, '');
      const buffer = Buffer.from(base64Data.slice(0, 64), 'base64');
      if (buffer.length >= 12) {
        const ftyp = buffer.toString('ascii', 4, 8);
        if (ftyp === 'ftyp') {
          return {
            valid: false,
            message: `${fieldName}: HEIC format is not supported. Please upload a PNG, JPEG, JPG, or WebP image.`,
          };
        }
      }
      if (
        buffer.length >= 4 &&
        buffer[0] === 0x25 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x44 &&
        buffer[3] === 0x46
      ) {
        return {
          valid: false,
          message: `${fieldName}: PDF files are not supported. Please upload a PNG, JPEG, JPG, or WebP image.`,
        };
      }
    } catch {
      // ignore buffer parsing errors
    }
  }

  return { valid: true };
};
