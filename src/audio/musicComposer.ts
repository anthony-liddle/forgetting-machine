import { createNote, createTrack, builtInPresets } from 'soundscape-engine';
import type { SoundscapeState, Track } from 'soundscape-engine';

// ── Constants ────────────────────────────────────────────────────────────────

const TEMPO = 70;
const TOTAL_BEATS = 70;
const CHORD_BEATS = 8;
const FADE_START_BEAT = 50;
const MAX_CHARS = 150;

// Fmaj7 voicings: [bass, inner0, inner1, upper, ext]
const FMAJ7_VOICINGS = [
  { bass: 41, inner: [53, 57] as const, upper: 60, ext: 69 }, // root
  { bass: 45, inner: [57, 60] as const, upper: 64, ext: 65 }, // 1st inv
  { bass: 48, inner: [60, 64] as const, upper: 65, ext: 69 }, // 2nd inv
  { bass: 52, inner: [53, 57] as const, upper: 60, ext: 64 }, // 3rd inv
] as const;

// C major voicings
const C_VOICINGS = [
  { bass: 36, inner: [48, 52] as const, upper: 55, ext: 67 }, // root
  { bass: 40, inner: [52, 55] as const, upper: 60, ext: 64 }, // 1st inv
  { bass: 43, inner: [55, 60] as const, upper: 64, ext: 67 }, // 2nd inv
] as const;

const FMAJ7_SCALE = [53, 55, 57, 59, 60, 62, 64, 65] as const;
const C_SCALE = [60, 62, 64, 65, 67, 69, 71, 72] as const;

// ── Helpers ──────────────────────────────────────────────────────────────────

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

function vel(v: number, fade: number): number {
  return Math.round(Math.max(1, Math.min(127, v * fade)));
}

function fadeFactor(startBeat: number): number {
  if (startBeat < FADE_START_BEAT) return 1.0;
  const t = (startBeat - FADE_START_BEAT) / (TOTAL_BEATS - FADE_START_BEAT);
  return lerp(1.0, 0.4, t);
}

function inversionCount(complexity: number, maxVoicings: number): number {
  if (complexity < 0.3) return 1;
  if (complexity < 0.6) return Math.min(2, maxVoicings);
  if (complexity < 0.8) return Math.min(3, maxVoicings);
  return maxVoicings;
}

// ── Chord block iterator ─────────────────────────────────────────────────────

interface ChordBlock {
  startBeat: number;
  duration: number;
  isFmaj7: boolean;
  cycleIndex: number;
}

function* chordBlocks(): Generator<ChordBlock> {
  let beat = 0;
  let isFmaj7 = true;
  let cycleIndex = 0;
  while (beat < TOTAL_BEATS) {
    const duration = Math.min(CHORD_BEATS, TOTAL_BEATS - beat);
    yield { startBeat: beat, duration, isFmaj7, cycleIndex };
    beat += duration;
    if (!isFmaj7) cycleIndex++;
    isFmaj7 = !isFmaj7;
  }
}

// ── Strings ──────────────────────────────────────────────────────────────────

function buildStringsTrack(complexity: number): Track {
  const track = createTrack('Strings', 'strings');
  const baseVel = Math.round(lerp(45, 75, complexity));

  for (const { startBeat, duration, isFmaj7, cycleIndex } of chordBlocks()) {
    const fade = fadeFactor(startBeat);
    const voicings = isFmaj7 ? FMAJ7_VOICINGS : C_VOICINGS;
    const numVoicings = inversionCount(complexity, voicings.length);
    const v = voicings[cycleIndex % numVoicings];

    // Always: inner[0] + upper (staggered)
    track.notes.push(
      createNote(v.inner[0], startBeat, duration - 0.125, vel(baseVel, fade)),
    );
    track.notes.push(
      createNote(
        v.upper,
        startBeat + 0.25,
        duration - 0.375,
        vel(baseVel - 6, fade),
      ),
    );

    // > 0.20: add inner[1]
    if (complexity > 0.2) {
      track.notes.push(
        createNote(
          v.inner[1],
          startBeat + 0.5,
          duration - 0.625,
          vel(baseVel - 10, fade),
        ),
      );
    }

    // > 0.45: add bass
    if (complexity > 0.45) {
      const bassVel = lerp(40, 65, (complexity - 0.45) / 0.55);
      track.notes.push(
        createNote(v.bass, startBeat, duration - 0.125, vel(bassVel, fade)),
      );
    }

    // > 0.70: add high extension
    if (complexity > 0.7) {
      const extVel = lerp(35, 55, (complexity - 0.7) / 0.3);
      track.notes.push(
        createNote(
          v.ext,
          startBeat + 0.75,
          duration - 0.875,
          vel(extVel, fade),
        ),
      );
    }
  }

  return track;
}

// ── Bell ─────────────────────────────────────────────────────────────────────

