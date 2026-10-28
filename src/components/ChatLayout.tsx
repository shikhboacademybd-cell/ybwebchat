import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Plus,
  Users,
  Paperclip,
  Mic,
  Send,
  Smile,
  ChevronLeft,
  X,
  FileText,
  Image as ImageIcon,
  Radio,
  Sparkles,
  Volume2,
  UserPlus,
  LogOut,
  CheckCheck,
  Check,
  ShieldCheck,
  Phone
} from 'lucide-react';
import { User, Conversation, Message, InAppNotification } from '../types';
import { ChatService } from '../services/chatService';
import { sounds, MessageSpeaker } from '../utils/audio';
import { MessageItem } from './MessageItem';
import { StatusModal } from './StatusModal';
import { ProfileModal } from './ProfileModal';
import { AddContactModal } from './AddContactModal';
import { CreateGroupModal } from './CreateGroupModal';

interface ChatLayoutProps {
  currentUser: User;
  onLogout: () => void;
  lang: 'bn' | 'en';
  setLang: (lang: 'bn' | 'en') => void;
}

type FilterType = 'all' | 'unread' | 'groups' | 'contacts';

const COMMON_EMOJIS = ['😀', '😂', '😍', '👏', '🔥', '👍', '❤️', '🙏', '🎉', '💯', '😎', '🤝', '😊', '🥳'];

