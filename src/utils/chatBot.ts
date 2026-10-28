import { Message, Conversation, User } from '../types';
import { StorageService } from './storage';
import { sounds } from './audio';

const RESPONSES_BY_USER: Record<string, string[]> = {
  user_tanvir: [
    'হ্যাঁ ভাই, আমি মেসেজটা পেয়েছি। কোডিংয়ের কাজটা কেমন এগোচ্ছে?',
    'অসাধারণ! হোয়াটসঅ্যাপের নতুন ইন্টারফেসটা আসলেই দারুণ হয়েছে।',
    'ঠিক আছে ভাই, আমি এখনই চেক করে জানাচ্ছি।',
    'রিয়েল-টাইম মেসেজিং আর ভয়েস ফিচারটা মোবাইল আর পিসিতে খুব স্মুথ কাজ করছে!',
    'ইনশাআল্লাহ আজকের মধ্যেই বাকি টাস্কগুলো শেষ করে ফেলব।'
  ],
  user_sumaiya: [
    'ওয়াও! ডিজাইন এবং কালার প্যালেটটা একদম অরিজিনাল হোয়াটসঅ্যাপের মতো হয়েছে।',
    'আমি নতুন কিছু স্ট্যাটাস পোস্ট করেছি, দেখে মতামত দিয়েন! ✨',
    'ফাইল শেয়ারিং আর অডিও রিডার ফিচারটা অনেক কাজে আসবে।',
    'হ্যাঁ, আমি আছি। কোনো সাহায্যের দরকার হলে অবশ্যই বলবেন।'
  ],
  user_rahul: [
    'হ্যালো ভাই! ভ্রমণ থেকে ফিরে আসলাম। সব আপডেট দেখতেছি।',
    'ছবিটা খুব চমৎকার এসেছে!',
    'কিছুক্ষণ পর ফোন দিচ্ছি ভাই।'
  ],
  user_support_bot: [
    'ধন্যবাদ! হোয়াটসঅ্যাপ ওয়েবে আপনাকে সহায়তা করতে পেরে আমি আনন্দিত। 🤖',
    'আপনি চাইলে পেপারক্লিপ আইকন চেপে ছবি বা ডকুমেন্ট পাঠাতে পারেন, অথবা মাইক আইকনে চেপে ভয়েস মেসেজ পাঠাতে পারেন।',
    'মেসেজের ডান পাশে থাকা "স্পিকার" আইকনে ক্লিক করলে স্বয়ংক্রিয়ভাবে মেসেজটি পড়ে শোনাবে! 🔊',
    'উপরে স্ট্যাটাস ট্যাবে গিয়ে নতুন স্ট্যাটাস পোস্ট করতে পারেন এবং বন্ধুদের স্ট্যাটাস দেখতে পারেন। 🌟',
    'আমি সার্বক্ষণিক আপনার সাথে আছি। যেকোনো সময় টেস্ট মেসেজ পাঠাতে পারেন।'
  ]
};

export function simulateIncomingReply({
  conversation,
  sentMessage,
  currentUser,
  onTypingChange,
  onNewMessage
}: {
  conversation: Conversation;
  sentMessage: Message;
  currentUser: User;
  onTypingChange?: (conversationId: string, isTyping: boolean, typingUser?: string) => void;
  onNewMessage?: (msg: Message) => void;
}) {
  // Update sent message to delivered after 600ms
  setTimeout(() => {
    StorageService.updateMessageStatus(conversation.id, sentMessage.id, 'delivered');
  }, 650);

  // Pick responder
  let responderId: string | null = null;
  let responderName = '';
  let responderAvatar = '';

  const allUsers = StorageService.getUsers();

  if (conversation.isGroup) {
    // Pick another participant in group that is not current user
    const others = conversation.participants.filter(id => id !== currentUser.id);
    if (others.length > 0) {
      const randomId = others[Math.floor(Math.random() * others.length)];
      const user = allUsers.find(u => u.id === randomId);
      if (user) {
        responderId = user.id;
        responderName = user.name;
        responderAvatar = user.avatar;
      }
    }
  } else {
    // 1-on-1 chat
    const otherId = conversation.participants.find(id => id !== currentUser.id);
    const user = allUsers.find(u => u.id === otherId);
    if (user) {
      responderId = user.id;
      responderName = user.name;
      responderAvatar = user.avatar;
    }
  }

  if (!responderId) return;

  // Set typing indicator after 1.4s
  setTimeout(() => {
    // Mark original message as 'read'
    StorageService.updateMessageStatus(conversation.id, sentMessage.id, 'read');
    if (onTypingChange) {
      onTypingChange(conversation.id, true, responderName);
    }
  }, 1400);

  // Send reply after 2.8s
  setTimeout(() => {
    if (onTypingChange) {
      onTypingChange(conversation.id, false);
    }

    const pool = RESPONSES_BY_USER[responderId!] || [
      'ধন্যবাদ আপনার মেসেজের জন্য! 😊',
      'হ্যাঁ, আমি মেসেজ পেয়েছি।',
      'ঠিক আছে ভাই, যোগাযোগে আছি।'
    ];
    const replyText = pool[Math.floor(Math.random() * pool.length)];

    const replyMsg: Message = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      conversationId: conversation.id,
      senderId: responderId!,
      senderName: responderName,
      senderAvatar: responderAvatar,
      type: 'text',
      text: replyText,
      timestamp: Date.now(),
      status: 'read'
    };

    StorageService.saveMessage(replyMsg);
    sounds.playReceivedSound();

    if (onNewMessage) {
      onNewMessage(replyMsg);
    }
  }, 2900);
}
