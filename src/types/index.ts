export interface User {
  id: string;
  name: string;
  phone: string;
  password?: string;
  avatar: string;
  bio: string;
  isOnline: boolean;
  lastSeen?: string;
  createdAt?: number;
  isBot?: boolean;
}

export type MessageType = 'text' | 'image' | 'audio' | 'file';
export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  type: MessageType;
  text?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  audioDuration?: number;
  timestamp: number;
  status: MessageStatus;
}

export interface Conversation {
  id: string;
  isGroup: boolean;
  name: string;
  avatar: string;
  participants: string[]; // user IDs
  adminIds?: string[];
  lastMessage?: Message;
  unreadCount: number;
  isTyping?: boolean;
  typingUserName?: string;
  groupDescription?: string;
  updatedAt?: number;
}

export interface StatusItem {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  type: 'text' | 'image';
  content: string; // text string or image data URL
  caption?: string;
  bgColor?: string;
  timestamp: number;
  viewers: string[];
}

export interface InAppNotification {
  id: string;
  conversationId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: number;
}
