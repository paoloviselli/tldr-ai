#!/usr/bin/env bun
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { openRouter } from '../lib/openrouter';
import { embedder } from '../lib/embedder';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import { YoutubeTranscript } from 'youtube-transcript';
import { z } from 'zod';
// import { v4 as uuidv4 } from 'uuid';

// ---------- helpers ----------
const detectType = (url: string) =>
  /youtube\.com|youtu\.be/.test(url)
    ? 'youtube'
    : /x\.com|twitter\.com/.test(url)
    ? 'x'
    : /https?:\/\/[^ ]+/.test(url)
    ? 'article'
    : 'unknown';

async function extractText(url: string, type: string) {
  if (type === 'article') {
    const html = await fetch(url).then((r) => r.text());
    const doc = new JSDOM(html, { url }).window.document;
    return new Readability(doc).parse()?.textContent ?? '';
  }
  if (type === 'youtube') {
    // console.log('fetching transcript for', url);
    let transcript: { text: string }[] = [];
    try {
      transcript = await YoutubeTranscript.fetchTranscript(url);
      console.log('transcript', transcript.length);
    } catch (e) {
      console.warn('Failed to fetch transcript for', url, e);
      return '';
    }
    return transcript.map((t) => t.text).join(' ');
  }
  return '';
}

const SUMMARISE = `
Summarise the following content in ≤150 words.
Return valid JSON:
{"summary":"", "bullets":["","",""]}

CONTENT:
`;

async function summarise(text: string) {
  const res = await openRouter.chat.completions.create({
    model: 'mistralai/mixtral-8x7b-instruct',
    response_format: { type: 'json_object' },
    messages: [{ role: 'user', content: SUMMARISE + text.slice(0, 8000) }],
  });
  const content = res.choices[0].message.content;
  if (!content) throw new Error('No content in response');
  const obj = JSON.parse(content);
  if (!Array.isArray(obj.bullets)) obj.bullets = [];
  return z
    .object({
      summary: z.string(),
      bullets: z.array(z.string()),
    })
    .parse(obj);
}
// ---------- main ----------
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

const urls = Bun.argv.slice(2); // pass links on CLI
for await (const url of urls) {
  // Check if URL already exists
  const { data: existingItem } = await supabase
    .from('items')
    .select('url')
    .eq('url', url)
    .single();

  if (existingItem) {
    console.log('⚠️ URL already stored:', url);
    continue;
  }

  const type = detectType(url);
  const raw = await extractText(url, type);
  if (!raw) {
    console.warn('No text extracted for', url, '- skipping');
    continue;
  }
  const embed = await embedder.embeddings.create({
    model: 'text-embedding-3-small',
    input: raw.slice(0, 8192),
  });
  const summary = await summarise(raw);
  const { error } = await supabase.from('items').insert({
    url,
    type,
    raw_text: raw,
    summary,
    embedding: embed.data[0].embedding,
    user_id: process.env.TEST_USER_ID!,
  });
  if (error) {
    console.error('Error storing item:', error);
  }
  console.log('✓ stored', url);
}
