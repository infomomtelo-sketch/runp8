import { FeatureFlags, disableFeature, enableFeature, type FeatureName } from '../config/featureFlags';

/**
 * Internal testing panel. Rendered only for partner admins, it flips the
 * Title22 feature flags for the current browser — nobody else is affected, and
 * no deploy is needed either way.
 */

const TOGGLES: { feature: FeatureName; label: string; enabled: boolean }[] = [
  { feature: 'briefing', label: 'Morning Briefing', enabled: FeatureFlags.enableBriefing },
  { feature: 'tello', label: 'Ask Tello', enabled: FeatureFlags.enableTello },
  { feature: 'modern-alerts', label: 'Modern alerts', enabled: FeatureFlags.enableModernAlerts }
];

export default function FeatureFlagAdmin() {
  return (
    <section className="bg-white p-6 rounded-2xl border border-dashed shadow-sm">
      <h2 className="font-bold text-sm text-slate-900">Internal testing</h2>
      <p className="text-xs text-slate-500 mt-1">
        These switches only affect this browser. Turning one off takes effect immediately on reload.
      </p>

      <div className="flex flex-wrap gap-2 mt-4">
        {TOGGLES.map(({ feature, label, enabled }) => (
          <button
            key={feature}
            onClick={() => (enabled ? disableFeature(feature) : enableFeature(feature))}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              enabled
                ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {enabled ? `✓ ${label} on` : `Enable ${label}`}
          </button>
        ))}
      </div>
    </section>
  );
}
