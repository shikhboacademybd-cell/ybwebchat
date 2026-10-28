/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User } from './types';
import { AuthScreen } from './components/AuthScreen';
import { ChatLayout } from './components/ChatLayout';
import { ChatService } from './services/chatService';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [lang, setLang] = useState<'bn' | 'en'>('bn');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Restore authenticated Firebase session from storage if available
    const saved = localStorage.getItem('wa_firebase_user');
    if (saved) {
      try {
        const u = JSON.parse(saved) as User;
        setCurrentUser(u);
        ChatService.setUserOnline(u.id, true).catch(() => {});
      } catch {
        // Invalid session
      }
    }
    setIsInitialized(true);
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    ChatService.setUserOnline(user.id, true).catch(() => {});
  };

  const handleLogout = () => {
    if (currentUser) {
      ChatService.setUserOnline(currentUser.id, false).catch(() => {});
    }
    localStorage.removeItem('wa_firebase_user');
    setCurrentUser(null);
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#0c1517] flex items-center justify-center text-[#00a884]">
        <div className="w-10 h-10 border-4 border-[#00a884] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c1517] text-[#e9edef] overflow-hidden">
      {!currentUser ? (
        <AuthScreen
          onLoginSuccess={handleLoginSuccess}
          lang={lang}
          setLang={setLang}
        />
      ) : (
        <ChatLayout
          currentUser={currentUser}
          onLogout={handleLogout}
          lang={lang}
          setLang={setLang}
        />
      )}
    </div>
  );
}
