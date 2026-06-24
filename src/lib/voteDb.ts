import { createClient, Client } from "@libsql/client";

let _client: Client | null = null;
let _initialized = false;

export async function getDb(): Promise<Client> {
  if (!_client) {
    if (!process.env.TURSO_DATABASE_URL) throw new Error("TURSO_DATABASE_URL is not set");
    _client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  if (!_initialized) {
    await _client.batch(
      [
        `CREATE TABLE IF NOT EXISTS candidates (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          member TEXT NOT NULL,
          description TEXT,
          description_ko TEXT,
          description_en TEXT,
          image_path TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'approved',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS votes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          candidate_id INTEGER NOT NULL,
          voter_ip TEXT NOT NULL,
          voted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
        )`,
        `CREATE TABLE IF NOT EXISTS vote_config (
          id INTEGER PRIMARY KEY,
          start_at DATETIME NOT NULL,
          end_at DATETIME NOT NULL,
          registration_open INTEGER NOT NULL DEFAULT 1,
          approval_mode INTEGER NOT NULL DEFAULT 0
        )`,
      ],
      "deferred"
    );
    // 기존 DB 마이그레이션 (컬럼이 이미 있으면 무시)
    const migrations = [
      "ALTER TABLE candidates ADD COLUMN description_ko TEXT",
      "ALTER TABLE candidates ADD COLUMN description_en TEXT",
      "ALTER TABLE candidates ADD COLUMN status TEXT NOT NULL DEFAULT 'approved'",
      "ALTER TABLE vote_config ADD COLUMN registration_open INTEGER NOT NULL DEFAULT 1",
      "ALTER TABLE vote_config ADD COLUMN approval_mode INTEGER NOT NULL DEFAULT 0",
    ];
    for (const sql of migrations) {
      try { await _client.execute(sql); } catch { /* already exists */ }
    }
    _initialized = true;
  }
  return _client;
}
