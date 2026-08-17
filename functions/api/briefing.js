/**
 * GET /api/briefing?facilityId=<id>
 *
 * Cloudflare Pages Function backing the Morning Briefing panel. It aggregates
 * caregiver training progress into a small read-only summary — it never writes.
 *
 * Environment (Cloudflare Pages → Settings → Environment variables):
 *   SUPABASE_URL                 required for live data
 *   SUPABASE_SERVICE_ROLE_KEY    required for live data (store as a secret)
 *   BRIEFING_FACILITY_COLUMN     optional; the column on
 *                                caregiver_training_progress that holds the
 *                                facility id. Leave unset if the table has no
 *                                such column — the briefing then covers every
 *                                row instead of filtering.
 *
 * With the Supabase variables unset the endpoint still answers 200 with
 * `dataSource: 'unavailable'` and zeroed stats, so the UI degrades quietly.
 */

const ANNUAL_RENEWAL_DAYS = 365;
const RENEWAL_COURSE_IDS = ['annual-ce'];

export async function onRequestGet(context) {
  const { request, env } = context;
  const facilityId = new URL(request.url).searchParams.get('facilityId');

  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return json(emptyBriefing(facilityId, 'Training data source is not configured.'));
  }

  let rows;
  try {
    rows = await fetchProgressRows(env, facilityId);
  } catch (err) {
    console.error('Briefing aggregation failed:', err);
    return json({ error: 'The briefing could not be generated.' }, 502);
  }

  return json(buildBriefing(rows, facilityId));
}

async function fetchProgressRows(env, facilityId) {
  const url = new URL('/rest/v1/caregiver_training_progress', env.SUPABASE_URL);
  url.searchParams.set(
    'select',
    'user_id,course_id,hours_completed,quiz_passed,completed_at,last_active_at'
  );

  const facilityColumn = env.BRIEFING_FACILITY_COLUMN;
  if (facilityColumn && facilityId) {
    url.searchParams.set(facilityColumn, `eq.${facilityId}`);
  }

  const response = await fetch(url, {
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Supabase responded ${response.status}: ${await response.text()}`);
  }

  return response.json();
}

function buildBriefing(rows, facilityId) {
  const caregivers = new Set();
  let coursesComplete = 0;
  let coursesInProgress = 0;
  let overdueRenewals = 0;
  let stalled = 0;

  const renewalCutoff = Date.now() - ANNUAL_RENEWAL_DAYS * 24 * 60 * 60 * 1000;
  const staleCutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;

  for (const row of rows) {
    if (row.user_id) caregivers.add(row.user_id);

    if (row.quiz_passed) {
      coursesComplete += 1;

      const completedAt = Date.parse(row.completed_at ?? '');
      if (RENEWAL_COURSE_IDS.includes(row.course_id) && Number.isFinite(completedAt) && completedAt < renewalCutoff) {
        overdueRenewals += 1;
      }
      continue;
    }

    coursesInProgress += 1;

    const lastActive = Date.parse(row.last_active_at ?? '');
    if (Number.isFinite(lastActive) && lastActive < staleCutoff) {
      stalled += 1;
    }
  }

  const items = [];

  if (overdueRenewals > 0) {
    items.push({
      id: 'overdue-renewals',
      title: `${overdueRenewals} annual renewal${overdueRenewals === 1 ? '' : 's'} past due`,
      detail: 'Continuing education completed more than a year ago needs to be retaken to stay current.',
      severity: 'urgent'
    });
  }

  if (stalled > 0) {
    items.push({
      id: 'stalled-courses',
      title: `${stalled} course${stalled === 1 ? '' : 's'} with no activity in 30 days`,
      detail: 'These caregivers started a course and have not returned to it.',
      severity: 'attention'
    });
  }

  if (coursesInProgress > 0 && stalled === 0) {
    items.push({
      id: 'in-progress',
      title: `${coursesInProgress} course${coursesInProgress === 1 ? '' : 's'} in progress`,
      detail: 'Training is moving along — nothing has gone stale.',
      severity: 'info'
    });
  }

  const headline =
    overdueRenewals > 0
      ? 'Renewals need attention today.'
      : items.length > 0
        ? 'A few items to look at this morning.'
        : 'Everything tracked is up to date.';

  return {
    generatedAt: new Date().toISOString(),
    facilityId: facilityId ?? null,
    headline,
    stats: {
      caregiversTracked: caregivers.size,
      coursesComplete,
      coursesInProgress,
      overdueRenewals
    },
    items,
    dataSource: 'live'
  };
}

function emptyBriefing(facilityId, headline) {
  return {
    generatedAt: new Date().toISOString(),
    facilityId: facilityId ?? null,
    headline,
    stats: {
      caregiversTracked: 0,
      coursesComplete: 0,
      coursesInProgress: 0,
      overdueRenewals: 0
    },
    items: [],
    dataSource: 'unavailable'
  };
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
