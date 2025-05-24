// scripts/seed-goals.ts
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { embedder } from '../lib/embedder';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY!;

const goals = [
  'Ship an AI portfolio this quarter',
  'Master Retrieval-Augmented Generation',
  'Automate daily reading time',
];

const db = createClient(SUPABASE_URL, SUPABASE_KEY);

for (const goal of goals) {
  const {
    data: [{ embedding }],
  } = await embedder.embeddings.create({
    model: 'text-embedding-3-small',
    input: goal,
  });

  const { error } = await db.from('user_goals').insert({
    user_id: process.env.TEST_USER_ID!,
    goal,
    embedding,
  });
  if (error) throw error;
  console.log('✓ goal stored →', goal);
}
