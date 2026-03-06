import { AudioEngine, builtInPresets } from 'soundscape-engine';
import type { SoundscapeState } from 'soundscape-engine';
import { TIMING } from '@/timing';

type MusicData = Omit<SoundscapeState, 'presets'>;

class MusicManager {
  private engine = new AudioEngine();
  private state: SoundscapeState | null = null;
  private fadingOut = false;

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
    this.fadingOut = false;
    this.engine.updateState(this.state);
    this.engine.setLoop(false);
    this.engine.play();
  }

  /**
   * Ramp master volume to zero over TIMING.MUSIC_FADE_OUT ms, then stop.
   * Uses requestAnimationFrame so the ramp runs at display refresh rate
   * (~60fps = ~300 steps over 5s), which is smooth enough to be inaudible
   * as a stepped fade.
   */
  fadeOut(): void {
    if (!this.state || this.fadingOut) return;
    this.fadingOut = true;

    const initialVolume = this.state.mixer.masterVolume;
    const duration = TIMING.MUSIC_FADE_OUT;
    const startTime = performance.now();

    const tick = () => {
      if (!this.fadingOut) return;
      const progress = Math.min((performance.now() - startTime) / duration, 1);
      const volume = initialVolume * (1 - progress);
      this.engine.updateMixer({ ...this.state!.mixer, masterVolume: volume });

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        this.engine.stop();
      }
    };

    requestAnimationFrame(tick);
  }
}

export const musicManager = new MusicManager();
