import { describe, it, expect } from 'vitest';
import { STATIC_CHARS, getRandomStaticChar } from '../characters';

describe('STATIC_CHARS', () => {
  it('contains block characters', () => {
    expect(STATIC_CHARS).toContain('\u2591');
    expect(STATIC_CHARS).toContain('\u2592');
    expect(STATIC_CHARS).toContain('\u2593');
  });

  it('contains space as final dissolution', () => {
    expect(STATIC_CHARS).toContain(' ');
  });
});

describe('getRandomStaticChar', () => {
  it('returns a character from the STATIC_CHARS set', () => {
    for (let i = 0; i < 20; i++) {
      const char = getRandomStaticChar();
      expect(STATIC_CHARS).toContain(char);
    }
  });
});
