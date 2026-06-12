import { pbkdf2Sync, randomBytes, timingSafeEqual } from 'node:crypto';

const ITERATIONS = 100_000;
const KEY_LENGTH = 32;

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, 'sha256');
  return `${salt.toString('base64')}:${hash.toString('base64')}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [saltB64, expectedHashB64] = stored.split(':');
  if (!saltB64 || !expectedHashB64) return false;
  const salt = Buffer.from(saltB64, 'base64');
  const hash = pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, 'sha256');
  const expected = Buffer.from(expectedHashB64, 'base64');
  if (hash.length !== expected.length) return false;
  return timingSafeEqual(hash, expected);
}
