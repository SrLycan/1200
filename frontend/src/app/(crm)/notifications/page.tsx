'use client';

import { useQuery } from '@tanstack/react-query';
import { http } from '@/services/http';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

interface Notification {
  id: string;
  title: string;
  body?: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => (await http.get('/notifications')).data.data as Notification[],
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Notificaciones</h1>
      <div className="space-y-2">
        {data?.map((n) => (
          <Card key={n.id} className={n.isRead ? 'opacity-60' : ''}>
            <CardContent className="flex items-start justify-between p-4">
              <div>
                <p className="font-medium">{n.title}</p>
                {n.body && <p className="text-sm text-muted-foreground">{n.body}</p>}
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge variant="outline">{n.type}</Badge>
                <span className="text-xs text-muted-foreground">{formatDate(n.createdAt)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
