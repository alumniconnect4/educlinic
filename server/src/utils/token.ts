import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const generateToken = ({
  id,
  role,
}: {
  id: number;
  role: string;
}): string => {
  try {
    const token = jwt.sign({ id: id, role: role }, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_TOKEN_EXPIRY,
    });
    return token;
  } catch (err) {
    console.log(err);
    throw err;
  }
};
