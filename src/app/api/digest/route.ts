import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    const { data: rows, error } = await supabase
      .from('recent_ranked_items')
      .select('url, sim, summary')
      .eq('user_id', process.env.TEST_USER_ID!)
      .order('sim', { ascending: false })
      .limit(10);

    if (error) throw error;

    if (!rows?.length) {
      return NextResponse.json([]);
    }

    // Parse summary JSON if it's a string
    const items = rows.map((row) => ({
      ...row,
      summary:
        typeof row.summary === 'string' ? JSON.parse(row.summary) : row.summary,
    }));

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching digest:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