function buildBellTrack(complexity: number): Track {
  const track = createTrack('Bell', 'bell');
  if (complexity <= 0.2) return track;

  for (const { startBeat, duration, isFmaj7, cycleIndex } of chordBlocks()) {
    const fade = fadeFactor(startBeat);
    const voicings = isFmaj7 ? FMAJ7_VOICINGS : C_VOICINGS;
    const numVoicings = inversionCount(complexity, voicings.length);
    const v = voicings[cycleIndex % numVoicings];

    if (complexity <= 0.4) {
      // Single accent near chord end
      const accentVel = lerp(55, 72, (complexity - 0.2) / 0.2);
      track.notes.push(
        createNote(
          v.upper,
          startBeat + duration - 1,
          0.25,
          vel(accentVel, fade),
        ),
      );
    } else if (complexity <= 0.65) {
      // 3-note ascending arpeggio: inner[0] → inner[1] → upper
      const tones = [v.inner[0], v.inner[1], v.upper];
      const spacing = (duration - 1) / 2;
      tones.forEach((pitch, i) => {
        const v2 = lerp(88, 74, i / (tones.length - 1));
        track.notes.push(
          createNote(pitch, startBeat + 0.5 + i * spacing, 0.25, vel(v2, fade)),
        );
      });
    } else if (complexity <= 0.85) {
      // 5-note arpeggio: bass → inner[0] → inner[1] → upper → ext
      const tones = [v.bass, v.inner[0], v.inner[1], v.upper, v.ext];
      const spacing = (duration - 1) / (tones.length - 1);
      tones.forEach((pitch, i) => {
        const v2 = lerp(88, 68, i / (tones.length - 1));
        track.notes.push(
          createNote(pitch, startBeat + 0.5 + i * spacing, 0.25, vel(v2, fade)),
        );
      });
    } else {
      // Fast scale run, 16th-note spacing
      const scale = isFmaj7 ? FMAJ7_SCALE : C_SCALE;
      let t = startBeat + 0.5;
      for (let i = 0; i < scale.length; i++) {
        if (t >= startBeat + duration) break;
        track.notes.push(createNote(scale[i], t, 0.25, vel(88 - i * 4, fade)));
        t += 0.25;
      }
    }
  }

  return track;
}

// ── Piano ─────────────────────────────────────────────────────────────────────

function buildPianoTrack(complexity: number): Track {
  const track = createTrack('Piano', 'piano');
  if (complexity <= 0.4) return track;

  let scaleIndex = 0;

  for (const { startBeat, duration, isFmaj7 } of chordBlocks()) {
    const fade = fadeFactor(startBeat);
    const scale = isFmaj7 ? FMAJ7_SCALE : C_SCALE;

    if (complexity <= 0.55) {
      const pitch = scale[scaleIndex % scale.length];
      track.notes.push(
        createNote(
          pitch,
          startBeat + 1,
          2,
          vel(lerp(50, 68, (complexity - 0.4) / 0.15), fade),
        ),
      );
      scaleIndex += 1;
    } else if (complexity <= 0.7) {
      for (let i = 0; i < 2; i++) {
        const pitch = scale[(scaleIndex + i) % scale.length];
        const t = startBeat + 1 + i * 3;
        if (t >= startBeat + duration) break;
        track.notes.push(
          createNote(
            pitch,
            t,
            1,
            vel(lerp(55, 75, (complexity - 0.55) / 0.15), fade),
          ),
        );
      }
      scaleIndex += 2;
    } else if (complexity <= 0.85) {
      for (let i = 0; i < 4; i++) {
        const pitch = scale[(scaleIndex + i) % scale.length];
        const t = startBeat + 1 + i * 0.5;
        if (t >= startBeat + duration) break;
        track.notes.push(
          createNote(
            pitch,
            t,
            0.5,
            vel(lerp(60, 80, (complexity - 0.7) / 0.15), fade),
          ),
        );
      }
      scaleIndex += 4;
    } else {
      for (let i = 0; i < 8; i++) {
        const pitch = scale[(scaleIndex + i) % scale.length];
        const t = startBeat + 1 + i * 0.25;
        if (t >= startBeat + duration) break;
        track.notes.push(
          createNote(
            pitch,
            t,
            0.25,
            vel(lerp(65, 85, (complexity - 0.85) / 0.15), fade),
          ),
        );
      }
      scaleIndex += 8;
    }
  }

  return track;
}

// ── Public API ────────────────────────────────────────────────────────────────

export function generateComposition(charCount: number): SoundscapeState {
  const complexity = Math.min(charCount, MAX_CHARS) / MAX_CHARS;

  const strings = buildStringsTrack(complexity);
  const bell = buildBellTrack(complexity);
  const piano = buildPianoTrack(complexity);

  return {
    metadata: {
      name: 'the forgetting machine',
      tempo: TEMPO,
      timeSignature: [4, 4],
      lengthBeats: TOTAL_BEATS,
    },
    tracks: [strings, bell, piano],
    presets: builtInPresets,
    mixer: {
      tracks: {
        [strings.id]: { volume: 0.72, mute: false, solo: false },
        [bell.id]: { volume: 0.65, mute: false, solo: false },
        [piano.id]: { volume: 0.52, mute: false, solo: false },
      },
      masterVolume: 0.72,
    },
  };
}
