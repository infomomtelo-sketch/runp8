/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  /** JSON object of build-time feature flag defaults, e.g. '{"briefing":true}'. */
  readonly VITE_FEATURE_FLAGS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
