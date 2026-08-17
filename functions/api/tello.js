/**
 * POST /api/tello
 *
 * Cloudflare Pages Function backing the Tello assistant drawer. It answers
 * Title 22 questions with Claude. It has no database access and cannot change
 * any training record.
 *
 * Request body: { messages: [{ role: 'user' | 'assistant', content: string }],
 *                 facilityId?: string, userRole?: string | string[] }
 * Response body: { answer: string } or { error: string }
 *
 * Environment (Cloudflare Pages → Settings → Environment variables):
 *   ANTHROPIC_API_KEY   required — store as an encrypted secret, never in wrangler.toml
 *   SUPABASE_URL        optional; when set together with SUPABASE_ANON_KEY the
 *   SUPABASE_ANON_KEY   caller must present a valid Supabase access token
 *
 * This endpoint spends money per call, so keep the Supabase variables set in
 * production — without them the route answers anyone who can reach the URL.
 */

import Anthropic from '@anthropic-ai/sdk';

const MODEL = 'claude-opus-5';
const MAX_MESSAGES = 20;
const MAX_CONTENT_CHARS = 4000;

const SYSTEM_PROMPT = `You are Tello, an assistant inside the Title22.app caregiver training dashboard for California residential care facilities.

Answer questions about California Title 22 caregiver training and certification requirements, medication assistance and logging rules, and how to use this training dashboard.

Guidelines:
- Be concise and practical. Prefer short paragraphs or short lists.
- Cite the specific requirement (for example "Title 22 §87411") when you are confident of it, and say plainly when you are not sure rather than guessing at a section number.
- You have no access to resident records, caregiver records, or the database. If a question needs facility-specific data, say what the user should check in the dashboard.
- You cannot change any record, log any hours, or mark any course complete.
- Regulations change and vary by facility licence type. For anything consequential, tell the user to confirm against the current regulation text or their licensing analyst. Do not give legal advice.`;

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.ANTHROPIC_API_KEY) {
    return json({ error: 'Tello is not configured on this environment.' }, 503);
  }

  const authError = await verifyCaller(request, env);
  if (authError) return authError;

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Request body must be JSON.' }, 400);
  }

  const messages = normalizeMessages(body?.messages);
  if (!messages) {
    return json({ error: 'Provide a messages array ending with a user message.' }, 400);
  }

  // facilityId and userRole come from the browser, so they are context for the
  // answer only — never treat them as proof of what the caller may see.
  const context_lines = [];
  if (body?.facilityId) context_lines.push(`Facility id (self-reported): ${String(body.facilityId).slice(0, 100)}`);
  if (body?.userRole) {
    const role = Array.isArray(body.userRole) ? body.userRole.join(', ') : String(body.userRole);
    context_lines.push(`Caller role (self-reported): ${role.slice(0, 200)}`);
  }

  const system = context_lines.length
    ? `${SYSTEM_PROMPT}\n\nUnverified context supplied by the browser:\n${context_lines.join('\n')}`
    : SYSTEM_PROMPT;

  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

  try {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      system,
      messages,
      thinking: { type: 'adaptive' },
      output_config: { effort: 'medium' },
      // Route around a policy decline instead of returning nothing to the user.
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default'
    });

    if (response.stop_reason === 'refusal') {
      return json({ error: 'Tello could not answer that question. Try rephrasing it.' }, 422);
    }

    const answer = response.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n')
      .trim();

    if (!answer) {
      return json({ error: 'Tello returned an empty answer. Try again.' }, 502);
    }

    return json({ answer });
  } catch (err) {
    console.error('Tello request failed:', err);

    if (err instanceof Anthropic.RateLimitError) {
      return json({ error: 'Tello is busy right now. Try again in a moment.' }, 429);
    }

    return json({ error: 'Tello is unavailable right now.' }, 502);
  }
}

/**
 * Rejects the request when Supabase auth is configured and the caller does not
 * present a valid access token. Returns null when the caller may proceed.
 */
async function verifyCaller(request, env) {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) return null;

  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return json({ error: 'Sign in to ask Tello.' }, 401);
  }

  try {
    const response = await fetch(new URL('/auth/v1/user', env.SUPABASE_URL), {
      headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: authorization }
    });

    if (!response.ok) {
      return json({ error: 'Sign in to ask Tello.' }, 401);
    }
  } catch (err) {
    console.error('Could not verify the caller with Supabase:', err);
    return json({ error: 'Could not verify your session.' }, 503);
  }

  return null;
}

function normalizeMessages(input) {
  if (!Array.isArray(input) || input.length === 0 || input.length > MAX_MESSAGES) return null;

  const messages = [];
  for (const entry of input) {
    if (entry?.role !== 'user' && entry?.role !== 'assistant') return null;
    if (typeof entry.content !== 'string') return null;

    const content = entry.content.trim().slice(0, MAX_CONTENT_CHARS);
    if (!content) return null;

    messages.push({ role: entry.role, content });
  }

  if (messages[0].role !== 'user' || messages[messages.length - 1].role !== 'user') return null;

  return messages;
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    }
  });
}
