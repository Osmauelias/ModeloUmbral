const VERSION = 'PAO_MICRO_V2_1';
const ALLOWED_PHASES = new Set(['start', 'answer', 'completion', 'whatsapp_click', 'pagehide']);
export async function onRequestPost({ request, env }) {
  let body; try { body = await request.json(); } catch { return json({ error: 'invalid_json' }, 400); }
  if (!body || typeof body.assessment_id !== 'string' || !/^[0-9a-f-]{36}$/i.test(body.assessment_id)) return json({ error: 'invalid_assessment_id' }, 400);
  if (body.assessment_version !== VERSION || !ALLOWED_PHASES.has(body.phase)) return json({ error: 'invalid_payload' }, 400);
  const answers = Array.isArray(body.answers) ? body.answers.slice(0, 8).map(Number) : [];
  if (answers.some(v => !Number.isInteger(v) || v < 0 || v > 3)) return json({ error: 'invalid_answers' }, 400);
  if (!env?.DB) return json({ error: 'persistence_unavailable' }, 503);
  await env.DB.prepare(`INSERT INTO assessments (assessment_id, assessment_version, campaign_id, content_id, hook_id, cta, source_platform, started_at, last_step, answers_json, completion, completed_at, result, primary_signal, whatsapp_click, whatsapp_click_at, consent_notice_version, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(assessment_id) DO UPDATE SET last_step=excluded.last_step, answers_json=excluded.answers_json, completion=excluded.completion, completed_at=excluded.completed_at, result=excluded.result, primary_signal=excluded.primary_signal, whatsapp_click=excluded.whatsapp_click, whatsapp_click_at=excluded.whatsapp_click_at, updated_at=excluded.updated_at`).bind(body.assessment_id, VERSION, text(body.campaign_id), text(body.content_id), text(body.hook_id), text(body.cta), text(body.source_platform), text(body.started_at), Number(body.last_step) || 0, JSON.stringify(answers), body.completion ? 1 : 0, text(body.completed_at), text(body.result), text(body.primary_signal), body.whatsapp_click ? 1 : 0, text(body.whatsapp_click_at), text(body.consent_notice_version), new Date().toISOString()).run();
  return json({ ok: true, assessment_id: body.assessment_id });
}
const text = value => typeof value === 'string' ? value.slice(0, 120) : null;
const json = (value, status = 200) => new Response(JSON.stringify(value), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
