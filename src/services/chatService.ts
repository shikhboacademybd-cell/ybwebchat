import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  limit
} from 'firebase/firestore';
import { db } from './firebase';
import { User, Conversation, Message, StatusItem } from '../types';

export class ChatService {
  // 1. Register User in Firestore
  static async registerUser(userData: {
    name: string;
    phone: string;
    password: string;
    avatar?: string;
  }): Promise<User> {
    const cleanPhone = userData.phone.trim();
    const usersRef = collection(db, 'users');

    // Check if phone already registered
    const q = query(usersRef, where('phone', '==', cleanPhone));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      throw new Error('এই ফোন নম্বর দিয়ে ইতিমধ্যে অ্যাকাউন্ট রয়েছে। অনুগ্রহ করে লগইন করুন।');
    }

    const userId = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const newUser: User = {
      id: userId,
      name: userData.name.trim(),
      phone: cleanPhone,
      password: userData.password,
      avatar:
        userData.avatar ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      bio: 'হোয়াটসঅ্যাপে আছি। ব্যস্ত থাকলে মেসেজ দিন।',
      isOnline: true,
      createdAt: Date.now()
    };

    await setDoc(doc(db, 'users', userId), newUser);
    return newUser;
  }

  // 2. Login User from Firestore
  static async loginUser(phone: string, password: string): Promise<User> {
    const cleanPhone = phone.trim();
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('phone', '==', cleanPhone));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error('এই নম্বরে কোনো অ্যাকাউন্ট পাওয়া যায়নি। অনুগ্রহ করে আগে রেজিস্ট্রেশন করুন।');
    }

    const userDoc = querySnapshot.docs[0];
    const user = userDoc.data() as User;

    if (user.password !== password) {
      throw new Error('ভুল পাসওয়ার্ড। আবার চেষ্টা করুন।');
    }

    // Set user online
    await updateDoc(doc(db, 'users', user.id), {
      isOnline: true,
      lastSeen: 'এখন অনলাইনে'
    });

    return { ...user, isOnline: true };
  }

  // 3. Find User by Phone in Firestore
  static async findUserByPhone(phone: string): Promise<User | null> {
    const cleanPhone = phone.trim();
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('phone', '==', cleanPhone));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    return querySnapshot.docs[0].data() as User;
  }

  // 4. Update User Profile
  static async updateUser(user: User): Promise<void> {
    await updateDoc(doc(db, 'users', user.id), {
      name: user.name,
      avatar: user.avatar,
      bio: user.bio
    });
  }

  // 5. Set Online / Offline
  static async setUserOnline(userId: string, isOnline: boolean): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', userId), {
        isOnline,
        lastSeen: isOnline ? 'এখন অনলাইনে' : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    } catch {
      // Ignore on disconnect
    }
  }

  // 6. Get or Create 1-on-1 Conversation
  static async getOrCreateDirectConversation(
    currentUser: User,
    targetUser: User
  ): Promise<Conversation> {
    const convsRef = collection(db, 'conversations');
    const snapshot = await getDocs(convsRef);

    let existing: Conversation | null = null;
    snapshot.forEach((d) => {
      const data = d.data() as Conversation;
      if (
        !data.isGroup &&
        data.participants.includes(currentUser.id) &&
        data.participants.includes(targetUser.id)
      ) {
        existing = data;
      }
    });

    if (existing) {
      return existing;
    }

    // Create new conversation document
    const convId = 'conv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const newConv: Conversation = {
      id: convId,
      isGroup: false,
      name: targetUser.name,
      avatar: targetUser.avatar,
      participants: [currentUser.id, targetUser.id],
      unreadCount: 0,
      updatedAt: Date.now()
    };

    await setDoc(doc(db, 'conversations', convId), newConv);
    return newConv;
  }

  // 7. Create Group Conversation
  static async createGroupConversation(
    currentUser: User,
    groupName: string,
    groupAvatar: string,
    participantIds: string[],
    groupDescription?: string
  ): Promise<Conversation> {
    const convId = 'grp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const newConv: Conversation = {
      id: convId,
      isGroup: true,
      name: groupName.trim(),
      avatar: groupAvatar,
      participants: [currentUser.id, ...participantIds],
      adminIds: [currentUser.id],
      groupDescription: groupDescription || '',
      unreadCount: 0,
      updatedAt: Date.now()
    };

    await setDoc(doc(db, 'conversations', convId), newConv);

    // Initial system message
    const msgId = 'msg_' + Date.now();
    const systemMsg: Message = {
      id: msgId,
      conversationId: convId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      type: 'text',
      text: `"${groupName.trim()}" গ্রুপ তৈরি করা হয়েছে।`,
      timestamp: Date.now(),
      status: 'read'
    };

    await setDoc(doc(db, 'conversations', convId, 'messages', msgId), systemMsg);
    await updateDoc(doc(db, 'conversations', convId), {
      lastMessage: systemMsg
    });

    return newConv;
  }

  // 8. Real-time subscribe to conversations for currentUser
  static subscribeToConversations(
    currentUserId: string,
    callback: (conversations: Conversation[]) => void
  ) {
    const convsRef = collection(db, 'conversations');

    return onSnapshot(convsRef, (snapshot) => {
      const list: Conversation[] = [];
      snapshot.forEach((d) => {
        const c = d.data() as Conversation;
        if (c.participants && c.participants.includes(currentUserId)) {
          list.push(c);
        }
      });

      // Sort by updatedAt or lastMessage timestamp descending
      list.sort((a, b) => {
        const timeA = a.lastMessage?.timestamp || a.updatedAt || 0;
        const timeB = b.lastMessage?.timestamp || b.updatedAt || 0;
        return timeB - timeA;
      });

      callback(list);
    });
  }

  // 9. Real-time subscribe to messages of a conversation
  static subscribeToMessages(
    conversationId: string,
    callback: (messages: Message[]) => void
  ) {
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    return onSnapshot(q, (snapshot) => {
      const msgs: Message[] = [];
      snapshot.forEach((d) => {
        msgs.push(d.data() as Message);
      });
      callback(msgs);
    });
  }

  // 10. Send a Message into Firestore
  static async sendMessage(
    conversationId: string,
    message: Message
  ): Promise<void> {
    const messageDocRef = doc(db, 'conversations', conversationId, 'messages', message.id);
    await setDoc(messageDocRef, message);

    // Update conversation lastMessage & updatedAt
    const convDocRef = doc(db, 'conversations', conversationId);
    await updateDoc(convDocRef, {
      lastMessage: message,
      updatedAt: Date.now()
    });
  }

  // 11. Mark messages as read
  static async markMessagesAsRead(
    conversationId: string,
    currentUserId: string,
    messages: Message[]
  ): Promise<void> {
    for (const msg of messages) {
      if (msg.senderId !== currentUserId && msg.status !== 'read') {
        try {
          const msgRef = doc(db, 'conversations', conversationId, 'messages', msg.id);
          await updateDoc(msgRef, { status: 'read' });
        } catch {
          // Ignore
        }
      }
    }
  }

  // 12. Real-time subscribe to Statuses
  static subscribeToStatuses(callback: (statuses: StatusItem[]) => void) {
    const statusesRef = collection(db, 'statuses');
    const q = query(statusesRef, orderBy('timestamp', 'desc'), limit(50));

    return onSnapshot(q, (snapshot) => {
      const items: StatusItem[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as StatusItem);
      });
      callback(items);
    });
  }

  // 13. Add new Status to Firestore
  static async addStatus(status: StatusItem): Promise<void> {
    await setDoc(doc(db, 'statuses', status.id), status);
  }
}
