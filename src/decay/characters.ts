export const STATIC_CHARS = ['\u2591', '\u2592', '\u2593', ' ', ' ', ' '];

export function getRandomStaticChar(): string {
  return STATIC_CHARS[Math.floor(Math.random() * STATIC_CHARS.length)];
}
