'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Car, Filter, X } from 'lucide-react';
import { toast } from 'sonner';

import { http } from '@/services/http';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';

type VehicleStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'ARCHIVED';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  trim?: string;
  price: number;
  status: VehicleStatus;
  mileage?: number;
  color?: string;
  vin?: string;
  description?: string;
}

const STATUS_LABELS: Record<VehicleStatus, string> = {
  AVAILABLE: 'Disponible',
  RESERVED: 'Reservado',
  SOLD: 'Vendido',
  ARCHIVED: 'Archivado',
};

const STATUS_STYLES: Record<VehicleStatus, string> = {
  AVAILABLE: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  RESERVED: 'bg-amber-50 text-amber-700 border border-amber-200',
  SOLD: 'bg-blue-50 text-blue-700 border border-blue-200',
  ARCHIVED: 'bg-muted text-muted-foreground border border-border',
};

// Vehicle card image placeholder
function CarPlaceholder({ color }: { color?: string }) {
  return (
    <div className="relative flex h-36 items-center justify-center rounded-t-xl bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
      <Car className="h-16 w-16 text-muted-foreground/30" />
      {color && (
        <div
          className="absolute bottom-3 right-3 h-4 w-4 rounded-full border-2 border-white shadow"
          style={{ background: color.toLowerCase() }}
          title={color}
        />
      )}
    </div>
  );
}

export default function VehiclesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | ''>('');
  const debouncedSearch = useDebounce(search, 300);
  const qc = useQueryClient();

  const { data: vehicles, isLoading } = useQuery({
    queryKey: ['vehicles', statusFilter],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (statusFilter) params.status = statusFilter;
      const { data } = await http.get('/vehicles', { params });
      // Handle both wrapped and direct responses
      return (data?.data?.data ?? data?.data ?? []) as Vehicle[];
    },
  });

  // Client-side search filter
  const filtered = debouncedSearch
    ? vehicles?.filter((v) =>
        `${v.make} ${v.model} ${v.year} ${v.color ?? ''} ${v.vin ?? ''}`.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    : vehicles;

  const availableCount = vehicles?.filter((v) => v.status === 'AVAILABLE').length ?? 0;
  const hasFilters = !!statusFilter || !!debouncedSearch;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Inventario de vehículos</h1>
          <p className="text-sm text-muted-foreground">
            {availableCount} disponibles · {vehicles?.length ?? 0} en total
          </p>
        </div>
        <Button size="sm">
          <Plus className="mr-1.5 h-3.5 w-3.5" /> Agregar vehículo
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Marca, modelo, color, VIN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-1">
          {(['', 'AVAILABLE', 'RESERVED', 'SOLD'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s as VehicleStatus | '')}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                statusFilter === s
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground hover:border-primary hover:text-primary',
              )}
            >
              {s === '' ? 'Todos' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
        {hasFilters && (
          <button onClick={() => { setSearch(''); setStatusFilter(''); }} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
            <X className="h-3 w-3" /> Limpiar
          </button>
        )}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-xl border overflow-hidden animate-pulse">
              <div className="h-36 bg-muted" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
                <div className="h-5 bg-muted rounded w-1/3 mt-2" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered?.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center text-muted-foreground">
          <Car className="h-12 w-12 opacity-20" />
          <p className="font-display font-semibold">No hay vehículos{hasFilters ? ' que coincidan' : ''}</p>
          {hasFilters && <p className="text-sm">Intenta con otros filtros</p>}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered?.map((v) => (
            <div key={v.id} className="group rounded-xl border bg-card overflow-hidden card-hover">
              <CarPlaceholder color={v.color} />
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-display font-bold leading-tight">
                      {v.make} {v.model}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {v.year}{v.trim ? ` · ${v.trim}` : ''}
                    </p>
                  </div>
                  <span className={cn('shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium', STATUS_STYLES[v.status])}>
                    {STATUS_LABELS[v.status]}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {v.mileage !== undefined && (
                    <span>{v.mileage.toLocaleString('es-EC')} km</span>
                  )}
                  {v.color && <span className="capitalize">{v.color}</span>}
                </div>

                {v.vin && (
                  <p className="font-mono text-[10px] text-muted-foreground">VIN: {v.vin}</p>
                )}

                <div className="flex items-center justify-between pt-2 border-t">
                  <p className="font-display text-lg font-bold text-primary">
                    {formatCurrency(v.price)}
                  </p>
                  <button className="text-xs text-muted-foreground hover:text-primary transition-colors font-medium">
                    Ver detalles →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}