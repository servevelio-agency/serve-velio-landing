import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json(
      { error: 'Invalid request body.' },
      { status: 400 }
    );
  }

  const payload = {
    email: String(body.email || '').trim(),
    leads_per_month: Number(body.leadsPerMonth) || 0,
    conversion_rate: Number(body.conversionRate) || 0.1,
    deal_value: Number(body.dealValue) || 0,
    response_delay: String(body.responseDelay || ''),
    consent: Boolean(body.consent),
    created_at: new Date().toISOString(),
  };

  if (!payload.email) {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
  }

  if (!supabase) {
    return NextResponse.json({
      message:
        'Supabase is not configured. Save this data locally or configure SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY.',
    });
  }

  const { error } = await supabase.from('leads').insert([payload]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Lead captured successfully.' });
}
