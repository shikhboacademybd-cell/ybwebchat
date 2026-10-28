import React, { useState, useRef } from 'react';
import { X, Camera, Check, LogOut, User as UserIcon, Phone, FileText, CheckCircle2 } from 'lucide-react';
import { User } from '../types';
import { StorageService, PRESET_AVATARS } from '../utils/storage';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUpdateUser: (updatedUser: User) => void;
  onLogout: () => void;
  lang?: 'bn' | 'en';
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  onLogout,
  lang = 'bn'
}) => {
  const [name, setName] = useState(currentUser.name);
  const [bio, setBio] = useState(currentUser.bio || 'হোয়াটসঅ্যাপে আছি। ব্যস্ত থাকলে মেসেজ দিন।');
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated: User = {
      ...currentUser,
      name: name.trim() || currentUser.name,
      bio: bio.trim(),
      avatar: avatar
    };
    try {
      const { ChatService } = await import('../services/chatService');
      await ChatService.updateUser(updated);
      localStorage.setItem('wa_firebase_user', JSON.stringify(updated));
      onUpdateUser(updated);
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
        onClose();
      }, 800);
    } catch {
      // Ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="w-full max-w-md bg-[#112225] border border-[#183439] rounded-2xl p-6 shadow-2xl text-[#e9edef]">
        <div className="flex items-center justify-between pb-4 border-b border-[#183439] mb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-[#00a884]" />
            {lang === 'bn' ? 'প্রোফাইল কাস্টমাইজেশন' : 'Profile Settings'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#8696a0] hover:text-white hover:bg-[#162d31] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Avatar Upload / Selection */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <img
                src={avatar}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-[#00a884] shadow-lg"
              />
              <div className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <Camera className="w-6 h-6 text-white" />
                <span className="text-[10px] text-white mt-1">পরিবর্তন</span>
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />

            <div className="flex items-center gap-2">
              {PRESET_AVATARS.map((av, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAvatar(av)}
                  className={`w-8 h-8 rounded-full overflow-hidden border-2 transition ${
                    avatar === av ? 'border-[#00a884] scale-110' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={av} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#d1d7db] mb-1.5">
              {lang === 'bn' ? 'আপনার নাম' : 'Your Name'}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0a1619] border border-[#19363c] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00a884]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#d1d7db] mb-1.5">
              {lang === 'bn' ? 'স্ট্যাটাস / বায়ো' : 'About / Bio'}
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-[#00a884] absolute left-3 top-3" />
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                className="w-full bg-[#0a1619] border border-[#19363c] rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-[#00a884] resize-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#d1d7db] mb-1.5">
              {lang === 'bn' ? 'ফোন নম্বর' : 'Phone Number'}
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#8696a0] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={currentUser.phone}
                disabled
                className="w-full bg-[#071012] border border-[#14282c] rounded-xl pl-9 pr-3 py-2 text-sm text-[#8696a0] cursor-not-allowed"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#00a884] hover:bg-[#02906f] text-xs font-semibold text-white transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isSaved ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  সংরক্ষিত হয়েছে!
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  পরিবর্তন সংরক্ষণ করুন
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="w-full py-2.5 rounded-xl bg-[#39181a]/40 hover:bg-[#39181a] border border-[#5d2327] text-xs font-semibold text-[#f87171] transition flex items-center justify-center gap-1.5 cursor-pointer mt-1"
            >
              <LogOut className="w-4 h-4" />
              লগআউট করুন (অন্য অ্যাকাউন্টে প্রবেশ করতে)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
