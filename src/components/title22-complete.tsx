import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../integrations/supabase/client';

/**
 * Title22 add-on components: the morning briefing panel and the Tello drawer.
 *
 * Both are rendered only behind their feature flag, so nothing here runs for a
 * user who has not opted in. Each component owns its own fetch, loading state,
 * and error state — a failing endpoint degrades to an inline message instead of
 * breaking the dashboard around it.
 */

/* ------------------------------------------------------------------ */
/* Morning briefing                                                    */
/* ------------------------------------------------------------------ */

type BriefingSeverity = 'info' | 'attention' | 'urgent';

interface BriefingItem {
  id: string;
  title: string;
  detail: string;
  severity: BriefingSeverity;
}

interface BriefingStats {
  caregiversTracked: number;
  coursesComplete: number;
  coursesInProgress: number;
  overdueRenewals: number;
}

interface Briefing {
  generatedAt: string;
  facilityId: string | null;
  headline: string;
  stats: BriefingStats;
  items: BriefingItem[];
  /** 'live' when facility data was read, 'unavailable' when the backend has no data source configured. */
  dataSource: 'live' | 'unavailable';
}

const SEVERITY_STYLES: Record<BriefingSeverity, string> = {
  info: 'border-slate-200 bg-slate-50 text-slate-700',
  attention: 'border-amber-200 bg-amber-50 text-amber-800',
  urgent: 'border-red-200 bg-red-50 text-red-800'
};

const SEVERITY_LABELS: Record<BriefingSeverity, string> = {
  info: 'FYI',
  attention: 'Needs attention',
  urgent: 'Urgent'
};

interface MorningBriefingProps {
  facilityId?: string | null;
}

