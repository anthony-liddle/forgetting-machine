/**
 * Central timing constants for all animation durations.
 * All values are in milliseconds unless noted in the variable name.
 */
export const TIMING = {
  // Phase transitions
  PHASE_FADE_OUT: 300,       // .phase fade-out (matches --fade-duration CSS var)

  // Invitation / splash
  SPLASH_HOLD: 1200,         // How long the large title holds before animating
  SPLASH_HEADING_TRANSITION: 800, // Heading font-size shrink duration (also set in CSS)
  SPLASH_FORM_DELAY: 200,    // Delay after heading starts settling before form fades in
  SPLASH_FORM_FADE_IN: 600,  // Form opacity transition duration (also set in CSS)

  // Broadcast
  BROADCAST_FADE_IN: 1000,   // Secret text opacity fade-in (also set in CSS)

  // Silence
  SILENCE_FADE_IN_CSS: 3000, // "Gone." opacity transition — must match CSS .silence__text transition
  SILENCE_HOLD: 2000,        // Hold duration before fade-out begins
  SILENCE_FADE_OUT: 1000,    // "Gone." fade-out + wait before calling onReset
} as const;
