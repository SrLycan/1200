import { http } from '@/services/http';
import type { Conversation, Message, Paginated } from '@/types';

export const conversationsService = {
  async list(params?: { channel?: string; search?: string }): Promise<Paginated<Conversation>> {
    const { data } = await http.get('/conversations', { params });
    return data.data;
  },
  async get(id: string): Promise<Conversation> {
    const { data } = await http.get(`/conversations/${id}`);
    return data.data;
  },
  async messages(id: string): Promise<Paginated<Message>> {
    const { data } = await http.get(`/conversations/${id}/messages`, {
      params: { page: 1, pageSize: 50 },
    });
    return data.data;
  },
  async send(conversationId: string, body: string) {
    const { data } = await http.post('/messages', { conversationId, body });
    return data.data as Message;
  },
  async markRead(id: string) {
    await http.patch(`/conversations/${id}/read`);
  },
};
