import type { CookieOptions } from 'express';

export const config = {
  cookieOptions: {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    maxAge: 24 * 60 * 60 * 1000,
  } as CookieOptions,
};