export function MorningBriefing({ facilityId }: MorningBriefingProps) {
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadBriefing = async () => {
      setLoading(true);
      setError(null);

      try {
        const query = facilityId ? `?facilityId=${encodeURIComponent(facilityId)}` : '';
        const response = await fetch(`/api/briefing${query}`, { signal: controller.signal });

        if (!response.ok) {
          throw new Error(`Briefing request failed (${response.status})`);
        }

        setBriefing((await response.json()) as Briefing);
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error('Could not load the morning briefing:', err);
        setError('The briefing could not be loaded right now. Your training records are unaffected.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void loadBriefing();
    return () => controller.abort();
  }, [facilityId]);

  if (loading) {
    return (
      <section className="bg-white p-6 rounded-2xl border shadow-sm animate-pulse space-y-4">
        <div className="h-5 w-48 bg-slate-100 rounded" />
        <div className="h-3 w-full bg-slate-100 rounded" />
        <div className="h-3 w-2/3 bg-slate-100 rounded" />
      </section>
    );
  }

  if (error || !briefing) {
    return (
      <section className="bg-white p-6 rounded-2xl border shadow-sm">
        <h2 className="font-bold text-lg text-slate-900">🌅 Morning Briefing</h2>
        <p className="text-sm text-slate-500 mt-2">{error ?? 'No briefing is available.'}</p>
      </section>
    );
  }

  const generatedAt = new Date(briefing.generatedAt);

  return (
    <section className="space-y-6">
      <header className="bg-white p-6 rounded-2xl border shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">🌅 Morning Briefing</h2>
            <p className="text-sm text-slate-500 mt-1">{briefing.headline}</p>
          </div>
          <span className="text-xs font-medium text-slate-400 self-start sm:self-center">
            Generated {Number.isNaN(generatedAt.getTime()) ? 'just now' : generatedAt.toLocaleString()}
          </span>
        </div>

        {briefing.dataSource === 'unavailable' && (
          <p className="mt-4 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            Facility data source is not configured on the server, so these figures are empty.
          </p>
        )}
      </header>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard label="Caregivers tracked" value={briefing.stats.caregiversTracked} />
        <StatCard label="Courses complete" value={briefing.stats.coursesComplete} tone="positive" />
        <StatCard label="In progress" value={briefing.stats.coursesInProgress} />
        <StatCard label="Overdue renewals" value={briefing.stats.overdueRenewals} tone="warning" />
      </div>

      <div className="space-y-3">
        {briefing.items.length === 0 ? (
          <p className="text-sm text-slate-500 bg-white p-6 rounded-2xl border shadow-sm">
            Nothing needs your attention this morning.
          </p>
        ) : (
          briefing.items.map((item) => (
            <article
              key={item.id}
              className={`p-4 rounded-xl border transition-all ${SEVERITY_STYLES[item.severity] ?? SEVERITY_STYLES.info}`}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-sm">{item.title}</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                  {SEVERITY_LABELS[item.severity] ?? SEVERITY_LABELS.info}
                </span>
              </div>
              <p className="text-sm mt-1 leading-relaxed opacity-90">{item.detail}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function StatCard({
  label,
  value,
  tone = 'neutral'
}: {
  label: string;
  value: number;
  tone?: 'neutral' | 'positive' | 'warning';
}) {
  const valueColor =
    tone === 'positive' ? 'text-green-600' : tone === 'warning' ? 'text-amber-600' : 'text-slate-900';

  return (
    <div className="bg-white p-4 rounded-2xl border shadow-sm">
      <span className="text-xs font-medium text-slate-500 block">{label}</span>
      <span className={`text-2xl font-black ${valueColor}`}>{value}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tello drawer                                                        */
/* ------------------------------------------------------------------ */

interface TelloMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface TelloDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  facilityId?: string | null;
  userRole?: string | string[] | null;
}

export function TelloDrawer({ isOpen, onClose, facilityId, userRole }: TelloDrawerProps) {
  const [messages, setMessages] = useState<TelloMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const sendQuestion = useCallback(async () => {
    const question = draft.trim();
    if (!question || sending) return;

    const history = [...messages, { role: 'user' as const, content: question }];
    setMessages(history);
    setDraft('');
    setSending(true);
    setError(null);

    try {
      // The endpoint verifies this token when Supabase auth is configured on
      // the server, so Tello cannot be called by anyone who finds the URL.
      const { data } = await supabase.auth.getSession();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (data.session?.access_token) {
        headers.Authorization = `Bearer ${data.session.access_token}`;
      }

      const response = await fetch('/api/tello', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messages: history,
          facilityId: facilityId ?? null,
          userRole: userRole ?? null
        })
      });

      const payload = (await response.json().catch(() => null)) as { answer?: string; error?: string } | null;

      if (!response.ok || !payload?.answer) {
        throw new Error(payload?.error ?? `Tello request failed (${response.status})`);
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: payload.answer as string }]);
    } catch (err) {
      console.error('Tello could not answer:', err);
      setError(err instanceof Error ? err.message : 'Tello is unavailable right now.');
    } finally {
      setSending(false);
    }
  }, [draft, sending, messages, facilityId, userRole]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        role="dialog"
        aria-label="Ask Tello"
        className="relative w-full max-w-md bg-white h-full shadow-xl border-l flex flex-col"
      >
        <header className="bg-slate-950 p-4 text-white flex justify-between items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400 block">Tello Assistant</span>
            <span className="text-sm font-semibold">Title 22 compliance questions</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors" aria-label="Close">
            ✕
          </button>
        </header>

        <div ref={transcriptRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <p className="text-sm text-slate-500 leading-relaxed">
              Ask about caregiver training requirements, medication logging, or what a course covers.
              Tello explains the rules — it does not change your records, and it is not legal advice.
            </p>
          )}

          {messages.map((message, idx) => (
            <div
              key={idx}
              className={`text-sm rounded-xl p-3 whitespace-pre-wrap leading-relaxed ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white ml-8'
                  : 'bg-slate-50 border text-slate-800 mr-8'
              }`}
            >
              {message.content}
            </div>
          ))}

          {sending && <div className="text-xs text-slate-400 animate-pulse">Tello is thinking…</div>}
          {error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">{error}</div>
          )}
        </div>

        <form
          className="border-t p-4 space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            void sendQuestion();
          }}
        >
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                void sendQuestion();
              }
            }}
            rows={3}
            placeholder="e.g. How many dementia care hours are required each year?"
            className="w-full text-sm border border-slate-200 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={sending || draft.trim().length === 0}
            className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? 'Asking Tello…' : 'Ask Tello'}
          </button>
        </form>
      </aside>
    </div>
  );
}
