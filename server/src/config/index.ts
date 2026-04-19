import type { CookieOptions } from 'express';

export const config = {
  cookieOptions: {
    httpOnly: true,
    sameSite: 'none' as const,
    secure: true,
  } as CookieOptions,
};
