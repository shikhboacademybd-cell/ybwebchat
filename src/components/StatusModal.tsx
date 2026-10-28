import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, ChevronLeft, ChevronRight, Eye, Camera, Type, Image as ImageIcon, Check } from 'lucide-react';
import { StatusItem, User } from '../types';
import { ChatService } from '../services/chatService';

interface StatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  lang?: 'bn' | 'en';
}

const BG_COLORS = [
  '#005c4b',
  '#00a884',
  '#79225b',
  '#1b3b6f',
  '#7b2cbf',
  '#b91c1c',
  '#b45309'
];

export const StatusModal: React.FC<StatusModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  lang = 'bn'
}) => {
  const [statuses, setStatuses] = useState<StatusItem[]>([]);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [storyProgress, setStoryProgress] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [createMode, setCreateMode] = useState<'text' | 'image'>('text');
  const [textContent, setTextContent] = useState('');
  const [selectedBgColor, setSelectedBgColor] = useState(BG_COLORS[0]);
  const [imageContent, setImageContent] = useState<string | null>(null);
  const [imageCaption, setImageCaption] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const unsub = ChatService.subscribeToStatuses((items) => {
        setStatuses(items);
      });
      return () => unsub();
    }
  }, [isOpen]);

  // Story player timer
  useEffect(() => {
    if (activeStoryIndex === null) return;
    setStoryProgress(0);

    const interval = setInterval(() => {
      setStoryProgress((prev) => {
        if (prev >= 100) {
          // Advance to next
          if (activeStoryIndex < statuses.length - 1) {
            setActiveStoryIndex(activeStoryIndex + 1);
            return 0;
          } else {
            setActiveStoryIndex(null);
            return 0;
          }
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [activeStoryIndex, statuses.length]);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setImageContent(reader.result);
          setCreateMode('image');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateStatus = async () => {
    if (createMode === 'text') {
      if (!textContent.trim()) return;
      const newStatus: StatusItem = {
        id: 'st_' + Date.now(),
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        type: 'text',
        content: textContent.trim(),
        bgColor: selectedBgColor,
        timestamp: Date.now(),
        viewers: []
      };
      await ChatService.addStatus(newStatus);
    } else {
      if (!imageContent) return;
      const newStatus: StatusItem = {
        id: 'st_' + Date.now(),
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        type: 'image',
        content: imageContent,
        caption: imageCaption.trim(),
        timestamp: Date.now(),
        viewers: []
      };
      await ChatService.addStatus(newStatus);
    }

    setIsCreating(false);
    setTextContent('');
    setImageContent(null);
    setImageCaption('');
  };

  const myStatuses = statuses.filter((s) => s.userId === currentUser.id);
  const otherStatuses = statuses.filter((s) => s.userId !== currentUser.id);

  const formatTimestamp = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / (1000 * 60));
    if (mins < 60) return `${mins} মিনিট আগে`;
    const hours = Math.floor(mins / 60);
    return `${hours} ঘণ্টা আগে`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      {/* Fullscreen Story Viewer */}
      {activeStoryIndex !== null && statuses[activeStoryIndex] && (
        <div className="relative w-full h-full max-w-lg max-h-[90vh] bg-black sm:rounded-2xl overflow-hidden flex flex-col justify-between shadow-2xl z-50">
          {/* Progress Bars */}
          <div className="absolute top-2 left-2 right-2 flex gap-1 z-20">
            {statuses.map((_, idx) => (
              <div key={idx} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-100 ease-linear"
                  style={{
                    width:
                      idx < activeStoryIndex
                        ? '100%'
                        : idx === activeStoryIndex
                        ? `${storyProgress}%`
                        : '0%'
                  }}
                />
              </div>
            ))}
          </div>

          {/* Top User Header */}
          <div className="pt-6 px-4 flex items-center justify-between z-20 bg-gradient-to-b from-black/70 to-transparent">
            <div className="flex items-center gap-2.5">
              <img
                src={statuses[activeStoryIndex].userAvatar}
                alt=""
                className="w-10 h-10 rounded-full border border-white/50 object-cover"
              />
              <div>
                <div className="text-sm font-semibold text-white">
                  {statuses[activeStoryIndex].userName}
                </div>
                <div className="text-xs text-white/70">
                  {formatTimestamp(statuses[activeStoryIndex].timestamp)}
                </div>
              </div>
            </div>
            <button
              onClick={() => setActiveStoryIndex(null)}
              className="p-2 rounded-full hover:bg-white/20 text-white transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Story Content */}
          <div className="flex-1 flex items-center justify-center p-6 text-center select-none relative">
            {/* Click navigation overlays */}
            <div
              className="absolute left-0 top-0 w-1/3 h-full cursor-pointer z-10"
              onClick={() => {
                if (activeStoryIndex > 0) setActiveStoryIndex(activeStoryIndex - 1);
              }}
            />
            <div
              className="absolute right-0 top-0 w-1/3 h-full cursor-pointer z-10"
              onClick={() => {
                if (activeStoryIndex < statuses.length - 1) {
                  setActiveStoryIndex(activeStoryIndex + 1);
                } else {
                  setActiveStoryIndex(null);
                }
              }}
            />

            {statuses[activeStoryIndex].type === 'text' ? (
              <div
                className="w-full h-full rounded-2xl flex items-center justify-center p-8 text-xl sm:text-2xl font-bold text-white shadow-inner"
                style={{ backgroundColor: statuses[activeStoryIndex].bgColor || '#005c4b' }}
              >
                <p className="leading-relaxed drop-shadow-md">
                  {statuses[activeStoryIndex].content}
                </p>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center relative">
                <img
                  src={statuses[activeStoryIndex].content}
                  alt=""
                  className="max-h-full max-w-full object-contain rounded-xl"
                />
                {statuses[activeStoryIndex].caption && (
                  <div className="absolute bottom-4 inset-x-4 bg-black/60 backdrop-blur-md p-3 rounded-xl text-white text-sm">
                    {statuses[activeStoryIndex].caption}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer View Count */}
          <div className="p-4 flex items-center justify-center gap-1.5 text-xs text-white/80 bg-gradient-to-t from-black/70 to-transparent">
            <Eye className="w-4 h-4" />
            <span>
              {statuses[activeStoryIndex].viewers.length + 1} জন দেখেছেন
            </span>
          </div>
        </div>
      )}

      {/* Main Status Panel */}
      {activeStoryIndex === null && (
        <div className="w-full max-w-md bg-[#112225] border border-[#183439] rounded-2xl p-5 sm:p-6 shadow-2xl max-h-[85vh] flex flex-col text-[#e9edef]">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#183439]">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#00a884]" />
              {lang === 'bn' ? 'স্ট্যাটাস (Status)' : 'Status'}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#8696a0] hover:text-white hover:bg-[#162d31] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Create Status View */}
          {isCreating ? (
            <div className="flex-1 py-4 flex flex-col gap-4 overflow-y-auto">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">
                  {lang === 'bn' ? 'নতুন স্ট্যাটাস যুক্ত করুন' : 'Add New Status'}
                </span>
                <div className="flex items-center gap-1 bg-[#091518] p-1 rounded-lg border border-[#1a383e]">
                  <button
                    type="button"
                    onClick={() => setCreateMode('text')}
                    className={`px-3 py-1 text-xs rounded-md font-medium transition ${
                      createMode === 'text' ? 'bg-[#00a884] text-white' : 'text-[#8696a0]'
                    }`}
                  >
                    <Type className="w-3.5 h-3.5 inline mr-1" />
                    টেক্সট
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCreateMode('image');
                      fileInputRef.current?.click();
                    }}
                    className={`px-3 py-1 text-xs rounded-md font-medium transition ${
                      createMode === 'image' ? 'bg-[#00a884] text-white' : 'text-[#8696a0]'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5 inline mr-1" />
                    ছবি
                  </button>
                </div>
              </div>

              {createMode === 'text' ? (
                <div className="space-y-3">
                  <div
                    className="w-full h-44 rounded-xl p-4 flex items-center justify-center transition"
                    style={{ backgroundColor: selectedBgColor }}
                  >
                    <textarea
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                      placeholder="একটি স্ট্যাটাস লিখুন..."
                      rows={3}
                      className="w-full bg-transparent text-white text-center font-bold text-base focus:outline-none placeholder:text-white/60 resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-[#8696a0] block mb-1.5">ব্যাকগ্রাউন্ড কালার নির্বাচন করুন:</label>
                    <div className="flex items-center gap-2">
                      {BG_COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setSelectedBgColor(c)}
                          className={`w-7 h-7 rounded-full border-2 transition ${
                            selectedBgColor === c ? 'border-white scale-110' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  {imageContent ? (
                    <div className="space-y-2">
                      <div className="max-h-48 rounded-xl overflow-hidden bg-black/40 flex items-center justify-center">
                        <img src={imageContent} alt="" className="max-h-48 object-contain" />
                      </div>
                      <input
                        type="text"
                        value={imageCaption}
                        onChange={(e) => setImageCaption(e.target.value)}
                        placeholder="ক্যাপশন যোগ করুন..."
                        className="w-full bg-[#0a1619] border border-[#19363c] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00a884]"
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-40 border-2 border-dashed border-[#1f4249] rounded-xl flex flex-col items-center justify-center gap-2 text-[#8696a0] hover:text-[#00a884] hover:border-[#00a884] transition"
                    >
                      <Camera className="w-8 h-8" />
                      <span className="text-xs font-medium">ছবি নির্বাচন করতে ক্লিক করুন</span>
                    </button>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="flex-1 py-2 rounded-xl bg-[#0d1f23] border border-[#1f4249] text-xs font-semibold text-[#8696a0] hover:text-white transition"
                >
                  বাতিল করুন
                </button>
                <button
                  type="button"
                  onClick={handleCreateStatus}
                  className="flex-1 py-2 rounded-xl bg-[#00a884] hover:bg-[#02906f] text-xs font-semibold text-white transition flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  পোস্ট করুন
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 py-3 overflow-y-auto space-y-4">
              {/* My Status row */}
              <div>
                <span className="text-xs font-semibold text-[#8696a0] uppercase tracking-wider block mb-2">
                  আমার স্ট্যাটাস
                </span>
                <div className="flex items-center justify-between p-2 rounded-xl hover:bg-[#152a2e] transition group">
                  <div
                    onClick={() => {
                      if (myStatuses.length > 0) {
                        const idx = statuses.findIndex((s) => s.id === myStatuses[0].id);
                        if (idx >= 0) setActiveStoryIndex(idx);
                      } else {
                        setIsCreating(true);
                      }
                    }}
                    className="flex items-center gap-3 cursor-pointer flex-1"
                  >
                    <div className="relative">
                      <img
                        src={currentUser.avatar}
                        alt=""
                        className={`w-12 h-12 rounded-full object-cover border-2 ${
                          myStatuses.length > 0 ? 'border-[#00a884]' : 'border-dashed border-[#8696a0]'
                        }`}
                      />
                      {myStatuses.length === 0 && (
                        <div className="absolute -bottom-1 -right-1 bg-[#00a884] text-white rounded-full p-0.5">
                          <Plus className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">আমার স্ট্যাটাস</div>
                      <div className="text-xs text-[#8696a0]">
                        {myStatuses.length > 0
                          ? `${myStatuses.length}টি আপডেট • ${formatTimestamp(myStatuses[0].timestamp)}`
                          : 'স্ট্যাটাস আপডেট যোগ করতে ক্লিক করুন'}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsCreating(true)}
                    className="p-2 rounded-xl bg-[#00a884]/20 hover:bg-[#00a884]/30 text-[#00a884] transition"
                    title="নতুন স্ট্যাটাস লিখুন"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Recent Updates from contacts */}
              <div>
                <span className="text-xs font-semibold text-[#8696a0] uppercase tracking-wider block mb-2">
                  সাম্প্রতিক আপডেট ({otherStatuses.length})
                </span>
                <div className="space-y-1.5">
                  {otherStatuses.map((st) => {
                    const idx = statuses.findIndex((s) => s.id === st.id);
                    return (
                      <div
                        key={st.id}
                        onClick={() => setActiveStoryIndex(idx)}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#152a2e] cursor-pointer transition"
                      >
                        <div className="w-12 h-12 rounded-full p-0.5 border-2 border-[#00a884]">
                          <img
                            src={st.userAvatar}
                            alt=""
                            className="w-full h-full rounded-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-white truncate">
                            {st.userName}
                          </div>
                          <div className="text-xs text-[#8696a0]">
                            {formatTimestamp(st.timestamp)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {otherStatuses.length === 0 && (
                    <p className="text-xs text-[#8696a0] text-center py-4">
                      কোনো সাম্প্রতিক স্ট্যাটাস আপডেট নেই
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
