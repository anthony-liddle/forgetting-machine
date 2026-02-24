import { describe, it, expect } from 'vitest';
import {
  DecayPhase,
  getDecayPhase,
  createCharacterThresholds,
  DEFAULT_DECAY_CONFIG,
} from '../engine';

describe('getDecayPhase', () => {
  it('returns "clear" for progress 0-0.33', () => {
    expect(getDecayPhase(0)).toBe(DecayPhase.Clear);
    expect(getDecayPhase(0.1)).toBe(DecayPhase.Clear);
    expect(getDecayPhase(0.32)).toBe(DecayPhase.Clear);
  });

  it('returns "drift" for progress 0.33-0.67', () => {
    expect(getDecayPhase(0.33)).toBe(DecayPhase.Drift);
    expect(getDecayPhase(0.5)).toBe(DecayPhase.Drift);
    expect(getDecayPhase(0.66)).toBe(DecayPhase.Drift);
  });

  it('returns "dissolve" for progress 0.67-0.92', () => {
    expect(getDecayPhase(0.67)).toBe(DecayPhase.Dissolve);
    expect(getDecayPhase(0.8)).toBe(DecayPhase.Dissolve);
    expect(getDecayPhase(0.91)).toBe(DecayPhase.Dissolve);
  });

  it('returns "vanish" for progress 0.92-1.0', () => {
    expect(getDecayPhase(0.92)).toBe(DecayPhase.Vanish);
    expect(getDecayPhase(1.0)).toBe(DecayPhase.Vanish);
  });
});

describe('createCharacterThresholds', () => {
  it('creates an array of thresholds matching character count', () => {
    const thresholds = createCharacterThresholds(100, DEFAULT_DECAY_CONFIG);
    expect(thresholds.length).toBe(100);
  });

  it('all thresholds are between 0 and 1', () => {
    const thresholds = createCharacterThresholds(50, DEFAULT_DECAY_CONFIG);
    for (const t of thresholds) {
      expect(t.driftAt).toBeGreaterThanOrEqual(0);
      expect(t.driftAt).toBeLessThanOrEqual(1);
      expect(t.dissolveAt).toBeGreaterThanOrEqual(t.driftAt);
      expect(t.vanishAt).toBeGreaterThanOrEqual(t.dissolveAt);
      expect(t.vanishAt).toBeLessThanOrEqual(1);
    }
  });

  it('thresholds fall within their respective phase windows', () => {
    const config = DEFAULT_DECAY_CONFIG;
    const thresholds = createCharacterThresholds(200, config);
    for (const t of thresholds) {
      expect(t.driftAt).toBeGreaterThanOrEqual(config.phases.drift[0]);
      expect(t.driftAt).toBeLessThanOrEqual(config.phases.drift[1]);
      expect(t.dissolveAt).toBeGreaterThanOrEqual(config.phases.dissolve[0]);
      expect(t.dissolveAt).toBeLessThanOrEqual(config.phases.dissolve[1]);
      expect(t.vanishAt).toBeGreaterThanOrEqual(config.phases.vanish[0]);
      expect(t.vanishAt).toBeLessThanOrEqual(config.phases.vanish[1]);
    }
  });
});
