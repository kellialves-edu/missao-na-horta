import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';

async function prepareDb() {
  await env.DB.batch([
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      score INTEGER NOT NULL,
      total INTEGER NOT NULL,
      answers_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`),
    env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_results_created_at ON results(created_at DESC)'),
  ]);
}

export async function GET() {
  await prepareDb();
  const query = await env.DB.prepare('SELECT id, name, score, total, created_at AS createdAt FROM results ORDER BY created_at DESC LIMIT 100').all();
  return NextResponse.json({ results: query.results });
}

export async function POST(request: Request) {
  await prepareDb();
  const body = await request.json() as { name?: string; score?: number; total?: number; answers?: unknown[] };
  const name = String(body.name || '').trim().slice(0, 40);
  const score = Number(body.score);
  const total = Number(body.total);
  if (!name || !Number.isInteger(score) || !Number.isInteger(total) || score < 0 || score > total || total > 20) {
    return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
  }
  await env.DB.prepare('INSERT INTO results (name, score, total, answers_json, created_at) VALUES (?, ?, ?, ?, ?)')
    .bind(name, score, total, JSON.stringify(body.answers || []), new Date().toISOString()).run();
  return NextResponse.json({ ok: true }, { status: 201 });
}
