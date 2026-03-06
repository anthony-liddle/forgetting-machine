/**
 * Central timing constants for all animation durations.
 * All values are in milliseconds unless noted in the variable name.
 */
export const TIMING = {
  // Phase transitions
  PHASE_FADE_OUT: 1500, // .phase fade-out

  // Invitation / splash
  SPLASH_FADE_IN_HOLD: 2500, // Hold at opacity 0 before the title starts fading in
  SPLASH_FADE_IN: 4200, // Title opacity fade-in duration (controlled inline in JS)
  SPLASH_HOLD: 7200, // How long after render before the settle animation begins
  SPLASH_HEADING_TRANSITION: 3800, // Heading shrink + slide duration (controlled inline in JS)
  SPLASH_FORM_DELAY: 4500, // Delay after heading starts settling before form fades in
  SPLASH_FORM_FADE_IN: 3900, // Form opacity transition duration

  // Broadcast
  BROADCAST_FADE_IN: 4000, // Secret text opacity fade-in

  // Music
  MUSIC_FADE_OUT: 7000, // Master volume ramp to zero before stopping the engine

  // Silence
  SILENCE_PRE_HOLD: 3000, // Pause before "Gone." begins to appear
  SILENCE_FADE_IN_CSS: 3000, // "Gone." opacity transition
  SILENCE_HOLD: 5000, // Hold duration before fade-out begins
  SILENCE_FADE_OUT: 3000, // Normal fade-out wait
  SILENCE_SKIP_FADE_OUT: 500, // Fast fade-out when the user clicks/keys to skip early
} as const;