export const ChatLayout: React.FC<ChatLayoutProps> = ({
  currentUser,
  onLogout,
  lang,
  setLang
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [notification, setNotification] = useState<InAppNotification | null>(null);

  // Modals
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Voice recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previousLastMessageIdRef = useRef<Record<string, string>>({});

  // 1. Subscribe in real time to user's conversations from Firebase Firestore
  useEffect(() => {
    const unsub = ChatService.subscribeToConversations(currentUser.id, (convs) => {
      // Check for incoming new messages to trigger chime & notification
      convs.forEach((c) => {
        if (c.lastMessage && c.lastMessage.senderId !== currentUser.id) {
          const prevMsgId = previousLastMessageIdRef.current[c.id];
          if (prevMsgId && prevMsgId !== c.lastMessage.id) {
            // New message arrived!
            sounds.playReceivedSound();
            if (activeConvId !== c.id) {
              setNotification({
                id: c.lastMessage.id,
                conversationId: c.id,
                senderName: c.lastMessage.senderName,
                senderAvatar: c.lastMessage.senderAvatar || c.avatar,
                text: c.lastMessage.text || (c.lastMessage.type === 'image' ? 'একটি ছবি পাঠিয়েছেন' : 'একটি ফাইল পাঠিয়েছেন'),
                timestamp: c.lastMessage.timestamp
              });
              setTimeout(() => setNotification(null), 5000);
            }
          }
          previousLastMessageIdRef.current[c.id] = c.lastMessage.id;
        }
      });

      setConversations(convs);

      // On wide desktop screen (>= 1024px), if no chat active and there are conversations, select first
      if (typeof window !== 'undefined' && window.innerWidth >= 1024 && !activeConvId && convs.length > 0) {
        setActiveConvId(convs[0].id);
      }
    });

    return () => unsub();
  }, [currentUser.id, activeConvId]);

  // 2. Subscribe in real time to messages of the active conversation from Firestore
  useEffect(() => {
    if (!activeConvId) {
      setMessages([]);
      return;
    }

    const unsub = ChatService.subscribeToMessages(activeConvId, (msgs) => {
      setMessages(msgs);
      // Mark unread messages as read
      ChatService.markMessagesAsRead(activeConvId, currentUser.id, msgs).catch(() => {});
    });

    return () => unsub();
  }, [activeConvId, currentUser.id]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const activeConversation = conversations.find((c) => c.id === activeConvId);

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeFilter === 'unread') return c.unreadCount > 0;
    if (activeFilter === 'groups') return c.isGroup === true;
    if (activeFilter === 'contacts') return c.isGroup === false;
    return true;
  });

  // Send Text Message to Firebase Firestore
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeConversation) return;

    const messageText = inputText.trim();
    setInputText('');
    setShowEmojiPicker(false);

    const msgId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const newMsg: Message = {
      id: msgId,
      conversationId: activeConversation.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      type: 'text',
      text: messageText,
      timestamp: Date.now(),
      status: 'sent'
    };

    sounds.playSentSound();

    try {
      await ChatService.sendMessage(activeConversation.id, newMsg);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  // Send Image attachment to Firebase Firestore
  const handleImageSend = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeConversation) return;

    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result === 'string') {
        const msgId = 'msg_' + Date.now();
        const newMsg: Message = {
          id: msgId,
          conversationId: activeConversation.id,
          senderId: currentUser.id,
          senderName: currentUser.name,
          senderAvatar: currentUser.avatar,
          type: 'image',
          fileUrl: reader.result,
          text: inputText.trim() || undefined,
          timestamp: Date.now(),
          status: 'sent'
        };

        sounds.playSentSound();
        setInputText('');
        setShowAttachMenu(false);

        try {
          await ChatService.sendMessage(activeConversation.id, newMsg);
        } catch (err) {
          console.error('Failed to send image:', err);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Send Document attachment to Firebase Firestore
  const handleFileSend = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeConversation) return;

    const sizeStr = (file.size / 1024 / 1024).toFixed(1) + ' MB';
    const reader = new FileReader();
    reader.onload = async () => {
      const msgId = 'msg_' + Date.now();
      const newMsg: Message = {
        id: msgId,
        conversationId: activeConversation.id,
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar,
        type: 'file',
        fileUrl: typeof reader.result === 'string' ? reader.result : undefined,
        fileName: file.name,
        fileSize: sizeStr,
        timestamp: Date.now(),
        status: 'sent'
      };

      sounds.playSentSound();
      setShowAttachMenu(false);

      try {
        await ChatService.sendMessage(activeConversation.id, newMsg);
      } catch (err) {
        console.error('Failed to send file:', err);
      }
    };
    reader.readAsDataURL(file);
  };

  // Voice recording
  const startRecording = async () => {
    sounds.playRecordBeep();
    setIsRecording(true);
    setRecordSeconds(0);
    audioChunksRef.current = [];

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };
        mediaRecorder.start();
      }
    } catch {
      // Stream fallback
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const stopAndSendRecording = async () => {
    if (!activeConversation) return;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      } catch {
        // Ignore
      }
    }

    setIsRecording(false);
    const duration = Math.max(1, recordSeconds);

    const msgId = 'msg_voice_' + Date.now();
    const newMsg: Message = {
      id: msgId,
      conversationId: activeConversation.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      type: 'audio',
      audioDuration: duration,
      timestamp: Date.now(),
      status: 'sent'
    };

    sounds.playSentSound();

    try {
      await ChatService.sendMessage(activeConversation.id, newMsg);
    } catch (err) {
      console.error('Failed to send voice note:', err);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      } catch {
        // Ignore
      }
    }
    setIsRecording(false);
    setRecordSeconds(0);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0c1517] text-[#e9edef] select-none">
      {/* Hidden File Pickers */}
      <input
        type="file"
        ref={imageInputRef}
        onChange={handleImageSend}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSend}
        accept=".pdf,.doc,.docx,.txt,.zip"
        className="hidden"
      />

      {/* Floating Push Notification Banner */}
      {notification && (
        <div
          onClick={() => {
            setActiveConvId(notification.conversationId);
            setNotification(null);
          }}
          className="fixed top-4 right-4 z-50 max-w-sm bg-[#112225] border-2 border-[#00a884] rounded-2xl p-3.5 shadow-2xl flex items-center gap-3 cursor-pointer animate-in slide-in-from-top-4 transition hover:scale-[1.02]"
        >
          <img
            src={notification.senderAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
            alt=""
            className="w-11 h-11 rounded-full object-cover border border-[#00a884]"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white truncate">
                {notification.senderName}
              </span>
              <span className="text-[10px] text-[#00a884] font-semibold">নতুন মেসেজ</span>
            </div>
            <p className="text-xs text-[#8696a0] truncate mt-0.5">
              {notification.text}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setNotification(null);
            }}
            className="p-1 rounded-full text-[#8696a0] hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 
        LEFT SIDEBAR: CHAT LIST
      */}
      <div
        className={`${
          activeConvId ? 'hidden md:flex' : 'flex'
        } w-full md:w-[380px] lg:w-[430px] flex-col border-r border-[#183439] bg-[#0c1517] z-20 shrink-0 h-full relative`}
      >
        {/* Top User Profile Header */}
        <div className="h-16 px-4 bg-[#112225] border-b border-[#183439] flex items-center justify-between shrink-0">
          <div
            onClick={() => setIsProfileOpen(true)}
            className="flex items-center gap-3 cursor-pointer group"
            title="প্রোফাইল দেখুন ও এডিট করুন"
          >
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-[#00a884] group-hover:brightness-110 transition shadow-sm"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#00a884] border-2 border-[#112225] rounded-full" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white truncate group-hover:text-[#00a884] transition">
                {currentUser.name}
              </div>
              <div className="text-[11px] text-[#00a884] font-mono">
                {currentUser.phone}
              </div>
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-1 text-[#8696a0]">
            {/* Status (Stories) */}
            <button
              onClick={() => setIsStatusOpen(true)}
              className="p-2 rounded-xl hover:bg-[#162d31] hover:text-[#00a884] transition relative"
              title="স্ট্যাটাস"
            >
              <Radio className="w-5 h-5" />
            </button>

            {/* Add Contact (Only by Phone Number from Firebase) */}
            <button
              onClick={() => setIsAddContactOpen(true)}
              className="p-2 rounded-xl hover:bg-[#162d31] text-[#00a884] hover:text-[#02906f] transition"
              title="নম্বর দিয়ে নতুন কন্টাক্ট যোগ করুন"
            >
              <UserPlus className="w-5 h-5" />
            </button>

            {/* Create Group */}
            <button
              onClick={() => setIsCreateGroupOpen(true)}
              className="p-2 rounded-xl hover:bg-[#162d31] hover:text-[#00a884] transition"
              title="নতুন গ্রুপ"
            >
              <Users className="w-5 h-5" />
            </button>

            {/* Logout */}
            <button
              onClick={onLogout}
              className="p-2 rounded-xl hover:bg-[#39181a] hover:text-[#f87171] transition"
              title="লগআউট"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-3 bg-[#0c1517] border-b border-[#183439] space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-[#8696a0] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="চ্যাট বা কন্টাক্ট খুঁজুন..."
              className="w-full bg-[#112225] border border-[#19363c] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-[#8696a0] focus:outline-none focus:border-[#00a884] transition"
            />
          </div>

          {/* Filters: সকল, অপঠিত, গ্রুপ, কন্টাক্টস */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-[#00a884] text-white shadow-sm'
                  : 'bg-[#112225] border border-[#19363c] text-[#8696a0] hover:text-white hover:bg-[#152a2e]'
              }`}
            >
              সকল
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('unread')}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeFilter === 'unread'
                  ? 'bg-[#00a884] text-white shadow-sm'
                  : 'bg-[#112225] border border-[#19363c] text-[#8696a0] hover:text-white hover:bg-[#152a2e]'
              }`}
            >
              অপঠিত
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('groups')}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeFilter === 'groups'
                  ? 'bg-[#00a884] text-white shadow-sm'
                  : 'bg-[#112225] border border-[#19363c] text-[#8696a0] hover:text-white hover:bg-[#152a2e]'
              }`}
            >
              গ্রুপ
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('contacts')}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeFilter === 'contacts'
                  ? 'bg-[#00a884] text-white shadow-sm'
                  : 'bg-[#112225] border border-[#19363c] text-[#8696a0] hover:text-white hover:bg-[#152a2e]'
              }`}
            >
              কন্টাক্টস
            </button>
          </div>
        </div>

        {/* Action Bar */}
        <div className="px-3 py-2 bg-[#102226] border-b border-[#183439] flex items-center justify-between">
          <span className="text-xs text-[#00a884] font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00a884]" />
            চ্যাট লিস্ট ({filteredConversations.length})
          </span>
          <button
            onClick={() => setIsAddContactOpen(true)}
            className="text-[11px] font-semibold text-[#00a884] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ কন্টাক্ট যোগ</span>
          </button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#15282c]">
          {filteredConversations.map((conv) => {
            const isActive = conv.id === activeConvId;

            return (
              <div
                key={conv.id}
                onClick={() => setActiveConvId(conv.id)}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition ${
                  isActive
                    ? 'bg-[#152a2e] border-l-4 border-[#00a884]'
                    : 'hover:bg-[#102023]'
                }`}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <img
                    src={conv.avatar}
                    alt={conv.name}
                    className="w-12 h-12 rounded-full object-cover border border-[#1d3d44]"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-white truncate">
                      {conv.name}
                    </span>
                    {conv.lastMessage && (
                      <span className="text-[10px] text-[#8696a0] shrink-0 font-mono">
                        {new Date(conv.lastMessage.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[#8696a0] truncate pr-2 flex items-center gap-1">
                      {conv.lastMessage?.senderId === currentUser.id && (
                        <span className="inline-flex text-[#53bdeb]">
                          <CheckCheck className="w-3 h-3" />
                        </span>
                      )}
                      <span className="truncate">
                        {conv.lastMessage?.text ||
                          (conv.lastMessage?.type === 'image'
                            ? '📷 ছবি'
                            : conv.lastMessage?.type === 'audio'
                            ? '🎤 ভয়েস নোট'
                            : conv.lastMessage?.type === 'file'
                            ? '📄 ফাইল'
                            : 'নতুন চ্যাট শুরু করুন')}
                      </span>
                    </p>

                    {conv.unreadCount > 0 && (
                      <span className="shrink-0 bg-[#00a884] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredConversations.length === 0 && (
            <div className="p-8 text-center text-xs text-[#8696a0] flex flex-col items-center gap-3">
              <ShieldCheck className="w-10 h-10 text-[#00a884]/60" />
              <p>আপনার চ্যাটলিস্টে এখনো কোনো কন্টাক্ট নেই।</p>
              <p className="text-[11px] text-[#6e828d]">
                আমাদের Firebase এ অ্যাকাউন্ট আছে এমন যেকোনো মোবাইল নম্বর দিয়ে সরাসরি কন্টাক্ট যোগ করে চ্যাট শুরু করতে পারেন।
              </p>
              <button
                type="button"
                onClick={() => setIsAddContactOpen(true)}
                className="px-4 py-2 bg-[#00a884] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md cursor-pointer hover:bg-[#02906f] transition"
              >
                <UserPlus className="w-4 h-4" />
                <span>নম্বর দিয়ে কন্টাক্ট যোগ করুন</span>
              </button>
            </div>
          )}
        </div>

        {/* Floating Action Button (FAB) to add contact */}
        <button
          onClick={() => setIsAddContactOpen(true)}
          className="absolute bottom-5 right-5 w-13 h-13 rounded-full bg-[#00a884] hover:bg-[#02906f] text-white flex items-center justify-center shadow-2xl shadow-[#00a884]/40 transition active:scale-95 cursor-pointer z-30"
          title="নতুন কন্টাক্ট যোগ করুন"
        >
          <UserPlus className="w-6 h-6" />
        </button>
      </div>

      {/* 
        RIGHT MAIN CHAT WINDOW
      */}
      <div
        className={`${
          !activeConvId ? 'hidden md:flex' : 'flex'
        } flex-1 flex-col h-full bg-[#0b141a] relative`}
      >
        {activeConversation ? (
          <>
            {/* Top Chat Header */}
            <div className="h-16 px-4 bg-[#112225] border-b border-[#183439] flex items-center justify-between shrink-0 z-10">
              <div className="flex items-center gap-3">
                {/* Back button for mobile */}
                <button
                  type="button"
                  onClick={() => setActiveConvId(null)}
                  className="p-1.5 -ml-1 rounded-lg text-[#00a884] hover:text-white hover:bg-[#162d31] transition flex items-center gap-1 font-semibold text-xs cursor-pointer"
                  title="চ্যাটলিস্টে ফিরে যান"
                >
                  <ChevronLeft className="w-6 h-6" />
                  <span className="md:hidden">চ্যাটলিস্ট</span>
                </button>

                <div className="relative">
                  <img
                    src={activeConversation.avatar}
                    alt={activeConversation.name}
                    className="w-10 h-10 rounded-full object-cover border border-[#1d3d44]"
                  />
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-white leading-tight">
                    {activeConversation.name}
                  </h2>
                  <p className="text-xs text-[#00a884]">
                    {activeConversation.isGroup
                      ? `${activeConversation.participants.length} জন সদস্য`
                      : 'ফায়ারবেস সুরক্ষিত চ্যাট'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 text-[#8696a0]">
                {/* Stop speech reader if playing */}
                <button
                  type="button"
                  onClick={() => MessageSpeaker.stop()}
                  className="p-2 rounded-xl hover:bg-[#162d31] hover:text-[#00a884] transition"
                  title="পড়া বন্ধ করুন"
                >
                  <Volume2 className="w-4 h-4" />
                </button>

                {/* Search in chat */}
                <button
                  type="button"
                  onClick={() => {
                    const q = prompt('চ্যাটে বার্তা খুঁজুন:');
                    if (q) {
                      const match = messages.find((m) =>
                        m.text?.toLowerCase().includes(q.toLowerCase())
                      );
                      if (match) alert(`পাওয়া গেছে: "${match.text}"`);
                      else alert('কোনো বার্তা পাওয়া যায়নি');
                    }
                  }}
                  className="p-2 rounded-xl hover:bg-[#162d31] hover:text-white transition"
                  title="খুঁজুন"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Scroll View */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 whatsapp-chat-bg">
              <div className="flex justify-center my-2">
                <span className="bg-[#182229] border border-[#222d34] text-[#8696a0] text-[11px] font-medium px-3 py-1 rounded-lg shadow-sm">
                  🔒 ফায়ারবেস এন্ড-টু-এন্ড রিয়েল-টাইম বার্তা
                </span>
              </div>

              {messages.map((msg) => (
                <MessageItem
                  key={msg.id}
                  message={msg}
                  isCurrentUser={msg.senderId === currentUser.id}
                  isGroup={activeConversation.isGroup}
                  onImageClick={(url) => setLightboxImage(url)}
                  lang={lang}
                />
              ))}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Emoji Bar */}
            {showEmojiPicker && (
              <div className="px-4 py-2 bg-[#112225] border-t border-[#183439] flex items-center gap-2 overflow-x-auto">
                {COMMON_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setInputText((prev) => prev + emoji)}
                    className="text-xl p-1.5 hover:bg-[#162d31] rounded-xl transition cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            {/* Attachment Dropdown Menu */}
            {showAttachMenu && (
              <div className="absolute bottom-20 left-4 bg-[#112225] border border-[#183439] rounded-2xl p-2 shadow-2xl flex flex-col gap-1 z-30 animate-in fade-in slide-in-from-bottom-2">
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#162d31] text-xs font-semibold text-white transition text-left cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#00a884]/20 text-[#00a884] flex items-center justify-center">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <span>ছবি বা ভিডিও (Photos)</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#162d31] text-xs font-semibold text-white transition text-left cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#53bdeb]/20 text-[#53bdeb] flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span>ডকুমেন্ট বা ফাইল (Document)</span>
                </button>
              </div>
            )}

            {/* Chat Input Bar */}
            <div className="p-3 bg-[#112225] border-t border-[#183439] flex items-center gap-2 shrink-0">
              {isRecording ? (
                <div className="flex-1 flex items-center justify-between bg-[#0a1619] border border-[#19363c] rounded-2xl px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                    <span className="text-xs font-medium text-red-400">
                      ভয়েস রেকর্ড হচ্ছে... {recordSeconds}s
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={cancelRecording}
                      className="px-3 py-1 rounded-xl bg-[#39181a] border border-[#5d2327] text-xs text-[#f87171] hover:bg-[#4d1f23] transition cursor-pointer"
                    >
                      বাতিল
                    </button>
                    <button
                      type="button"
                      onClick={stopAndSendRecording}
                      className="px-3 py-1 rounded-xl bg-[#00a884] text-xs text-white hover:bg-[#02906f] font-semibold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      পাঠান
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2 text-[#8696a0] hover:text-[#00a884] hover:bg-[#162d31] rounded-xl transition cursor-pointer"
                    title="ইমোজি"
                  >
                    <Smile className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowAttachMenu(!showAttachMenu)}
                    className="p-2 text-[#8696a0] hover:text-[#00a884] hover:bg-[#162d31] rounded-xl transition cursor-pointer"
                    title="ফাইল বা ছবি যুক্ত করুন"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>

                  <form
                    onSubmit={handleSendMessage}
                    className="flex-1 flex items-center"
                  >
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="একটি মেসেজ লিখুন..."
                      className="w-full bg-[#0a1619] border border-[#19363c] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-[#8696a0] focus:outline-none focus:border-[#00a884] transition"
                    />
                  </form>

                  {inputText.trim() ? (
                    <button
                      type="button"
                      onClick={handleSendMessage}
                      className="w-10 h-10 rounded-xl bg-[#00a884] hover:bg-[#02906f] text-white flex items-center justify-center transition shadow-md shadow-[#00a884]/20 cursor-pointer shrink-0"
                      title="মেসেজ পাঠান"
                    >
                      <Send className="w-4 h-4 ml-0.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={startRecording}
                      className="w-10 h-10 rounded-xl bg-[#0a1619] hover:bg-[#162d31] border border-[#19363c] text-[#00a884] flex items-center justify-center transition cursor-pointer shrink-0"
                      title="ভয়েস মেসেজ রেকর্ড করতে চাপুন"
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                  )}
                </>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#0b141a]">
            <div className="w-20 h-20 rounded-3xl bg-[#112225] border border-[#19363c] flex items-center justify-center mb-4 text-[#00a884] shadow-xl">
              <Sparkles className="w-10 h-10 text-[#00a884]" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">হোয়াটসঅ্যাপ ওয়েব</h2>
            <p className="text-sm text-[#8696a0] max-w-sm leading-relaxed mb-4">
              যেকোনো কন্টাক্টের নম্বরে ক্লিক করে রিয়েল-টাইম বার্তা, ছবি ও ফাইল শেয়ার করুন।
            </p>
            <button
              onClick={() => setIsAddContactOpen(true)}
              className="px-5 py-2.5 bg-[#00a884] hover:bg-[#02906f] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-[#00a884]/25 transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>নম্বর দিয়ে কন্টাক্ট যোগ করুন</span>
            </button>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={lightboxImage}
            alt="Fullscreen preview"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}

      {/* Status Modal */}
      <StatusModal
        isOpen={isStatusOpen}
        onClose={() => setIsStatusOpen(false)}
        currentUser={currentUser}
        lang={lang}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currentUser={currentUser}
        onUpdateUser={(updated) => {
          // Update profile in state if needed
        }}
        onLogout={onLogout}
        lang={lang}
      />

      {/* Add Contact Modal */}
      <AddContactModal
        isOpen={isAddContactOpen}
        onClose={() => setIsAddContactOpen(false)}
        currentUser={currentUser}
        onContactAdded={(conv) => {
          setActiveConvId(conv.id);
        }}
        lang={lang}
      />

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        currentUser={currentUser}
        onGroupCreated={(conv) => {
          setActiveConvId(conv.id);
        }}
        lang={lang}
      />
    </div>
  );
};
