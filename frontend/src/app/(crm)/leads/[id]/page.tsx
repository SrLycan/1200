'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Search, Plus, Filter, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLeads } from '@/modules/leads/hooks/use-leads';
import { leadsService } from '@/modules/leads/services/leads.service';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { LeadStatus, LeadSource } from '@/types';
import { useDebounce } from '@/hooks/use-debounce';

/* ────────────────────────────────────── constants ─── */
const STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: 'Nuevo', TRIAGE: 'Triaje', QUALIFIED: 'Calificado',
  APPOINTMENT: 'Cita', NEGOTIATION: 'Negociación', WON: 'Ganado', LOST: 'Perdido',
};
const STATUS_STYLES: Record<LeadStatus, string> = {
  NEW: 'status-new', TRIAGE: 'status-triage', QUALIFIED: 'status-qualified',
  APPOINTMENT: 'status-appointment', NEGOTIATION: 'status-negotiation',
  WON: 'status-won', LOST: 'status-lost',
};
const SOURCE_LABELS: Record<LeadSource, string> = {
  WHATSAPP: 'WhatsApp', INSTAGRAM: 'Instagram', FACEBOOK: 'Facebook',
  WEB: 'Web', REFERRAL: 'Referido', WALK_IN: 'Visita', PHONE: 'Teléfono', OTHER: 'Otro',
};
const ALL_STATUSES = Object.keys(STATUS_LABELS) as LeadStatus[];
const ALL_SOURCES = Object.keys(SOURCE_LABELS) as LeadSource[];

/* ────────────────────────────────────── create dialog ─── */
function CreateLeadModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ fullName: '', phone: '', email: '', source: 'WHATSAPP' as LeadSource, notes: '' });
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.fullName.trim()) { toast.error('El nombre es obligatorio'); return; }
    setSaving(true);
    try {
      await leadsService.create({ ...form, status: 'NEW', priority: 'MEDIUM' });
      toast.success('Lead creado correctamente');
      qc.invalidateQueries({ queryKey: ['leads'] });
      onClose();
      setForm({ fullName: '', phone: '', email: '', source: 'WHATSAPP', notes: '' });
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message ?? 'No se pudo crear el lead');
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-xl border bg-card shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="font-display text-lg font-bold">Nuevo lead</h2>
          <button onClick={onClose} className="rounded-md p-1.5 hover:bg-muted transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-4 px-6 py-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Nombre completo *</label>
            <Input value={form.fullName} onChange={(e) => set('fullName', e.target.value)} placeholder="Juan Pérez" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Teléfono</label>
              <Input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+593 9..." />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="juan@..." />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Canal de origen</label>
            <select
              value={form.source}
              onChange={(e) => set('source', e.target.value)}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {ALL_SOURCES.map((s) => <option key={s} value={s}>{SOURCE_LABELS[s]}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Notas iniciales</label>
            <textarea
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              rows={3}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              placeholder="Interesado en..."
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? 'Guardando...' : 'Crear lead'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ────────────────────────────────────── main page ─── */
export default function LeadsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | ''>('');
  const [sourceFilter, setSourceFilter] = useState<LeadSource | ''>('');
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(search, 350);

  const { data, isLoading } = useLeads({
    page,
    pageSize: 25,
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    source: sourceFilter || undefined,
  });

  const resetFilters = useCallback(() => {
    setStatusFilter('');
    setSourceFilter('');
    setSearch('');
    setPage(1);
  }, []);

  const hasFilters = !!statusFilter || !!sourceFilter || !!debouncedSearch;
  const totalPages = data?.meta?.totalPages ?? 1;

  return (
    <div className="space-y-5">
      <CreateLeadModal open={showCreate} onClose={() => setShowCreate(false)} />

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Leads</h1>
          <p className="text-sm text-muted-foreground">
            {data?.meta?.total ?? 0} leads registrados
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters((v) => !v)}
            className={cn(hasFilters && 'border-primary text-primary')}
          >
            <Filter className="mr-1.5 h-3.5 w-3.5" />
            Filtros
            {hasFilters && <span className="ml-1.5 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground grid place-items-center">{[!!statusFilter, !!sourceFilter, !!debouncedSearch].filter(Boolean).length}</span>}
          </Button>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Nuevo lead
          </Button>
        </div>
      </div>

      {/* Filters bar */}
      {showFilters && (
        <Card>
          <CardContent className="flex flex-wrap items-end gap-4 p-4">
            <div className="relative min-w-[200px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar nombre, email, teléfono..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Estado</label>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value as LeadStatus | ''); setPage(1); }}
                className="h-10 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Todos</option>
                {ALL_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Origen</label>
              <select
                value={sourceFilter}
                onChange={(e) => { setSourceFilter(e.target.value as LeadSource | ''); setPage(1); }}
                className="h-10 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Todos</option>
                {ALL_SOURCES.map((s) => <option key={s} value={s}>{SOURCE_LABELS[s]}</option>)}
              </select>
            </div>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={resetFilters} className="text-muted-foreground">
                <X className="mr-1 h-3.5 w-3.5" /> Limpiar
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/30">
                <tr className="text-left">
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Nombre</th>
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Contacto</th>
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Origen</th>
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Estado</th>
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Score</th>
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Asesor</th>
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Creado</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading && (
                  [...Array(8)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(7)].map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 rounded bg-muted animate-pulse" style={{ width: `${60 + Math.random() * 30}%` }} />
                        </td>
                      ))}
                    </tr>
                  ))
                )}
                {!isLoading && data?.data?.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-14 text-center text-muted-foreground">
                      <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-muted grid place-items-center">
                        <Search className="h-5 w-5 text-muted-foreground" />
                      </div>
                      No se encontraron leads
                    </td>
                  </tr>
                )}
                {data?.data?.map((lead) => (
                  <tr key={lead.id} className="table-row-hover">
                    <td className="px-4 py-3">
                      <Link href={`/leads/${lead.id}`} className="font-semibold hover:text-primary transition-colors">
                        {lead.fullName}
                      </Link>
                      {lead.tags?.length > 0 && (
                        <div className="mt-0.5 flex gap-1">
                          {lead.tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{tag}</span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <div>{lead.phone ?? '—'}</div>
                      {lead.email && <div className="text-xs opacity-70">{lead.email}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className="font-normal">
                        {SOURCE_LABELS[lead.source as LeadSource] ?? lead.source}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', STATUS_STYLES[lead.status as LeadStatus])}>
                        {STATUS_LABELS[lead.status as LeadStatus] ?? lead.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-12 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${Math.min(100, lead.score)}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs text-muted-foreground">{lead.score}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {lead.owner ? `${lead.owner.firstName} ${lead.owner.lastName}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                      {formatDate(lead.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3">
              <p className="text-xs text-muted-foreground">
                Página {page} de {totalPages} · {data?.meta?.total} resultados
              </p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}