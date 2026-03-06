import { AudioEngine, builtInPresets } from 'soundscape-engine';
import type { SoundscapeState } from 'soundscape-engine';

type MusicData = Omit<SoundscapeState, 'presets'>;

class MusicManager {
  private engine = new AudioEngine();
  private state: SoundscapeState | null = null;

  private async load(): Promise<void> {
    const res = await fetch('/music.json');
    const data: MusicData = await res.json();
    this.state = { ...data, presets: builtInPresets };
  }

  /**
   * Create the AudioContext and fetch the composition. Must be called
   * inside a user-gesture handler (the "Let go" button satisfies this).
   */
  async initialize(): Promise<void> {
    await Promise.all([this.engine.initialize(), this.load()]);
  }

  /**
   * Begin the 60-second through-composed piece. Plays once, no looping.
   */
  start(): void {
    if (!this.state) return;
    this.engine.updateState(this.state);
    this.engine.setLoop(false);
    this.engine.play();
  }

  stop(): void {
    this.engine.stop();
  }
}

export const musicManager = new MusicManager();
