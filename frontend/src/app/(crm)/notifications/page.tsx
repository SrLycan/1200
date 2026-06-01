'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, BellOff, CheckCheck, Megaphone, UserCheck, MessageSquare, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

import { http } from '@/services/http';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  title: string;
  body?: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

const TYPE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  LEAD_ASSIGNED:  { label: 'Lead asignado',     icon: UserCheck,    color: 'text-primary bg-primary/10' },
  NEW_MESSAGE:    { label: 'Nuevo mensaje',      icon: MessageSquare,color: 'text-emerald-600 bg-emerald-50' },
  STAGE_CHANGED:  { label: 'Cambio de etapa',   icon: TrendingUp,   color: 'text-amber-600 bg-amber-50' },
  SYSTEM:         { label: 'Sistema',            icon: Megaphone,    color: 'text-muted-foreground bg-muted' },
};

function getConfig(type: string) {
  return TYPE_CONFIG[type] ?? { label: type, icon: Bell, color: 'text-muted-foreground bg-muted' };
}

export default function NotificationsPage() {
  const qc = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await http.get('/notifications', { params: { pageSize: 50 } });
      return (data?.data?.data ?? data?.data ?? []) as Notification[];
    },
  });

  const { mutate: markRead, isPending: markingRead } = useMutation({
    mutationFn: async (id: string) => {
      await http.patch(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: () => toast.error('No se pudo marcar como leída'),
  });

  const { mutate: markAllRead, isPending: markingAll } = useMutation({
    mutationFn: async () => {
      await http.post('/notifications/read-all');
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Todas marcadas como leídas');
    },
    onError: () => toast.error('Error al actualizar'),
  });

  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Notificaciones</h1>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todo al día'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllRead()}
            disabled={markingAll}
          >
            <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
            Marcar todas
          </Button>
        )}
      </div>

      {isLoading && (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && notifications?.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-20 text-center text-muted-foreground">
          <BellOff className="h-12 w-12 opacity-20" />
          <p className="font-display font-semibold">Sin notificaciones</p>
          <p className="text-sm">Aquí verás las actividades relevantes</p>
        </div>
      )}

      <div className="space-y-2">
        {notifications?.map((n) => {
          const cfg = getConfig(n.type);
          const Icon = cfg.icon;
          return (
            <div
              key={n.id}
              className={cn(
                'flex gap-4 rounded-xl border bg-card p-4 transition-all',
                !n.isRead ? 'border-l-4 border-l-primary shadow-sm' : 'opacity-70',
              )}
            >
              <div className={cn('mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg', cfg.color)}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className={cn('text-sm', !n.isRead && 'font-semibold')}>{n.title}</p>
                    {n.body && <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>}
                  </div>
                  {!n.isRead && (
                    <button
                      onClick={() => markRead(n.id)}
                      disabled={markingRead}
                      className="shrink-0 rounded-md p-1 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      title="Marcar como leída"
                    >
                      <CheckCheck className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">{formatDate(n.createdAt, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="text-muted-foreground/40">·</span>
                  <span className="text-[10px] text-muted-foreground">{cfg.label}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}