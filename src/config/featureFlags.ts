/**
 * Feature flags for the Title22 integration.
 *
 * Every flag is OFF by default, so a deploy of this code changes nothing for
 * live users. A flag turns on for a single browser only when that browser has
 * the matching localStorage key set to 'true'.
 *
 * Precedence (lowest to highest):
 *   1. `false` — the built-in default for every flag.
 *   2. VITE_FEATURE_FLAGS — a JSON object baked in at build time, e.g.
 *      '{"briefing":true}'. Set it in the Cloudflare Pages environment to move
 *      the default for everybody without editing code.
 *   3. localStorage — a per-browser override, used for internal testing.
 *
 * Enable / disable from the browser console:
 *   localStorage.setItem('feature:briefing', 'true')
 *   localStorage.setItem('feature:tello', 'true')
 *   localStorage.removeItem('feature:briefing')
 *
 * Flags are read once, at module load, so a change takes effect on reload.
 * `enableFeature` / `disableFeature` reload the page for you.
 */

export type FeatureName = 'briefing' | 'tello' | 'modern-alerts';

const STORAGE_PREFIX = 'feature:';

/** localStorage throws in private-mode Safari and is absent outside browsers. */
function safeLocalStorage(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

/** Build-time defaults from the VITE_FEATURE_FLAGS environment variable. */
function environmentDefaults(): Partial<Record<FeatureName, boolean>> {
  const raw = import.meta.env.VITE_FEATURE_FLAGS;
  if (!raw) return {};

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed as Partial<Record<FeatureName, boolean>>;
  } catch (err) {
    console.warn('[featureFlags] VITE_FEATURE_FLAGS is not valid JSON, ignoring it:', err);
    return {};
  }
}

const ENV_DEFAULTS = environmentDefaults();

export function isFeatureEnabled(feature: FeatureName): boolean {
  const stored = safeLocalStorage()?.getItem(`${STORAGE_PREFIX}${feature}`);
  if (stored === 'true') return true;
  if (stored === 'false') return false;
  return ENV_DEFAULTS[feature] === true;
}

export const FeatureFlags = {
  /** Morning briefing tab. */
  enableBriefing: isFeatureEnabled('briefing'),

  /** Tello AI assistant drawer. */
  enableTello: isFeatureEnabled('tello'),

  /** Modern alert styling. */
  enableModernAlerts: isFeatureEnabled('modern-alerts')
} as const;

export function enableFeature(feature: FeatureName): void {
  safeLocalStorage()?.setItem(`${STORAGE_PREFIX}${feature}`, 'true');
  location.reload();
}

export function disableFeature(feature: FeatureName): void {
  safeLocalStorage()?.removeItem(`${STORAGE_PREFIX}${feature}`);
  location.reload();
}
