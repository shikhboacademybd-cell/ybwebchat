import { User, Conversation, Message, StatusItem } from '../types';

export const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80'
];

export const INITIAL_USERS: User[] = [
  {
    id: 'user_yeakub',
    name: 'Md. Yeakub Ali',
    phone: '01861384470',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    bio: 'হোয়াটসঅ্যাপে আছি। ব্যস্ত থাকলে মেসেজ দিন।',
    isOnline: true,
  },
  {
    id: 'user_tanvir',
    name: 'তানভীর আহমেদ',
    phone: '01711223344',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: 'সফটওয়্যার ডেভেলপার | কোডিং ইজ লাইফ 💻',
    isOnline: true,
  },
  {
    id: 'user_sumaiya',
    name: 'সুমাইয়া জান্নাত',
    phone: '01988776655',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    bio: 'ইউআই/ইউএক্স ডিজাইনার 🎨 সব সময় সৃষ্টিশীল থাকতে পছন্দ করি।',
    isOnline: true,
  },
  {
    id: 'user_rahul',
    name: 'রাহুল চৌধুরী',
    phone: '01533445566',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    bio: 'ভ্রমনপিপাসু 🌍',
    isOnline: false,
    lastSeen: 'আজ দুপুর ১২:৪৫',
  },
  {
    id: 'user_support_bot',
    name: 'হোয়াটসঅ্যাপ সাপোর্ট সহকারী',
    phone: '01800000000',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    bio: 'স্মার্ট অটোমেশন ও মেসেজিং বট 🤖 সার্বক্ষণিক সহযোগিতায় প্রস্তুত।',
    isOnline: true,
    isBot: true,
  }
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv_tanvir',
    isGroup: false,
    name: 'তানভীর আহমেদ',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    participants: ['user_yeakub', 'user_tanvir'],
    unreadCount: 0,
    lastMessage: {
      id: 'msg_init_1',
      conversationId: 'conv_tanvir',
      senderId: 'user_tanvir',
      senderName: 'তানভীর আহমেদ',
      type: 'text',
      text: 'আসসালামু আলাইকুম ইয়াকুব ভাই! নতুন হোয়াটসঅ্যাপ প্রজেক্টের কাজ কেমন চলছে?',
      timestamp: Date.now() - 1000 * 60 * 15,
      status: 'read'
    }
  },
  {
    id: 'conv_group_friends',
    isGroup: true,
    name: 'বন্ধুমহল আড্ডাখানা 🌟',
    avatar: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=150&auto=format&fit=crop&q=80',
    participants: ['user_yeakub', 'user_tanvir', 'user_sumaiya', 'user_rahul'],
    adminIds: ['user_yeakub'],
    groupDescription: 'আমাদের বন্ধুদের আড্ডা, প্রজেক্ট আলোচনা ও ফাইল শেয়ারিং গ্রুপ।',
    unreadCount: 1,
    lastMessage: {
      id: 'msg_init_2',
      conversationId: 'conv_group_friends',
      senderId: 'user_sumaiya',
      senderName: 'সুমাইয়া জান্নাত',
      type: 'text',
      text: 'সবাইকে স্বাগতম! নতুন গ্রুপে যেকোনো ফাইল বা ছবি শেয়ার করতে পারেন।',
      timestamp: Date.now() - 1000 * 60 * 5,
      status: 'delivered'
    }
  },
  {
    id: 'conv_sumaiya',
    isGroup: false,
    name: 'সুমাইয়া জান্নাত',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    participants: ['user_yeakub', 'user_sumaiya'],
    unreadCount: 0,
    lastMessage: {
      id: 'msg_init_3',
      conversationId: 'conv_sumaiya',
      senderId: 'user_sumaiya',
      senderName: 'সুমাইয়া জান্নাত',
      type: 'image',
      fileUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&auto=format&fit=crop&q=80',
      text: 'নতুন ডিজাইন টেমপ্লেটটি দেখে জানাবেন কেমন লাগল।',
      timestamp: Date.now() - 1000 * 60 * 45,
      status: 'read'
    }
  },
  {
    id: 'conv_bot',
    isGroup: false,
    name: 'হোয়াটসঅ্যাপ সাপোর্ট সহকারী',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    participants: ['user_yeakub', 'user_support_bot'],
    unreadCount: 0,
    lastMessage: {
      id: 'msg_init_4',
      conversationId: 'conv_bot',
      senderId: 'user_support_bot',
      senderName: 'হোয়াটসঅ্যাপ সাপোর্ট সহকারী',
      type: 'text',
      text: 'স্বাগতম! আমি আপনার ডিজিটাল চ্যাট সহকারী। আমাকে যেকোনো প্রশ্ন করতে পারেন বা ফাইল পাঠিয়ে দেখতে পারেন।',
      timestamp: Date.now() - 1000 * 60 * 120,
      status: 'read'
    }
  }
];

