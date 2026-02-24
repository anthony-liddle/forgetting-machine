export const DecayPhase = {
  Clear: 'clear',
  Drift: 'drift',
  Dissolve: 'dissolve',
  Vanish: 'vanish',
} as const;

export type DecayPhase = (typeof DecayPhase)[keyof typeof DecayPhase];

export interface DecayConfig {
  totalDuration: number;
  phases: {
    clear: [number, number];
    drift: [number, number];
    dissolve: [number, number];
    vanish: [number, number];
  };
}

export const DEFAULT_DECAY_CONFIG: DecayConfig = {
  totalDuration: 60000,
  phases: {
    clear: [0, 0.33],
    drift: [0.33, 0.67],
    dissolve: [0.67, 0.92],
    vanish: [0.92, 1.0],
  },
};

export interface CharacterThreshold {
  driftAt: number;
  dissolveAt: number;
  vanishAt: number;
}

export function getDecayPhase(progress: number): DecayPhase {
  if (progress < 0.33) return DecayPhase.Clear;
  if (progress < 0.67) return DecayPhase.Drift;
  if (progress < 0.92) return DecayPhase.Dissolve;
  return DecayPhase.Vanish;
}

function randomInRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function createCharacterThresholds(
  count: number,
  config: DecayConfig,
): CharacterThreshold[] {
  const thresholds: CharacterThreshold[] = [];
  for (let i = 0; i < count; i++) {
    thresholds.push({
      driftAt: randomInRange(config.phases.drift[0], config.phases.drift[1]),
      dissolveAt: randomInRange(config.phases.dissolve[0], config.phases.dissolve[1]),
      vanishAt: randomInRange(config.phases.vanish[0], config.phases.vanish[1]),
    });
  }
  return thresholds;
}

export type DecayTickCallback = (progress: number) => void;

export function startDecayLoop(
  config: DecayConfig,
  onTick: DecayTickCallback,
  onComplete: () => void,
): () => void {
  const startTime = performance.now();
  let animationId: number;
  let stopped = false;

  function tick() {
    if (stopped) return;
    const elapsed = performance.now() - startTime;
    const progress = Math.min(elapsed / config.totalDuration, 1);

    onTick(progress);

    if (progress >= 1) {
      onComplete();
      return;
    }

    animationId = requestAnimationFrame(tick);
  }

  animationId = requestAnimationFrame(tick);

  return () => {
    stopped = true;
    cancelAnimationFrame(animationId);
  };
}
