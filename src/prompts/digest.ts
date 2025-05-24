#!/usr/bin/env bun
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import chalk from 'chalk';

// ---------- config ----------
const SUPABASE = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

const TOP_N = 10; // how many rows to show
// -----------------------------

const { data: rows, error } = await SUPABASE.from('recent_ranked_items') // ← the view we just created
  .select('url, sim, summary')
  .eq('user_id', process.env.TEST_USER_ID!) // drop if items not per-user
  .order('sim', { ascending: false })
  .limit(TOP_N);

if (error) throw error;
if (!rows?.length) {
  console.log('No bookmarks in the last 24 h.');
  process.exit(0);
}

// ---------- render ----------
console.log(`\n## Goal-Fit Digest – ${new Date().toLocaleDateString()}\n`);

rows.forEach((r, idx) => {
  // summary is a JSON blob {summary:string, bullets:string[]}
  const s = typeof r.summary === 'string' ? JSON.parse(r.summary) : r.summary;

  console.log(
    chalk.green(`${idx + 1}. ${r.url}  —  ${(r.sim * 100).toFixed(0)} % match`)
  );

  console.log(s.summary.replace(/\s+/g, ' ').trim());

  (s.bullets || []).forEach((b: string) => console.log('  •', b.trim()));
  console.log('');
});