export const INITIAL_MESSAGES: Record<string, Message[]> = {
  conv_tanvir: [
    {
      id: 'm1',
      conversationId: 'conv_tanvir',
      senderId: 'user_yeakub',
      senderName: 'Md. Yeakub Ali',
      type: 'text',
      text: 'হ্যালো তানভীর, কেমন আছেন?',
      timestamp: Date.now() - 1000 * 60 * 25,
      status: 'read'
    },
    {
      id: 'm2',
      conversationId: 'conv_tanvir',
      senderId: 'user_tanvir',
      senderName: 'তানভীর আহমেদ',
      type: 'text',
      text: 'আলহামদুলিল্লাহ ভালো ভাই। আপনি কেমন আছেন?',
      timestamp: Date.now() - 1000 * 60 * 20,
      status: 'read'
    },
    {
      id: 'm3',
      conversationId: 'conv_tanvir',
      senderId: 'user_tanvir',
      senderName: 'তানভীর আহমেদ',
      type: 'text',
      text: 'আসসালামু আলাইকুম ইয়াকুব ভাই! নতুন হোয়াটসঅ্যাপ প্রজেক্টের কাজ কেমন চলছে?',
      timestamp: Date.now() - 1000 * 60 * 15,
      status: 'read'
    }
  ],
  conv_group_friends: [
    {
      id: 'mg1',
      conversationId: 'conv_group_friends',
      senderId: 'user_yeakub',
      senderName: 'Md. Yeakub Ali',
      type: 'text',
      text: 'সবাইকে স্বাগতম আমাদের নতুন গ্রুপে!',
      timestamp: Date.now() - 1000 * 60 * 30,
      status: 'read'
    },
    {
      id: 'mg2',
      conversationId: 'conv_group_friends',
      senderId: 'user_sumaiya',
      senderName: 'সুমাইয়া জান্নাত',
      type: 'text',
      text: 'সবাইকে স্বাগতম! নতুন গ্রুপে যেকোনো ফাইল বা ছবি শেয়ার করতে পারেন।',
      timestamp: Date.now() - 1000 * 60 * 5,
      status: 'delivered'
    }
  ],
  conv_sumaiya: [
    {
      id: 'ms1',
      conversationId: 'conv_sumaiya',
      senderId: 'user_sumaiya',
      senderName: 'সুমাইয়া জান্নাত',
      type: 'image',
      fileUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&auto=format&fit=crop&q=80',
      text: 'নতুন ডিজাইন টেমপ্লেটটি দেখে জানাবেন কেমন লাগল।',
      timestamp: Date.now() - 1000 * 60 * 45,
      status: 'read'
    }
  ],
  conv_bot: [
    {
      id: 'mb1',
      conversationId: 'conv_bot',
      senderId: 'user_support_bot',
      senderName: 'হোয়াটসঅ্যাপ সাপোর্ট সহকারী',
      type: 'text',
      text: 'স্বাগতম! আমি আপনার ডিজিটাল চ্যাট সহকারী। আমাকে যেকোনো প্রশ্ন করতে পারেন বা ফাইল পাঠিয়ে দেখতে পারেন।',
      timestamp: Date.now() - 1000 * 60 * 120,
      status: 'read'
    }
  ]
};

export const INITIAL_STATUSES: StatusItem[] = [
  {
    id: 'st_1',
    userId: 'user_sumaiya',
    userName: 'সুমাইয়া জান্নাত',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    type: 'image',
    content: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    caption: 'সাগরের তীরে অসাধারণ সূর্যাস্ত! 🌅',
    timestamp: Date.now() - 1000 * 60 * 90,
    viewers: ['user_tanvir']
  },
  {
    id: 'st_2',
    userId: 'user_tanvir',
    userName: 'তানভীর আহমেদ',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    type: 'text',
    content: 'নতুন দিনের নতুন প্রত্যয়! "পরিশ্রম কখনো বৃথা যায় না।" ✨',
    bgColor: '#005c4b',
    timestamp: Date.now() - 1000 * 60 * 240,
    viewers: ['user_yeakub', 'user_sumaiya']
  }
];

export class StorageService {
  private static CHANNEL_NAME = 'whatsapp_web_sync_v1';
  private static channel: BroadcastChannel | null = typeof window !== 'undefined' && 'BroadcastChannel' in window ? new BroadcastChannel(StorageService.CHANNEL_NAME) : null;

