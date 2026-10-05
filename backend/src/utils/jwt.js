import { SignJWT, jwtVerify } from 'jose';
import dotenv from 'dotenv';

dotenv.config();
const SECRET_STRING = process.env.JWT_SECRET;
const SECRET_KEY = new TextEncoder().encode(SECRET_STRING);

/**
 * Sign a JWT using jose
 * @param {Object} payload 
 * @param {string} expiresIn 
 * @returns {Promise<string>}
 */
export async function signToken(payload, expiresIn = '7d') {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(SECRET_KEY);
}

/**
 * Verify a JWT using jose
 * @param {string} token 
 * @returns {Promise<Object>}
 */
export async function verifyToken(token) {
  const { payload } = await jwtVerify(token, SECRET_KEY);
  return payload;
}
