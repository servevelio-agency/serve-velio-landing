'use server';

import { supabase } from '@/lib/supabase';

export type Lead = {
  id: string;
  email: string;
  leads_per_month: number;
  conversion_rate: number;
  deal_value: number;
  response_delay: string;
  consent: boolean;
  created_at: string;
};

export async function fetchLeads(): Promise<Lead[]> {
  if (!supabase) {
    throw new Error('Supabase client not configured');
  }

  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) {
    throw new Error(`Failed to fetch leads: ${error.message}`);
  }

  return (data as Lead[]) || [];
}
