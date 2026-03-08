import { describe, it, expect } from 'vitest';
import { generateComposition } from '../musicComposer';
import type { SoundscapeState } from 'soundscape-engine';

function allNotes(state: SoundscapeState) {
  return state.tracks.flatMap((t) => t.notes);
}

function stripIds(state: SoundscapeState) {
  return state.tracks.map((t) => ({
    presetId: t.presetId,
    notes: t.notes.map(({ pitch, startTime, duration, velocity }) => ({
      pitch,
      startTime,
      duration,
      velocity,
    })),
  }));
}

describe('generateComposition – metadata', () => {
  it('produces 70-beat compositions at 70 BPM', () => {
    const state = generateComposition(0);
    expect(state.metadata.tempo).toBe(70);
    expect(state.metadata.lengthBeats).toBe(70);
    expect(state.metadata.timeSignature).toEqual([4, 4]);
  });

  it('always has exactly 3 tracks', () => {
    expect(generateComposition(0).tracks).toHaveLength(3);
    expect(generateComposition(150).tracks).toHaveLength(3);
  });

  it('track preset IDs are strings, bell, piano in order', () => {
    const state = generateComposition(75);
    expect(state.tracks[0].presetId).toBe('strings');
    expect(state.tracks[1].presetId).toBe('bell');
    expect(state.tracks[2].presetId).toBe('piano');
  });
});

describe('generateComposition – complexity 0', () => {
  it('strings track has notes at complexity 0', () => {
    expect(generateComposition(0).tracks[0].notes.length).toBeGreaterThan(0);
  });

  it('bell track is empty at complexity 0', () => {
    expect(generateComposition(0).tracks[1].notes).toHaveLength(0);
  });

  it('piano track is empty at complexity 0', () => {
    expect(generateComposition(0).tracks[2].notes).toHaveLength(0);
  });
});

describe('generateComposition – layer entry thresholds', () => {
  it('bell track is empty at or below complexity 0.20 (charCount=30)', () => {
    expect(generateComposition(30).tracks[1].notes).toHaveLength(0);
  });

  it('bell track has notes above complexity 0.20 (charCount=32)', () => {
    expect(generateComposition(32).tracks[1].notes.length).toBeGreaterThan(0);
  });

  it('piano track is empty at or below complexity 0.40 (charCount=60)', () => {
    expect(generateComposition(60).tracks[2].notes).toHaveLength(0);
  });

  it('piano track has notes above complexity 0.40 (charCount=62)', () => {
    expect(generateComposition(62).tracks[2].notes.length).toBeGreaterThan(0);
  });
});

describe('generateComposition – complexity scaling', () => {
  it('higher charCount produces more total notes', () => {
    const low = allNotes(generateComposition(10)).length;
    const high = allNotes(generateComposition(140)).length;
    expect(high).toBeGreaterThan(low);
  });

  it('charCount is capped at 150 (150 and 5000 produce identical notes)', () => {
    expect(stripIds(generateComposition(150))).toEqual(
      stripIds(generateComposition(5000)),
    );
  });
});

describe('generateComposition – chord inversions', () => {
  it('at low complexity only root position is used (all notes same across cycles)', () => {
    const state = generateComposition(10); // complexity ~0.07, root only
    const strings = state.tracks[0];
    // With only root voicing, cycle 0 and cycle 1 should use the same Fmaj7 pitches
    const fmaj7Cycles = strings.notes.filter(
      (n) => n.startTime < 8 || (n.startTime >= 16 && n.startTime < 24),
    );
    const cycle0Pitches = strings.notes
      .filter((n) => n.startTime < 8)
      .map((n) => n.pitch)
      .sort();
    const cycle1Pitches = strings.notes
      .filter((n) => n.startTime >= 16 && n.startTime < 24)
      .map((n) => n.pitch)
      .sort();
    expect(cycle0Pitches).toEqual(cycle1Pitches);
    expect(fmaj7Cycles.length).toBeGreaterThan(0);
  });

  it('at high complexity strings notes vary between cycles (inversions rotate)', () => {
    const state = generateComposition(150); // complexity 1.0, all inversions
    const strings = state.tracks[0];
    const cycle0Pitches = new Set(
      strings.notes.filter((n) => n.startTime < 8).map((n) => n.pitch),
    );
    const cycle1Pitches = new Set(
      strings.notes
        .filter((n) => n.startTime >= 16 && n.startTime < 24)
        .map((n) => n.pitch),
    );
    // Different inversions → different pitch sets
    expect([...cycle0Pitches].sort().join(',')).not.toEqual(
      [...cycle1Pitches].sort().join(','),
    );
  });
});

describe('generateComposition – note validity', () => {
  const state = generateComposition(120);
  const notes = allNotes(state);

  it('all notes have startTime >= 0', () => {
    expect(notes.every((n) => n.startTime >= 0)).toBe(true);
  });

  it('all notes end at or before beat 70', () => {
    expect(notes.every((n) => n.startTime + n.duration <= 70)).toBe(true);
  });

  it('all pitches are valid MIDI (0–127)', () => {
    expect(notes.every((n) => n.pitch >= 0 && n.pitch <= 127)).toBe(true);
  });

  it('all velocities are in range 1–127', () => {
    expect(notes.every((n) => n.velocity >= 1 && n.velocity <= 127)).toBe(true);
  });

  it('all note IDs are unique across all tracks', () => {
    const ids = notes.map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('generateComposition – fade zone', () => {
  it('notes at beat >= 50 have lower average velocity than early notes', () => {
    const state = generateComposition(150);
    const notes = allNotes(state);
    const early = notes.filter((n) => n.startTime < 8);
    const fade = notes.filter((n) => n.startTime >= 50 && n.startTime < 58);
    expect(early.length).toBeGreaterThan(0);
    expect(fade.length).toBeGreaterThan(0);
    const avgEarly = early.reduce((s, n) => s + n.velocity, 0) / early.length;
    const avgFade = fade.reduce((s, n) => s + n.velocity, 0) / fade.length;
    expect(avgFade).toBeLessThan(avgEarly);
  });
});

describe('generateComposition – mixer', () => {
  it('mixer has an entry for each track ID', () => {
    const state = generateComposition(75);
    for (const track of state.tracks) {
      expect(state.mixer.tracks[track.id]).toBeDefined();
    }
  });

  it('masterVolume is 0.72', () => {
    expect(generateComposition(0).mixer.masterVolume).toBe(0.72);
  });
});
