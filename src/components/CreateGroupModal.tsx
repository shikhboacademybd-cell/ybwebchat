import React, { useState, useEffect } from 'react';
import { X, Users, Check, Loader2 } from 'lucide-react';
import { User, Conversation } from '../types';
import { ChatService } from '../services/chatService';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onGroupCreated: (conversation: Conversation) => void;
  lang?: 'bn' | 'en';
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onGroupCreated,
  lang = 'bn'
}) => {
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=150&auto=format&fit=crop&q=80'
  );
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Fetch users from Firebase
      const fetchUsers = async () => {
        try {
          const snapshot = await getDocs(collection(db, 'users'));
          const users: User[] = [];
          snapshot.forEach((d) => {
            const u = d.data() as User;
            if (u.id !== currentUser.id) {
              users.push(u);
            }
          });
          setAvailableUsers(users);
        } catch {
          // Ignore
        }
      };
      fetchUsers();
    }
  }, [isOpen, currentUser.id]);

  if (!isOpen) return null;

  const toggleUserSelection = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      setSelectedUserIds(selectedUserIds.filter((id) => id !== userId));
    } else {
      setSelectedUserIds([...selectedUserIds, userId]);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) {
      setError(lang === 'bn' ? 'গ্রুপের একটি নাম দিন।' : 'Please enter a group name.');
      return;
    }
    if (selectedUserIds.length === 0) {
      setError(lang === 'bn' ? 'কমপক্ষে একজন সদস্য নির্বাচন করুন।' : 'Select at least one member.');
      return;
    }

    setIsLoading(true);
    try {
      const newGroup = await ChatService.createGroupConversation(
        currentUser,
        groupName.trim(),
        selectedAvatar,
        selectedUserIds,
        description.trim()
      );
      onGroupCreated(newGroup);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'গ্রুপ তৈরিতে সমস্যা হয়েছে।');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="w-full max-w-md bg-[#112225] border border-[#183439] rounded-2xl p-6 shadow-2xl text-[#e9edef] max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-[#183439]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#00a884]/20 flex items-center justify-center text-[#00a884]">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-white">
              {lang === 'bn' ? 'নতুন গ্রুপ তৈরি করুন' : 'Create New Group'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#8696a0] hover:text-white hover:bg-[#162d31] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleCreateGroup} className="flex-1 overflow-y-auto py-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#d1d7db] mb-1.5">
              {lang === 'bn' ? 'গ্রুপের নাম *' : 'Group Name *'}
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="যেমন: বন্ধুমহল, অফিস টিম"
              className="w-full bg-[#0a1619] border border-[#19363c] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#00a884]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#d1d7db] mb-1.5">
              {lang === 'bn' ? 'গ্রুপের বিবরণ (ঐচ্ছিক)' : 'Group Description (Optional)'}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="গ্রুপের উদ্দেশ্য ও নিয়মাবলী..."
              rows={2}
              className="w-full bg-[#0a1619] border border-[#19363c] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00a884] resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#d1d7db] mb-1.5">
              {lang === 'bn' ? 'গ্রুপ আইকন নির্বাচন' : 'Group Icon'}
            </label>
            <div className="flex items-center gap-2">
              {[
                'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=150&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=150&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=150&auto=format&fit=crop&q=80'
              ].map((iconUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedAvatar(iconUrl)}
                  className={`w-10 h-10 rounded-full overflow-hidden border-2 transition ${
                    selectedAvatar === iconUrl ? 'border-[#00a884] scale-105' : 'border-transparent opacity-60'
                  }`}
                >
                  <img src={iconUrl} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#d1d7db] mb-1.5">
              {lang === 'bn'
                ? `ফায়ারবেস রেজিস্টার্ড সদস্য নির্বাচন (${availableUsers.length}) *`
                : `Select Registered Members (${availableUsers.length}) *`}
            </label>

            {availableUsers.length === 0 ? (
              <p className="text-xs text-[#8696a0] py-2">
                এখনো অন্য কোনো ব্যবহারকারী অ্যাকাউন্ট তৈরি করেননি। অন্য ব্যবহারকারী একাউন্ট খুললে তাদের নির্বাচন করা যাবে।
              </p>
            ) : (
              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                {availableUsers.map((u) => {
                  const isSelected = selectedUserIds.includes(u.id);
                  return (
                    <div
                      key={u.id}
                      onClick={() => toggleUserSelection(u.id)}
                      className={`flex items-center justify-between p-2 rounded-xl cursor-pointer border transition ${
                        isSelected
                          ? 'bg-[#00a884]/15 border-[#00a884]'
                          : 'bg-[#0b171a] border-[#183439] hover:bg-[#12282d]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <img src={u.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <div className="text-xs font-semibold text-white">{u.name}</div>
                          <div className="text-[10px] text-[#00a884] font-mono">{u.phone}</div>
                        </div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center transition ${
                          isSelected ? 'bg-[#00a884] text-white' : 'border border-[#8696a0]'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-[#39181a] border border-[#5d2327] text-xs text-[#fca5a5]">
              {error}
            </div>
          )}

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-[#0d1f23] border border-[#1f4249] text-xs font-semibold text-[#8696a0] hover:text-white transition"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isLoading || availableUsers.length === 0}
              className="flex-1 py-2.5 rounded-xl bg-[#00a884] hover:bg-[#02906f] disabled:opacity-50 text-xs font-semibold text-white transition flex items-center justify-center gap-1.5"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>গ্রুপ তৈরি করুন</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
