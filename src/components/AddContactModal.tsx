import React, { useState } from 'react';
import { X, UserPlus, Phone, Check, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { User as UserType, Conversation } from '../types';
import { ChatService } from '../services/chatService';

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserType;
  onContactAdded: (conversation: Conversation) => void;
  lang?: 'bn' | 'en';
}

export const AddContactModal: React.FC<AddContactModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onContactAdded,
  lang = 'bn'
}) => {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const normalizePhoneNumber = (input: string) => {
    const bn = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
    const converted = input.replace(/[০-৯]/g, (d) => bn.indexOf(d).toString());
    return converted.replace(/[-–—\s]/g, '').trim();
  };

  const handleSearchAndAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanPhone = normalizePhoneNumber(phone);
    if (!cleanPhone) {
      setError(lang === 'bn' ? 'অনুগ্রহ করে একটি মোবাইল নম্বর দিন।' : 'Please enter a phone number.');
      return;
    }

    if (cleanPhone === normalizePhoneNumber(currentUser.phone)) {
      setError(lang === 'bn' ? 'আপনি নিজের ফোন নম্বর কন্টাক্ট হিসেবে যোগ করতে পারবেন না।' : 'You cannot add your own phone number.');
      return;
    }

    setIsLoading(true);

    try {
      // Look up target user in Firebase Firestore
      const targetUser = await ChatService.findUserByPhone(cleanPhone);

      if (!targetUser) {
        setError(
          lang === 'bn'
            ? '❌ এই নম্বরে কোনো ফায়ারবেস অ্যাকাউন্ট পাওয়া যায়নি! শুধুমাত্র আমাদের প্ল্যাটফর্মে অ্যাকাউন্ট আছে এমন নম্বরের সাথেই যোগাযোগ করা যাবে।'
            : 'No Firebase account found with this phone number. You can only chat with registered accounts.'
        );
        setIsLoading(false);
        return;
      }

      // User exists in Firebase! Create or fetch conversation thread in Firestore
      const conversation = await ChatService.getOrCreateDirectConversation(currentUser, targetUser);

      onContactAdded(conversation);
      setPhone('');
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'কন্টাক্ট খুঁজতে সমস্যা হয়েছে।');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[#112225] border border-[#183439] rounded-2xl p-6 shadow-2xl text-[#e9edef] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#183439]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#00a884] flex items-center justify-center text-white shadow-md">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {lang === 'bn' ? 'নম্বর দিয়ে কন্টাক্ট যোগ করুন' : 'Add Contact by Phone'}
              </h2>
              <p className="text-[11px] text-[#8696a0]">
                {lang === 'bn' ? 'ফায়ারবেস ভেরিফাইড ইউজার খুঁজুন' : 'Search Firebase verified user'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setError(null);
              setPhone('');
              onClose();
            }}
            className="p-1.5 rounded-lg text-[#8696a0] hover:text-white hover:bg-[#162d31] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-4">
          <div className="p-3 bg-[#0a1619] border border-[#1a383f] rounded-xl text-xs text-[#8696a0] flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#00a884] shrink-0 mt-0.5" />
            <span>
              {lang === 'bn'
                ? 'নাম লেখার প্রয়োজন নেই। শুধুমাত্র সেই ব্যক্তির মোবাইল নম্বর দিলেই তিনি আমাদের ফায়ারবেস ডেটাবেসে থাকলে স্বয়ংক্রিয়ভাবে কন্টাক্ট লিস্টে যুক্ত হয়ে চ্যাট ওপেন হবে।'
                : 'No name required. Just enter their mobile number; if registered in Firebase, they will be added automatically.'}
            </span>
          </div>

          <form onSubmit={handleSearchAndAddContact} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#d1d7db] mb-1.5">
                {lang === 'bn' ? 'কন্টাক্টের মোবাইল নম্বর *' : 'Contact Mobile Number *'}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#00a884] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="০১০০০-০০০০০০"
                  className="w-full bg-[#0a1619] border border-[#19363c] rounded-xl pl-10 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#00a884] transition font-mono placeholder:text-[#556973]"
                  required
                  autoFocus
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-[#39181a] border border-[#5d2327] text-xs text-[#fca5a5] flex items-start gap-2 leading-relaxed">
                <AlertCircle className="w-4 h-4 text-[#f87171] shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !phone.trim()}
              className="w-full py-2.5 bg-[#00a884] hover:bg-[#02906f] disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-[#00a884]/25 transition cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>যাচাই করা হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{lang === 'bn' ? 'নম্বর যাচাই ও চ্যাট শুরু করুন' : 'Verify & Start Chat'}</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
