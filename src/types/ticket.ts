export type TicketType = 'staff' | 'support';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface TicketMessage {
  id: string;
  senderId: string;
  senderRole: string;
  message: string;
  timestamp: string;
}

export interface Ticket {
  id: string;
  type: TicketType;
  createdBy: string; // user id
  subject: string;
  description: string;
  status: TicketStatus;
  messages: TicketMessage[];
  createdAt: string;
} 