export type UserRole = 'ADMIN' | 'GERENCIA' | 'SUPERVISOR' | 'ASESOR';

export type LeadStatus =
  | 'NEW'
  | 'TRIAGE'
  | 'QUALIFIED'
  | 'APPOINTMENT'
  | 'NEGOTIATION'
  | 'WON'
  | 'LOST';

export type LeadSource =
  | 'WHATSAPP'
  | 'INSTAGRAM'
  | 'FACEBOOK'
  | 'WEB'
  | 'REFERRAL'
  | 'WALK_IN'
  | 'PHONE'
  | 'OTHER';

export type LeadPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type ChannelType = 'WHATSAPP' | 'INSTAGRAM' | 'FACEBOOK' | 'WEB_CHAT' | 'EMAIL';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  role: UserRole;
  isActive: boolean;
}

export interface PipelineStage {
  id: string;
  slug: string;
  name: string;
  order: number;
  color?: string | null;
  isWon: boolean;
  isLost: boolean;
}

export interface Lead {
  id: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  source: LeadSource;
  status: LeadStatus;
  priority: LeadPriority;
  score: number;
  city?: string | null;
  notes?: string | null;
  tags: string[];
  ownerId?: string | null;
  owner?: User | null;
  pipelineStageId?: string | null;
  pipelineStage?: PipelineStage | null;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  channel: ChannelType;
  externalId: string;
  isOpen: boolean;
  unreadCount: number;
  lastMessageAt?: string | null;
  lead?: Lead | null;
  assignedTo?: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatarUrl'> | null;
  messages?: Message[];
}

export interface Message {
  id: string;
  conversationId: string;
  direction: 'INBOUND' | 'OUTBOUND';
  type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'LOCATION' | 'TEMPLATE' | 'INTERACTIVE' | 'SYSTEM';
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  body?: string | null;
  mediaUrl?: string | null;
  createdAt: string;
}

export interface Paginated<T> {
  data: T[];
  meta: { page: number; pageSize: number; total: number; totalPages: number };
}
