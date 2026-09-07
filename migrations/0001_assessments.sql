CREATE TABLE IF NOT EXISTS assessments (
  assessment_id TEXT PRIMARY KEY, assessment_version TEXT NOT NULL,
  campaign_id TEXT, content_id TEXT, hook_id TEXT, cta TEXT, source_platform TEXT,
  started_at TEXT, last_step INTEGER NOT NULL DEFAULT 0, answers_json TEXT NOT NULL DEFAULT '[]',
  completion INTEGER NOT NULL DEFAULT 0, completed_at TEXT, result TEXT, primary_signal TEXT,
  whatsapp_click INTEGER NOT NULL DEFAULT 0, whatsapp_click_at TEXT,
  consent_notice_version TEXT NOT NULL, updated_at TEXT NOT NULL
);
