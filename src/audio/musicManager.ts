import { AudioEngine } from 'soundscape-engine';
import type { SoundscapeState } from 'soundscape-engine';
import { TIMING } from '@/timing';
import { generateComposition } from '@/audio/musicComposer';

class MusicManager {
  private engine = new AudioEngine();
  private state: SoundscapeState | null = null;
  private fadingOut = false;

  /**
   * Generate the composition from char count and create the AudioContext.
   * Must be called inside a user-gesture handler (the "Let go" button).
   */
  async initialize(charCount: number): Promise<void> {
    this.state = generateComposition(charCount);
    await this.engine.initialize();
  }

  /**
   * Begin the 70-beat through-composed piece. Plays once, no looping.
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
