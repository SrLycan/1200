'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLeads } from '@/modules/leads/hooks/use-leads';
import { formatDate } from '@/lib/utils';

const STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-blue-500',
  TRIAGE: 'bg-purple-500',
  QUALIFIED: 'bg-cyan-500',
  APPOINTMENT: 'bg-amber-500',
  NEGOTIATION: 'bg-orange-500',
  WON: 'bg-emerald-500',
  LOST: 'bg-red-500',
};

export default function LeadsPage() {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useLeads({ page: 1, pageSize: 20, search });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Leads</h1>
          <p className="text-sm text-muted-foreground">
            {data?.meta?.total ?? 0} leads en total
          </p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, email, teléfono..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr className="text-left">
                  <th className="px-4 py-3 font-medium">Nombre</th>
                  <th className="px-4 py-3 font-medium">Contacto</th>
                  <th className="px-4 py-3 font-medium">Origen</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Score</th>
                  <th className="px-4 py-3 font-medium">Asesor</th>
                  <th className="px-4 py-3 font-medium">Creado</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-muted-foreground">
                      Cargando...
                    </td>
                  </tr>
                )}
                {!isLoading && data?.data?.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-muted-foreground">
                      Sin resultados
                    </td>
                  </tr>
                )}
                {data?.data?.map((lead) => (
                  <tr key={lead.id} className="border-b transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <Link href={`/leads/${lead.id}`} className="font-medium hover:underline">
                        {lead.fullName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {lead.phone ?? lead.email ?? '-'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary">{lead.source}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${STATUS_COLORS[lead.status] ?? 'bg-gray-400'}`}
                        />
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono">{lead.score}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {lead.owner ? `${lead.owner.firstName} ${lead.owner.lastName}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(lead.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
