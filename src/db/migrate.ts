import { Pool } from "pg";
import { config } from "dotenv-safe";

config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const CREATE_URLS_TABLE = `
CREATE TABLE IF NOT EXISTS urls (
  id VARCHAR(8) PRIMARY KEY,
  target_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  click_count INT DEFAULT 0
);
`;

export async function migrate() {
  console.log("Running migrations...");
  const client = await pool.connect();
  try {
    await client.query(CREATE_URLS_TABLE);
    console.log("Urls table ensured");
  } finally {
    client.release();
    await pool.end();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  migrate().catch((err) => {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  });
}
