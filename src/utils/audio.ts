/**
 * Audio synthesis for WhatsApp sound effects and Web Speech API for message reading
 */

class SoundEffects {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // WhatsApp sent message pop sound
  playSentSound() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(700, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  // WhatsApp received message chime
  playReceivedSound() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(880, now);
      osc2.frequency.setValueAtTime(1320, now + 0.07);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.08);

      osc2.start(now + 0.07);
      osc2.stop(now + 0.25);
    } catch {
      // Ignore
    }
  }

  // Voice recording start beep
  playRecordBeep() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(540, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // Ignore
    }
  }
}

export const sounds = new SoundEffects();

/**
 * Text-to-Speech (মেসেজ পড়ার সুবিধা / Read Aloud)
 */
export class MessageSpeaker {
  private static synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private static currentUtterance: SpeechSynthesisUtterance | null = null;
  private static activeMessageId: string | null = null;
  private static onStateChangeListeners: Array<(activeId: string | null) => void> = [];

  static subscribe(listener: (activeId: string | null) => void) {
    this.onStateChangeListeners.push(listener);
    return () => {
      this.onStateChangeListeners = this.onStateChangeListeners.filter((l) => l !== listener);
    };
  }

  private static notify() {
    this.onStateChangeListeners.forEach((l) => l(this.activeMessageId));
  }

  static isSpeaking(messageId?: string): boolean {
    if (!this.synth) return false;
    if (messageId) {
      return this.activeMessageId === messageId && this.synth.speaking;
    }
    return this.synth.speaking;
  }

  static stop() {
    if (!this.synth) return;
    this.synth.cancel();
    this.activeMessageId = null;
    this.notify();
  }

  static speak(messageId: string, text: string, lang = 'bn-BD') {
    if (!this.synth) return;

    if (this.activeMessageId === messageId && this.synth.speaking) {
      this.stop();
      return;
    }

    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance = utterance;
    this.activeMessageId = messageId;
    this.notify();

    // Find best voice: Bengali if available, otherwise native voice
    const voices = this.synth.getVoices();
    const bnVoice = voices.find((v) => v.lang.startsWith('bn') || v.lang.includes('Bengali') || v.lang.includes('Bangla'));
    if (bnVoice) {
      utterance.voice = bnVoice;
      utterance.lang = bnVoice.lang;
    } else {
      utterance.lang = lang;
    }

    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      if (this.activeMessageId === messageId) {
        this.activeMessageId = null;
        this.notify();
      }
    };

    utterance.onerror = () => {
      if (this.activeMessageId === messageId) {
        this.activeMessageId = null;
        this.notify();
      }
    };

    this.synth.speak(utterance);
  }
}
