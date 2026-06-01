'use client';

import { useState } from 'react';
import { Send, MessageCircle } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  useConversations,
  useConversationMessages,
  useSendMessage,
} from '@/modules/conversations/hooks/use-conversations';
import { cn, formatDate, initials } from '@/lib/utils';

export default function ConversationsPage() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const { data: convs } = useConversations();
  const { data: msgs } = useConversationMessages(activeId);
  const { mutateAsync: send, isPending } = useSendMessage(activeId);

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim() || !activeId) return;
    await send(draft.trim());
    setDraft('');
  }

  return (
    <div className="grid h-[calc(100vh-7rem)] grid-cols-12 gap-4">
      {/* Lista */}
      <Card className="col-span-12 overflow-y-auto p-2 md:col-span-4 lg:col-span-3">
        <h2 className="px-2 py-3 text-sm font-semibold">Bandeja</h2>
        {convs?.data?.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveId(c.id)}
            className={cn(
              'flex w-full items-center gap-3 rounded-md p-3 text-left transition-colors hover:bg-accent',
              activeId === c.id && 'bg-accent',
            )}
          >
            <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {initials(c.lead?.fullName ?? c.externalId)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="truncate text-sm font-medium">
                  {c.lead?.fullName ?? c.externalId}
                </p>
                {c.unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {c.unreadCount}
                  </Badge>
                )}
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {c.channel} · {c.lastMessageAt ? formatDate(c.lastMessageAt) : '—'}
              </p>
            </div>
          </button>
        ))}
        {convs?.data?.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground">Sin conversaciones</p>
        )}
      </Card>

      {/* Chat */}
      <Card className="col-span-12 flex flex-col md:col-span-8 lg:col-span-9">
        {!activeId ? (
          <div className="grid flex-1 place-items-center text-muted-foreground">
            <div className="text-center">
              <MessageCircle className="mx-auto mb-2 h-10 w-10 opacity-50" />
              Selecciona una conversación
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {msgs?.data?.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    'max-w-[70%] rounded-lg px-3 py-2 text-sm',
                    m.direction === 'OUTBOUND'
                      ? 'ml-auto bg-primary text-primary-foreground'
                      : 'bg-muted',
                  )}
                >
                  <p>{m.body}</p>
                  <p className="mt-1 text-[10px] opacity-70">{formatDate(m.createdAt, { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              ))}
            </div>
            <form onSubmit={onSend} className="flex gap-2 border-t p-3">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Escribe un mensaje..."
              />
              <Button type="submit" disabled={isPending || !draft.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </>
        )}
      </Card>
    </div>
  );
}
