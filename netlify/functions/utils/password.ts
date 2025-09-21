import { pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto";

const ITERATIONS = 150000;
const KEY_LENGTH = 64;
const DIGEST = "sha512";

export const hashPassword = (password: string): string => {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString("hex");
  return `${ITERATIONS}:${salt}:${hash}`;
};

export const verifyPassword = (password: string, stored: string): boolean => {
  const parts = stored.split(":");
  if (parts.length !== 3) {
    return false;
  }
  const [iterationsRaw, salt, hash] = parts;
  const iterations = Number.parseInt(iterationsRaw, 10);
  if (!salt || !hash || Number.isNaN(iterations)) {
    return false;
  }
  const derived = pbkdf2Sync(password, salt, iterations, KEY_LENGTH, DIGEST).toString("hex");
  const storedBuffer = Buffer.from(hash, "hex");
  const derivedBuffer = Buffer.from(derived, "hex");
  if (storedBuffer.length !== derivedBuffer.length) {
    return false;
  }
  return timingSafeEqual(storedBuffer, derivedBuffer);
};
