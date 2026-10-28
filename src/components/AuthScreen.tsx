import React, { useState, useRef } from 'react';
import { User as UserIcon, Phone, Lock, Eye, EyeOff, Camera, Check, MessageSquare, Globe, AlertCircle, Loader2 } from 'lucide-react';
import { User } from '../types';
import { PRESET_AVATARS } from '../utils/storage';
import { ChatService } from '../services/chatService';

interface AuthScreenProps {
  onLoginSuccess: (user: User) => void;
  lang: 'bn' | 'en';
  setLang: (lang: 'bn' | 'en') => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess, lang, setLang }) => {
  const [tab, setTab] = useState<'login' | 'register'>('register');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string>(PRESET_AVATARS[0]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = {
    title: lang === 'bn' ? 'হোয়াটসঅ্যাপ ওয়েব' : 'WhatsApp Web',
    subtitle: lang === 'bn' ? 'নিরাপদ রিয়েল-টাইম মেসেজিং ও ফাইল শেয়ারিং প্ল্যাটফর্ম' : 'Secure Real-Time Messaging & File Sharing Platform',
    loginTab: lang === 'bn' ? 'লগইন (Login)' : 'Login',
    registerTab: lang === 'bn' ? 'রেজিস্ট্রেশন (Register)' : 'Register',
    fullNameLabel: lang === 'bn' ? 'আপনার পূর্ণ নাম *' : 'Your Full Name *',
    phoneLabel: lang === 'bn' ? 'ফোন নম্বর *' : 'Phone Number *',
    avatarLabel: lang === 'bn' ? 'প্রোফাইল ছবি নির্বাচন বা আপলোড' : 'Choose or Upload Profile Picture',
    fileBtn: lang === 'bn' ? 'ফাইল' : 'File',
    passwordLabel: lang === 'bn' ? 'পাসওয়ার্ড *' : 'Password *',
    registerBtn: lang === 'bn' ? 'অ্যাকাউন্ট তৈরি ও প্রবেশ করুন' : 'Create Account & Enter',
    loginBtn: lang === 'bn' ? 'লগইন ও প্রবেশ করুন' : 'Login & Enter',
    errorEmpty: lang === 'bn' ? 'অনুগ্রহ করে সব প্রয়োজনীয় তথ্য পূরণ করুন।' : 'Please fill in all required fields.',
    errorPhoneShort: lang === 'bn' ? 'সঠিক ফোন নম্বর দিন (যেমন: 017xxxxxxxx)।' : 'Please provide a valid phone number.',
    errorPassShort: lang === 'bn' ? 'পাসওয়ার্ড অন্তত ৪ ডিজিট বা অক্ষরের হতে হবে।' : 'Password must be at least 4 characters.',
    firebaseBadge: lang === 'bn' ? 'ফায়ারবেস ক্লাউড ডেটাবেস যুক্ত' : 'Firebase Cloud Database Connected'
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setSelectedAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const normalizePhoneNumber = (input: string) => {
    const bn = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
    const converted = input.replace(/[০-৯]/g, (d) => bn.indexOf(d).toString());
    return converted.replace(/[-–—\s]/g, '').trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanPhone = normalizePhoneNumber(phone);
    const cleanPassword = password.trim();

    if (tab === 'register') {
      const cleanName = fullName.trim();
      if (!cleanName || !cleanPhone || !cleanPassword) {
        setError(t.errorEmpty);
        return;
      }
      if (cleanPhone.length < 8) {
        setError(t.errorPhoneShort);
        return;
      }
      if (cleanPassword.length < 4) {
        setError(t.errorPassShort);
        return;
      }

      setIsLoading(true);
      try {
        const newUser = await ChatService.registerUser({
          name: cleanName,
          phone: cleanPhone,
          password: cleanPassword,
          avatar: selectedAvatar
        });
        localStorage.setItem('wa_firebase_user', JSON.stringify(newUser));
        onLoginSuccess(newUser);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'অ্যাকাউন্ট তৈরিতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Login flow
      if (!cleanPhone || !cleanPassword) {
        setError(t.errorEmpty);
        return;
      }

      setIsLoading(true);
      try {
        const loggedInUser = await ChatService.loginUser(cleanPhone, cleanPassword);
        localStorage.setItem('wa_firebase_user', JSON.stringify(loggedInUser));
        onLoginSuccess(loggedInUser);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'লগইন করতে সমস্যা হয়েছে।');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0c1517] flex flex-col justify-between items-center px-4 py-6 sm:py-10 text-[#e9edef] relative overflow-x-hidden">
      {/* Background ambient gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-80 bg-[#00a884]/10 blur-[120px] pointer-events-none rounded-full" />

      {/* Top Bar with Language toggle */}
      <header className="w-full max-w-md flex justify-between items-center mb-2 z-10">
        <span className="text-[11px] text-[#00a884] font-medium flex items-center gap-1.5 bg-[#112225] px-2.5 py-1 rounded-lg border border-[#1a383d]">
          <span className="w-2 h-2 rounded-full bg-[#00a884] animate-pulse" />
          {t.firebaseBadge}
        </span>

        <button
          type="button"
          onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#112225] border border-[#1a383d] text-xs text-[#00a884] hover:bg-[#162d31] transition"
        >
          <Globe className="w-3.5 h-3.5 text-[#00a884]" />
          <span>{lang === 'bn' ? 'English' : 'বাংলা'}</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-md bg-[#112225] border border-[#183439] rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10">
        {/* App Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl bg-[#00a884] flex items-center justify-center shadow-lg shadow-[#00a884]/25">
            <MessageSquare className="w-8 h-8 text-white fill-white" />
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            {t.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#8696a0] leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-[#091518] rounded-xl mb-6 border border-[#162e33]">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setError(null);
            }}
            className={`py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
              tab === 'login'
                ? 'bg-[#00a884] text-white shadow-md'
                : 'text-[#8696a0] hover:text-[#e9edef]'
            }`}
          >
            {t.loginTab}
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setError(null);
            }}
            className={`py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
              tab === 'register'
                ? 'bg-[#00a884] text-white shadow-md'
                : 'text-[#8696a0] hover:text-[#e9edef]'
            }`}
          >
            {t.registerTab}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'register' && (
            <div>
              <label className="block text-xs sm:text-sm font-medium text-[#d1d7db] mb-1.5">
                {t.fullNameLabel}
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-[#00a884] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="আপনার নাম লিখুন"
                  className="w-full bg-[#0a1619] border border-[#19363c] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00a884] transition"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs sm:text-sm font-medium text-[#d1d7db] mb-1.5">
              {t.phoneLabel}
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#00a884] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="০১০০০-০০০০০০"
                className="w-full bg-[#0a1619] border border-[#19363c] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00a884] transition font-mono placeholder:text-[#556973]"
                required
              />
            </div>
          </div>

          {tab === 'register' && (
            <div>
              <label className="block text-xs sm:text-sm font-medium text-[#d1d7db] mb-2">
                {t.avatarLabel}
              </label>
              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Active Preview */}
                <div className="relative w-11 h-11 rounded-full p-0.5 border-2 border-[#00a884]">
                  <img
                    src={selectedAvatar}
                    alt="Preview"
                    className="w-full h-full rounded-full object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-[#00a884] rounded-full p-0.5">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                </div>

                {/* Preset Avatars */}
                {PRESET_AVATARS.slice(0, 3).map((av, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedAvatar(av)}
                    className={`w-9 h-9 rounded-full overflow-hidden border-2 transition cursor-pointer ${
                      selectedAvatar === av ? 'border-[#00a884] scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={av} alt="Preset avatar" className="w-full h-full object-cover" />
                  </button>
                ))}

                {/* Custom File Upload */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-2 bg-[#0d1f23] border border-[#1f4249] rounded-xl text-xs text-[#00a884] hover:bg-[#142e34] transition cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{t.fileBtn}</span>
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs sm:text-sm font-medium text-[#d1d7db] mb-1.5">
              {t.passwordLabel}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#00a884] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="পাসওয়ার্ড লিখুন"
                className="w-full bg-[#0a1619] border border-[#19363c] rounded-xl pl-10 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-[#00a884] transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8696a0] hover:text-[#00a884] transition cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error Message Box */}
          {error && (
            <div className="p-3 rounded-xl bg-[#39181a] border border-[#5d2327] flex items-center gap-2.5 text-xs text-[#fca5a5] animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#f87171]" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#00a884] hover:bg-[#02906f] active:scale-[0.99] text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#00a884]/20 transition mt-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{tab === 'register' ? t.registerBtn : t.loginBtn}</span>
              </>
            )}
          </button>
        </form>
      </main>

      {/* Footer Info */}
      <footer className="w-full max-w-md text-center mt-6 text-[11px] text-[#6b7c85]">
        <span>🔒 ফায়ারবেস ক্লাউডে সম্পূর্ণ রিয়েল-টাইম ডেটাবেস সিঙ্ক্রোনাইজড</span>
      </footer>
    </div>
  );
};
