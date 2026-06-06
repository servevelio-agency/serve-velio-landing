import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  if (!supabase) {
    console.error(
      'Keep-alive: Supabase client not configured (missing env vars)'
    );
    return NextResponse.json(
      { ok: false, error: 'Supabase not configured' },
      { status: 500 }
    );
  }

  try {
    // Lightweight query that will wake the DB if it's paused.
    const { data, error } = await supabase.from('leads').select('id').limit(1);

    if (error) {
      console.error('Keep-alive: Supabase query error:', error);
      // Return 200 so uptime monitors consider the route healthy while surfacing the DB error.
      return NextResponse.json({
        ok: true,
        woke: true,
        dbError: error.message,
      });
    }

    return NextResponse.json({
      ok: true,
      woke: true,
      rowCount: Array.isArray(data) ? data.length : 0,
    });
  } catch (err) {
    console.error('Keep-alive: unexpected error:', err);
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}
