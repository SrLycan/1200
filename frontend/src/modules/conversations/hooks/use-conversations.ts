import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { conversationsService } from '../services/conversations.service';

export const useConversations = (search?: string) =>
  useQuery({
    queryKey: ['conversations', { search }],
    queryFn: () => conversationsService.list({ search }),
    refetchInterval: 15_000,
  });

export const useConversationMessages = (id: string | null) =>
  useQuery({
    queryKey: ['conversations', id, 'messages'],
    queryFn: () => conversationsService.messages(id!),
    enabled: !!id,
    refetchInterval: 5_000,
  });

export const useSendMessage = (conversationId: string | null) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => conversationsService.send(conversationId!, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['conversations', conversationId, 'messages'] });
      qc.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};
