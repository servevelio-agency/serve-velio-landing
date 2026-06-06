'use client';

import type { Lead } from '@/app/actions/leads';
import { fetchLeads } from '@/app/actions/leads';
import {
  ArrowUpDown,
  CheckCircle2,
  Clock,
  DollarSign,
  Download,
  Mail,
  Search,
  Sparkles,
  TrendingUp,
  Users,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

// Leads now fetched from Supabase via server action
const RESPONSE_LABELS: Record<string, string> = {
  under5min: 'Under 5 min',
  '5to30min': '5–30 min',
  '30minTo4h': '30 min – 4 h',
  '4to24h': '4–24 h',
  over24h: 'Over 24 h',
};

const DECAY: Record<string, number> = {
  under5min: 1.0,
  '5to30min': 0.4,
  '30minTo4h': 0.15,
  '4to24h': 0.05,
  over24h: 0.02,
};

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

function leakOf(l: Lead) {
  const potential = l.leads_per_month * l.conversion_rate * l.deal_value;
  return potential - potential * (DECAY[l.response_delay] ?? 0);
}

function severity(delay: string) {
  if (delay === 'under5min') return { label: 'Healthy', tone: 'emerald' };
  if (delay === '5to30min') return { label: 'Stable', tone: 'sky' };
  if (delay === '30minTo4h') return { label: 'Leaking', tone: 'amber' };
  if (delay === '4to24h') return { label: 'Critical', tone: 'orange' };
  return { label: 'Severe', tone: 'rose' };
}

const toneClasses: Record<string, string> = {
  emerald: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/30',
  sky: 'bg-sky-500/10 text-sky-300 ring-sky-500/30',
  amber: 'bg-amber-500/10 text-amber-300 ring-amber-500/30',
  orange: 'bg-orange-500/10 text-orange-300 ring-orange-500/30',
  rose: 'bg-rose-500/10 text-rose-300 ring-rose-500/30',
};

type SortKey = 'created_at' | 'leak' | 'deal_value' | 'leads_per_month';

function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [filter, setFilter] = useState<'all' | 'consented' | 'critical'>('all');

  useEffect(() => {
    async function loadLeads() {
      try {
        setLoading(true);
        const data = await fetchLeads();
        setLeads(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load leads');
        console.error('Error loading leads:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLeads();
  }, []);

  const filtered = useMemo(() => {
    let rows = leads.filter((l) =>
      l.email.toLowerCase().includes(query.toLowerCase())
    );
    if (filter === 'consented') rows = rows.filter((l) => l.consent);
    if (filter === 'critical')
      rows = rows.filter((l) =>
        ['4to24h', 'over24h'].includes(l.response_delay)
      );
    rows = [...rows].sort((a, b) => {
      const va =
        sortKey === 'leak'
          ? leakOf(a)
          : sortKey === 'created_at'
            ? new Date(a.created_at).getTime()
            : (a as any)[sortKey];
      const vb =
        sortKey === 'leak'
          ? leakOf(b)
          : sortKey === 'created_at'
            ? new Date(b.created_at).getTime()
            : (b as any)[sortKey];
      return sortDir === 'asc' ? va - vb : vb - va;
    });
    return rows;
  }, [leads, query, sortKey, sortDir, filter]);

  const stats = useMemo(() => {
    const totalLeak = leads.reduce((s, l) => s + leakOf(l), 0);
    const avgDeal =
      leads.reduce((s, l) => s + l.deal_value, 0) / Math.max(leads.length, 1);
    const consented = leads.filter((l) => l.consent).length;
    return { totalLeak, avgDeal, consented, total: leads.length };
  }, [leads]);

  function toggleSort(k: SortKey) {
    if (sortKey === k) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else {
      setSortKey(k);
      setSortDir('desc');
    }
  }

  return (
    <div className='min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden'>
      {/* Ambient glow */}
      <div className='pointer-events-none absolute inset-0'>
        <div className='absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-purple-600/20 blur-3xl' />
        <div className='absolute top-1/3 -right-40 h-[600px] w-[600px] rounded-full bg-fuchsia-600/10 blur-3xl' />
        <div className='absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-indigo-600/10 blur-3xl' />
      </div>

      <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14'>
        {/* Header */}
        <div className='flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10'>
          <div>
            <div className='inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 ring-1 ring-purple-500/30 text-purple-300 text-xs font-semibold mb-4'>
              <Sparkles className='w-3.5 h-3.5' />
              Revenue Operations · Lead Pipeline
            </div>
            <h1 className='text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-br from-white via-white to-purple-200 bg-clip-text text-transparent'>
              Captured Leads
            </h1>
            <p className='mt-3 text-slate-400 max-w-xl text-sm sm:text-base'>
              Every operator who ran the Revenue Leak calculator — ranked by
              recoverable revenue.
            </p>
          </div>
          <div className='flex gap-3'>
            <Link
              href='/'
              className='inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 ring-1 ring-slate-700/80 text-slate-200 text-sm font-semibold transition'
            >
              ← Back home
            </Link>
            <button className='inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white text-sm font-bold shadow-lg shadow-purple-500/30 transition'>
              <Download className='w-4 h-4' /> Export CSV
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
          <StatCard
            icon={<Users className='w-4 h-4' />}
            label='Total Leads'
            value={stats.total.toString()}
            accent='purple'
          />
          <StatCard
            icon={<TrendingUp className='w-4 h-4' />}
            label='Aggregate Leak / mo'
            value={currency.format(stats.totalLeak)}
            accent='rose'
          />
          <StatCard
            icon={<DollarSign className='w-4 h-4' />}
            label='Avg Deal Value'
            value={currency.format(stats.avgDeal)}
            accent='emerald'
          />
          <StatCard
            icon={<CheckCircle2 className='w-4 h-4' />}
            label='Opted-in'
            value={`${stats.consented} / ${stats.total}`}
            accent='sky'
          />
        </div>

        {/* Controls */}
        <div className='flex flex-col md:flex-row gap-3 mb-6'>
          <div className='relative flex-1'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500' />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Search by email…'
              className='w-full pl-10 pr-4 py-3 rounded-lg bg-slate-900/70 ring-1 ring-slate-800 focus:ring-2 focus:ring-purple-500/50 focus:outline-none text-sm text-slate-100 placeholder-slate-500 transition'
            />
          </div>
          <div className='flex gap-2 p-1 rounded-lg bg-slate-900/70 ring-1 ring-slate-800'>
            {(['all', 'consented', 'critical'] as const).map((k) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                className={`px-4 py-2 rounded-md text-sm font-semibold capitalize transition ${
                  filter === k
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {k}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className='rounded-2xl ring-1 ring-slate-800 bg-slate-900/40 backdrop-blur-sm overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='bg-slate-900/80 text-slate-400 text-xs uppercase tracking-wider'>
                  <Th>Lead</Th>
                  <Th sortable onClick={() => toggleSort('leads_per_month')}>
                    Leads / mo
                  </Th>
                  <Th>Conv.</Th>
                  <Th sortable onClick={() => toggleSort('deal_value')}>
                    Deal Value
                  </Th>
                  <Th>Response</Th>
                  <Th sortable onClick={() => toggleSort('leak')}>
                    Monthly Leak
                  </Th>
                  <Th>Consent</Th>
                  <Th sortable onClick={() => toggleSort('created_at')}>
                    Captured
                  </Th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className='px-6 py-16 text-center text-slate-400'
                    >
                      Loading leads...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      colSpan={8}
                      className='px-6 py-16 text-center text-rose-400'
                    >
                      <Mail className='w-8 h-8 mx-auto mb-3 opacity-40' />
                      {error}
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className='px-6 py-16 text-center text-slate-500'
                    >
                      <Mail className='w-8 h-8 mx-auto mb-3 opacity-40' />
                      No leads match your filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((l) => {
                    const leak = leakOf(l);
                    const sev = severity(l.response_delay);
                    return (
                      <tr
                        key={l.id}
                        className='border-t border-slate-800/60 hover:bg-purple-500/[0.04] transition group'
                      >
                        <td className='px-5 py-4'>
                          <div className='flex items-center gap-3'>
                            <div className='w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center text-white font-bold text-sm shrink-0'>
                              {l.email[0].toUpperCase()}
                            </div>
                            <span className='text-slate-200 font-medium'>
                              {l.email}
                            </span>
                          </div>
                        </td>
                        <td className='px-5 py-4 text-slate-300 tabular-nums'>
                          {l.leads_per_month.toLocaleString()}
                        </td>
                        <td className='px-5 py-4 text-slate-300 tabular-nums'>
                          {(l.conversion_rate * 100).toFixed(1)}%
                        </td>
                        <td className='px-5 py-4 text-slate-300 tabular-nums'>
                          {currency.format(l.deal_value)}
                        </td>
                        <td className='px-5 py-4'>
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ring-1 ${toneClasses[sev.tone]}`}
                          >
                            <Clock className='w-3 h-3' />
                            {RESPONSE_LABELS[l.response_delay]}
                          </span>
                        </td>
                        <td className='px-5 py-4'>
                          <div className='flex items-center gap-2'>
                            <span className='text-rose-300 font-bold tabular-nums'>
                              {currency.format(leak)}
                            </span>
                            <span
                              className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${toneClasses[sev.tone]}`}
                            >
                              {sev.label}
                            </span>
                          </div>
                        </td>
                        <td className='px-5 py-4'>
                          {l.consent ? (
                            <CheckCircle2 className='w-5 h-5 text-emerald-400' />
                          ) : (
                            <XCircle className='w-5 h-5 text-slate-600' />
                          )}
                        </td>
                        <td className='px-5 py-4 text-slate-400 text-xs'>
                          {new Date(l.created_at).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className='px-5 py-3 border-t border-slate-800/60 text-xs text-slate-500 flex justify-between'>
            <span>
              Showing {filtered.length} of {leads.length}
            </span>
            <span>
              Sorted by{' '}
              <span className='text-slate-300 font-semibold'>{sortKey}</span> ·{' '}
              {sortDir}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
}) {
  const ring: Record<string, string> = {
    purple:
      'from-purple-500/20 to-purple-500/0 ring-purple-500/30 text-purple-300',
    rose: 'from-rose-500/20 to-rose-500/0 ring-rose-500/30 text-rose-300',
    emerald:
      'from-emerald-500/20 to-emerald-500/0 ring-emerald-500/30 text-emerald-300',
    sky: 'from-sky-500/20 to-sky-500/0 ring-sky-500/30 text-sky-300',
  };
  return (
    <div className='relative rounded-xl bg-slate-900/60 ring-1 ring-slate-800 p-5 overflow-hidden group hover:ring-slate-700 transition'>
      <div
        className={`absolute inset-0 bg-gradient-to-br ${ring[accent]} opacity-40 group-hover:opacity-60 transition`}
      />
      <div className='relative'>
        <div
          className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ring-1 ${ring[accent]} mb-3`}
        >
          {icon}
        </div>
        <div className='text-xs uppercase tracking-wider text-slate-400 font-semibold'>
          {label}
        </div>
        <div className='mt-1 text-2xl font-bold text-white tabular-nums'>
          {value}
        </div>
      </div>
    </div>
  );
}

function Th({
  children,
  sortable,
  onClick,
}: {
  children: React.ReactNode;
  sortable?: boolean;
  onClick?: () => void;
}) {
  return (
    <th className='px-5 py-3 text-left font-semibold'>
      {sortable ? (
        <button
          onClick={onClick}
          className='inline-flex items-center gap-1.5 hover:text-purple-300 transition'
        >
          {children}
          <ArrowUpDown className='w-3 h-3 opacity-50' />
        </button>
      ) : (
        children
      )}
    </th>
  );
}

export default LeadsPage;
