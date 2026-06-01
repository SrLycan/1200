'use client';

import { useDeferredValue, useState } from 'react';
import { toast } from 'sonner';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePipeline } from '@/modules/pipeline/hooks/use-pipeline';
import { useMoveStage } from '@/modules/leads/hooks/use-leads';
import { cn } from '@/lib/utils';

export default function PipelinePage() {
  const { data: columns, isLoading } = usePipeline();
  const { mutateAsync: moveStage } = useMoveStage();
  const [dragLeadId, setDragLeadId] = useState<string | null>(null);
  const deferred = useDeferredValue(columns);

  async function onDrop(stageId: string) {
    if (!dragLeadId) return;
    try {
      await moveStage({ id: dragLeadId, stageId });
      toast.success('Lead movido');
    } catch {
      toast.error('No se pudo mover');
    } finally {
      setDragLeadId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pipeline comercial</h1>
        <p className="text-sm text-muted-foreground">Arrastra leads entre etapas</p>
      </div>

      {isLoading && <p className="text-muted-foreground">Cargando...</p>}

      <div className="flex gap-4 overflow-x-auto pb-4">
        {(deferred ?? []).map((col) => (
          <div
            key={col.id}
            className="w-72 shrink-0"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(col.id)}
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: col.color ?? '#94a3b8' }}
                />
                <h3 className="text-sm font-semibold">{col.name}</h3>
              </div>
              <Badge variant="secondary">{col.leads.length}</Badge>
            </div>

            <div className="space-y-2">
              {col.leads.map((lead) => (
                <Card
                  key={lead.id}
                  draggable
                  onDragStart={() => setDragLeadId(lead.id)}
                  className={cn(
                    'cursor-grab p-3 transition-transform active:cursor-grabbing',
                    dragLeadId === lead.id && 'opacity-50',
                  )}
                >
                  <p className="text-sm font-medium">{lead.fullName}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {lead.phone ?? lead.email ?? '—'}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px]">
                      {lead.source}
                    </Badge>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      ★ {lead.score}
                    </span>
                  </div>
                </Card>
              ))}
              {col.leads.length === 0 && (
                <Card className="grid h-20 place-items-center border-dashed text-xs text-muted-foreground">
                  Sin leads
                </Card>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