  static initData() {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem('wa_users')) {
      localStorage.setItem('wa_users', JSON.stringify(INITIAL_USERS));
    }
    if (!localStorage.getItem('wa_conversations')) {
      localStorage.setItem('wa_conversations', JSON.stringify(INITIAL_CONVERSATIONS));
    }
    if (!localStorage.getItem('wa_messages')) {
      localStorage.setItem('wa_messages', JSON.stringify(INITIAL_MESSAGES));
    }
    if (!localStorage.getItem('wa_statuses')) {
      localStorage.setItem('wa_statuses', JSON.stringify(INITIAL_STATUSES));
    }
  }

  static ensureUserConversations(currentUser: User): Conversation[] {
    if (typeof window === 'undefined') return INITIAL_CONVERSATIONS;
    this.initData();
    let convs = this.getConversations();

    // Check if user has conversations
    const userConvs = convs.filter(c => c.participants.includes(currentUser.id));
    if (userConvs.length === 0) {
      // Create initial conversation list for this user
      const defaultContacts = [
        {
          id: 'user_support_bot',
          name: 'হোয়াটসঅ্যাপ সাপোর্ট সহকারী',
          phone: '01800000000',
          avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
          initialMsg: `স্বাগতম ${currentUser.name}! হোয়াটসঅ্যাপ ওয়েবে আপনার অ্যাকাউন্ট সফলভাবে চালু হয়েছে। যেকোনো প্রশ্ন থাকলে জিজ্ঞাসা করতে পারেন। 🤖`
        },
        {
          id: 'user_tanvir',
          name: 'তানভীর আহমেদ',
          phone: '01711223344',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          initialMsg: 'হ্যালো! হোয়াটসঅ্যাপে স্বাগতম। কাজের আপডেট থাকলে জানাবেন।'
        },
        {
          id: 'user_sumaiya',
          name: 'সুমাইয়া জান্নাত',
          phone: '01988776655',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
          initialMsg: 'আসসালামু আলাইকুম! কেমন আছেন? নতুন প্রজেক্টের ডিজাইনটি দেখবেন।'
        },
        {
          id: 'user_rahul',
          name: 'রাহুল চৌধুরী',
          phone: '01533445566',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
          initialMsg: 'হ্যালো বন্ধু! কী অবস্থা?'
        }
      ];

      const newConvs: Conversation[] = [];
      const messagesStr = localStorage.getItem('wa_messages');
      const allMessages = messagesStr ? JSON.parse(messagesStr) : {};

      defaultContacts.forEach((contact, idx) => {
        const convId = `conv_${currentUser.id}_${contact.id}`;
        const msgId = `msg_init_${Date.now()}_${idx}`;
        const firstMsg: Message = {
          id: msgId,
          conversationId: convId,
          senderId: contact.id,
          senderName: contact.name,
          type: 'text',
          text: contact.initialMsg,
          timestamp: Date.now() - (idx + 1) * 1000 * 60 * 10,
          status: 'read'
        };

        allMessages[convId] = [firstMsg];

        newConvs.push({
          id: convId,
          isGroup: false,
          name: contact.name,
          avatar: contact.avatar,
          participants: [currentUser.id, contact.id],
          unreadCount: idx === 0 ? 1 : 0,
          lastMessage: firstMsg
        });
      });

      // Add group chat
      const grpConvId = `conv_${currentUser.id}_grp_friends`;
      const grpMsg: Message = {
        id: `msg_grp_init_${Date.now()}`,
        conversationId: grpConvId,
        senderId: 'user_sumaiya',
        senderName: 'সুমাইয়া জান্নাত',
        type: 'text',
        text: 'সবাইকে স্বাগতম আমাদের গ্রুপে! এখানে ছবি ও ফাইল শেয়ার করতে পারেন।',
        timestamp: Date.now() - 1000 * 60 * 5,
        status: 'delivered'
      };
      allMessages[grpMsg.conversationId] = [grpMsg];

      newConvs.unshift({
        id: grpConvId,
        isGroup: true,
        name: 'বন্ধুমহল আড্ডাখানা 🌟',
        avatar: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=150&auto=format&fit=crop&q=80',
        participants: [currentUser.id, 'user_tanvir', 'user_sumaiya', 'user_rahul'],
        adminIds: [currentUser.id],
        groupDescription: 'বন্ধুদের নিয়মিত যোগাযোগ ও ফাইল শেয়ারিং গ্রুপ',
        unreadCount: 1,
        lastMessage: grpMsg
      });

      localStorage.setItem('wa_messages', JSON.stringify(allMessages));
      convs = [...newConvs, ...convs];
      this.saveConversations(convs);
    }

    return convs.filter(c => c.participants.includes(currentUser.id));
  }

  static getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    const str = localStorage.getItem('wa_current_user');
    if (!str) return null;
    try {
      return JSON.parse(str);
    } catch {
      return null;
    }
  }

  static setCurrentUser(user: User | null) {
    if (typeof window === 'undefined') return;
    if (user) {
      localStorage.setItem('wa_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('wa_current_user');
    }
    this.broadcast({ type: 'USER_CHANGED', payload: user });
  }

  static getUsers(): User[] {
    if (typeof window === 'undefined') return INITIAL_USERS;
    const str = localStorage.getItem('wa_users');
    return str ? JSON.parse(str) : INITIAL_USERS;
  }

  static saveUser(user: User) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem('wa_users', JSON.stringify(users));
    this.broadcast({ type: 'USERS_UPDATED', payload: users });
  }

  static getConversations(): Conversation[] {
    if (typeof window === 'undefined') return INITIAL_CONVERSATIONS;
    const str = localStorage.getItem('wa_conversations');
    return str ? JSON.parse(str) : INITIAL_CONVERSATIONS;
  }

  static saveConversations(convs: Conversation[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('wa_conversations', JSON.stringify(convs));
    this.broadcast({ type: 'CONVERSATIONS_UPDATED', payload: convs });
  }

  static getMessages(conversationId: string): Message[] {
    if (typeof window === 'undefined') return [];
    const str = localStorage.getItem('wa_messages');
    const all = str ? JSON.parse(str) : INITIAL_MESSAGES;
    return all[conversationId] || [];
  }

  static saveMessage(msg: Message) {
    if (typeof window === 'undefined') return;
    const str = localStorage.getItem('wa_messages');
    const all = str ? JSON.parse(str) : INITIAL_MESSAGES;
    if (!all[msg.conversationId]) {
      all[msg.conversationId] = [];
    }
    const idx = all[msg.conversationId].findIndex((m: Message) => m.id === msg.id);
    if (idx >= 0) {
      all[msg.conversationId][idx] = msg;
    } else {
      all[msg.conversationId].push(msg);
    }
    localStorage.setItem('wa_messages', JSON.stringify(all));

    // Update conversation lastMessage
    const convs = this.getConversations();
    const cIdx = convs.findIndex(c => c.id === msg.conversationId);
    if (cIdx >= 0) {
      convs[cIdx].lastMessage = msg;
      convs.sort((a, b) => {
        const timeA = a.lastMessage?.timestamp || 0;
        const timeB = b.lastMessage?.timestamp || 0;
        return timeB - timeA;
      });
      this.saveConversations(convs);
    }

    this.broadcast({ type: 'MESSAGE_SENT', payload: msg });
  }

  static updateMessageStatus(conversationId: string, messageId: string, status: Message['status']) {
    if (typeof window === 'undefined') return;
    const str = localStorage.getItem('wa_messages');
    const all = str ? JSON.parse(str) : INITIAL_MESSAGES;
    if (all[conversationId]) {
      const target = all[conversationId].find((m: Message) => m.id === messageId);
      if (target) {
        target.status = status;
        localStorage.setItem('wa_messages', JSON.stringify(all));
        this.broadcast({ type: 'MESSAGE_STATUS_UPDATED', payload: { conversationId, messageId, status } });
      }
    }
  }

  static getStatuses(): StatusItem[] {
    if (typeof window === 'undefined') return INITIAL_STATUSES;
    const str = localStorage.getItem('wa_statuses');
    return str ? JSON.parse(str) : INITIAL_STATUSES;
  }

  static addStatus(status: StatusItem) {
    const list = this.getStatuses();
    list.unshift(status);
    localStorage.setItem('wa_statuses', JSON.stringify(list));
    this.broadcast({ type: 'STATUS_ADDED', payload: status });
  }

  static broadcast(event: { type: string; payload: unknown }) {
    if (this.channel) {
      try {
        this.channel.postMessage(event);
      } catch {
        // channel error
      }
    }
  }

  static onSync(callback: (event: { type: string; payload: unknown }) => void) {
    if (!this.channel) return () => {};
    const handler = (e: MessageEvent) => {
      callback(e.data);
    };
    this.channel.addEventListener('message', handler);
    return () => {
      this.channel?.removeEventListener('message', handler);
    };
  }
}
