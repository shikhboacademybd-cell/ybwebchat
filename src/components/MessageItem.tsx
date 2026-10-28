import React, { useState, useEffect } from 'react';
import { Check, CheckCheck, Volume2, VolumeX, Download, FileText, Play, Pause } from 'lucide-react';
import { Message } from '../types';
import { MessageSpeaker } from '../utils/audio';

interface MessageItemProps {
  message: Message;
  isCurrentUser: boolean;
  isGroup?: boolean;
  onImageClick?: (url: string) => void;
  lang?: 'bn' | 'en';
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isCurrentUser,
  isGroup,
  onImageClick,
  lang = 'bn'
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const unsub = MessageSpeaker.subscribe((activeId) => {
      setIsSpeaking(activeId === message.id);
    });
    return unsub;
  }, [message.id]);

  const formatTime = (ts: number) => {
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSpeaking) {
      MessageSpeaker.stop();
    } else {
      const textToRead = message.text || (message.type === 'image' ? 'একটি ছবি পাঠানো হয়েছে' : 'একটি ফাইল সংযুক্ত আছে');
      MessageSpeaker.speak(message.id, textToRead, lang === 'bn' ? 'bn-BD' : 'en-US');
    }
  };

  const toggleVoiceNote = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlayingAudio) {
      setIsPlayingAudio(false);
      setAudioProgress(0);
    } else {
      setIsPlayingAudio(true);
      // Simulate audio playback progress
      let current = 0;
      const interval = setInterval(() => {
        current += 10;
        if (current >= 100) {
          clearInterval(interval);
          setIsPlayingAudio(false);
          setAudioProgress(0);
        } else {
          setAudioProgress(current);
        }
      }, 150);
    }
  };

  return (
    <div className={`flex w-full my-1 px-2 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`relative max-w-[85%] sm:max-w-[70%] rounded-2xl p-2.5 shadow-sm transition-all text-sm ${
          isCurrentUser
            ? 'bg-[#005c4b] text-[#e9edef] rounded-tr-none'
            : 'bg-[#202c33] text-[#e9edef] rounded-tl-none'
        }`}
      >
        {/* Group Sender Name */}
        {isGroup && !isCurrentUser && (
          <div className="text-xs font-semibold text-[#00a884] mb-1">
            {message.senderName}
          </div>
        )}

        {/* Message Content by Type */}
        {message.type === 'text' && (
          <p className="whitespace-pre-wrap break-words leading-relaxed pr-2 select-text">
            {message.text}
          </p>
        )}

        {message.type === 'image' && (
          <div className="space-y-1.5">
            <div
              onClick={() => onImageClick && message.fileUrl && onImageClick(message.fileUrl)}
              className="rounded-xl overflow-hidden cursor-pointer max-h-72 bg-black/20 group relative"
            >
              <img
                src={message.fileUrl}
                alt="Attachment"
                className="w-full h-auto object-cover group-hover:scale-[1.02] transition duration-200"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition" />
            </div>
            {message.text && (
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed px-1">
                {message.text}
              </p>
            )}
          </div>
        )}

        {message.type === 'audio' && (
          <div className="flex items-center gap-3 py-1 px-1 min-w-[200px] sm:min-w-[240px]">
            <button
              type="button"
              onClick={toggleVoiceNote}
              className="w-10 h-10 rounded-full bg-[#00a884] hover:bg-[#02906f] text-white flex items-center justify-center shrink-0 transition shadow-md"
            >
              {isPlayingAudio ? (
                <Pause className="w-5 h-5 fill-white" />
              ) : (
                <Play className="w-5 h-5 fill-white ml-0.5" />
              )}
            </button>

            <div className="flex-1">
              {/* Audio Waveform visualization */}
              <div className="h-4 flex items-center gap-0.5 w-full">
                {[40, 70, 30, 90, 60, 45, 80, 100, 50, 75, 35, 65, 85, 40, 95, 60, 30].map((h, i) => (
                  <div
                    key={i}
                    className={`w-1 rounded-full transition-all duration-150 ${
                      (i / 17) * 100 <= audioProgress ? 'bg-[#53bdeb]' : 'bg-[#8696a0]/40'
                    }`}
                    style={{ height: `${Math.max(20, h)}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between items-center text-[10px] text-[#8696a0] mt-1 font-mono">
                <span>{isPlayingAudio ? `0:0${Math.floor(audioProgress / 30)}` : '0:07'}</span>
                <span>ভয়েস নোট</span>
              </div>
            </div>
          </div>
        )}

        {message.type === 'file' && (
          <div className="flex items-center gap-3 p-2 rounded-xl bg-black/20 min-w-[220px]">
            <div className="w-10 h-10 rounded-lg bg-[#00a884]/20 flex items-center justify-center text-[#00a884] shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium truncate text-white">
                {message.fileName || 'document.pdf'}
              </div>
              <div className="text-[10px] text-[#8696a0]">
                {message.fileSize || '1.4 MB'}
              </div>
            </div>
            {message.fileUrl && (
              <a
                href={message.fileUrl}
                download={message.fileName || 'file'}
                className="p-1.5 rounded-lg hover:bg-white/10 text-[#8696a0] hover:text-white transition"
              >
                <Download className="w-4 h-4" />
              </a>
            )}
          </div>
        )}

        {/* Bottom meta row: Read Aloud button, Time, and Status ticks */}
        <div className="flex items-center justify-end gap-1.5 mt-1 pt-0.5 text-[10px] text-[#8696a0] select-none">
          {/* Read Aloud Button (মেসেজ পড়ার সুবিধা) */}
          <button
            type="button"
            onClick={handleSpeak}
            title={lang === 'bn' ? 'মেসেজ পড়ে শুনুন' : 'Read aloud'}
            className={`p-1 rounded-full hover:bg-white/10 transition flex items-center gap-0.5 ${
              isSpeaking ? 'text-[#00a884] animate-pulse bg-white/10' : 'text-[#8696a0] hover:text-[#e9edef]'
            }`}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-3 h-3 text-[#00a884]" />
                <span className="text-[9px] text-[#00a884] font-medium hidden sm:inline">পড়া হচ্ছে</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3 h-3" />
                <span className="text-[9px] hidden sm:inline">শুনুন</span>
              </>
            )}
          </button>

          <span>{formatTime(message.timestamp)}</span>

          {/* Delivery ticks for current user */}
          {isCurrentUser && (
            <span className="inline-flex items-center ml-0.5">
              {message.status === 'sent' && (
                <Check className="w-3.5 h-3.5 text-[#8696a0]" />
              )}
              {message.status === 'delivered' && (
                <CheckCheck className="w-3.5 h-3.5 text-[#8696a0]" />
              )}
              {message.status === 'read' && (
                <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
