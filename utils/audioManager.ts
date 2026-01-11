/**
 * Audio Manager - Gestión de reproducción de audio
 * Scope 6: Sistema de Narration - Audio Manager
 * 
 * @deprecated P0-05: Audio eliminado del Flow. Este archivo está deprecado y no debe usarse en nuevo código.
 * Los subtítulos del Flow se manejan mediante useFlowSubtitle hook, sin audio.
 * 
 * Funcionalidades (deprecadas):
 * - Reproducción de audio pre-grabado (expo-av)
 * - Text-to-Speech (expo-speech)
 * - Control de volumen, pausa, stop
 * - Manejo de errores
 * 
 * Este archivo se mantiene temporalmente por compatibilidad, pero NO debe usarse en nuevo código relacionado con Flow.
 */

import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

export type AudioSource = {
  type: 'url' | 'tts' | 'none'; // SCOPE 1: Agregar tipo "none" para silencio controlado
  source: string; // URL para audio pre-grabado, texto para TTS, vacío para "none"
  language?: string; // Idioma para TTS (opcional, default: 'en-US')
  rate?: number; // Velocidad de TTS (0.5 - 2.0, default: 1.0)
  pitch?: number; // Tono de TTS (0.5 - 2.0, default: 1.0)
};

// SCOPE 1: Tipo para identificar claramente el tipo de fuente de audio
export type AudioSourceType = 'file' | 'tts' | 'none';

export type AudioManagerStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'stopped' | 'error';

// SCOPE 1: Detección robusta de plataforma para TTS
function isMobileWeb(): boolean {
  if (Platform.OS !== 'web') {
    return false;
  }
  if (typeof window === 'undefined') {
    return false;
  }
  // Detectar si tiene touch support (mobile browser)
  try {
    return window.matchMedia('(pointer: coarse)').matches;
  } catch {
    return false;
  }
}

function isIOSSafari(): boolean {
  if (Platform.OS !== 'web') {
    return Platform.OS === 'ios';
  }
  if (typeof window === 'undefined' || !window.navigator) {
    return false;
  }
  const ua = window.navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isSafari = /Safari/.test(ua) && !/Chrome|CriOS|FxiOS/.test(ua);
  return isIOS && isSafari;
}

function isAndroidChrome(): boolean {
  if (Platform.OS !== 'web') {
    return Platform.OS === 'android';
  }
  if (typeof window === 'undefined' || !window.navigator) {
    return false;
  }
  const ua = window.navigator.userAgent;
  return /Android/.test(ua) && /Chrome/.test(ua);
}

function isTTSStable(): boolean {
  // TTS es estable en:
  // - iOS Safari (nativo o web)
  // - Android Chrome (nativo o web)
  // - Mobile web (Safari iOS o Chrome Android)
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    return true; // Nativos siempre funcionan
  }
  if (Platform.OS === 'web') {
    // Web: solo mobile browsers tienen TTS estable
    return isMobileWeb() && (isIOSSafari() || isAndroidChrome());
  }
  return false;
}

function shouldDisableTTS(): boolean {
  // Deshabilitar TTS si no es estable en la plataforma
  return !isTTSStable();
}

export interface AudioManagerCallbacks {
  onPlay?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  onFinish?: () => void;
  onError?: (error: Error) => void;
}

class AudioManager {
  private sound: Audio.Sound | null = null;
  private status: AudioManagerStatus = 'idle';
  private currentSource: AudioSource | null = null;
  private callbacks: AudioManagerCallbacks = {};
  private isMuted: boolean = false;
  // SCOPE 1: Prevenir múltiples TTS simultáneos
  private isTTSActive: boolean = false;

  constructor() {
    // Configurar modo de audio para interrupciones
    // Usar DuckOthers para permitir mezclar con otras apps como Apple Music
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      interruptionModeIOS: InterruptionModeIOS.DuckOthers, // Permite mezclar con otras apps
      interruptionModeAndroid: InterruptionModeAndroid.DuckOthers, // Permite mezclar con otras apps
      allowsRecordingIOS: false,
    }).catch((error) => {
      console.warn('Error configuring audio mode:', error);
    });
  }

  /**
   * Configurar callbacks
   */
  setCallbacks(callbacks: AudioManagerCallbacks) {
    this.callbacks = callbacks;
  }

  /**
   * Reproducir audio (pre-grabado o TTS)
   * SCOPE 1: Manejo robusto de errores con fallback limpio
   */
  async play(source: AudioSource): Promise<void> {
    try {
      // Detener cualquier reproducción anterior
      await this.stop();

      this.currentSource = source;
      this.status = 'loading';

      if (source.type === 'tts') {
        // Text-to-Speech
        await this.playTTS(source);
      } else if (source.type === 'url') {
        // Audio pre-grabado
        await this.playAudio(source);
      } else if (source.type === 'none') {
        // SCOPE 1: Silencio controlado - completar inmediatamente sin reproducir
        this.status = 'stopped';
        this.callbacks.onFinish?.();
      }
    } catch (error) {
      // SCOPE 1: Manejo de errores robusto - restaurar estado UI sin reintentos
      this.status = 'stopped';
      this.currentSource = null;
      this.isTTSActive = false; // Reset flag TTS
      const errorObj = error instanceof Error ? error : new Error(String(error));
      console.warn('[Audio] Playback failed, restoring UI state:', errorObj.message);
      // NO llamar onError para evitar loops - simplemente completar
      this.callbacks.onFinish?.();
      // NO hacer throw para evitar propagar error y permitir que el flujo continúe
    }
  }

  /**
   * Reproducir audio pre-grabado usando expo-av
   */
  private async playAudio(source: AudioSource): Promise<void> {
    const { sound } = await Audio.Sound.createAsync(
      { uri: source.source },
      { shouldPlay: !this.isMuted },
      (status) => {
        if (status.isLoaded) {
          if (status.didJustFinish) {
            this.status = 'stopped';
            this.callbacks.onFinish?.();
          }
        }
      }
    );

    this.sound = sound;
    this.status = 'playing';
    this.callbacks.onPlay?.();
  }

  /**
   * Reproducir Text-to-Speech usando expo-speech
   * SCOPE 1: Implementación robusta con prevención de múltiples TTS y manejo de errores
   */
  private async playTTS(source: AudioSource): Promise<void> {
    // SCOPE 1: Prevenir múltiples TTS simultáneos
    if (this.isTTSActive) {
      console.warn('[TTS] TTS already active, skipping new request');
      this.status = 'stopped';
      this.callbacks.onFinish?.();
      return Promise.resolve();
    }

    // SCOPE 1: Deshabilitar TTS en plataformas no estables (desktop web)
    if (shouldDisableTTS()) {
      console.log('[Audio] TTS not stable on this platform, using fallback (text only)');
      // Simular éxito sin reproducir audio - silencio controlado
      this.status = 'stopped';
      this.callbacks.onFinish?.();
      return Promise.resolve();
    }

    // SCOPE 1: Validar texto antes de intentar TTS
    const text = source.source?.trim();
    if (!text || typeof text !== 'string' || text.length === 0) {
      console.log('[TTS] Empty text block — skipping audio');
      // Silencio controlado - completar sin reproducir
      this.status = 'stopped';
      this.callbacks.onFinish?.();
      return Promise.resolve();
    }

    // SCOPE 1: Marcar TTS como activo
    this.isTTSActive = true;

    return new Promise((resolve) => {
      let hasResolved = false; // Prevenir múltiples resoluciones

      const options: Speech.SpeechOptions = {
        language: source.language || 'en-US',
        pitch: source.pitch || 0.95,
        rate: source.rate || 0.85,
        onStart: () => {
          if (hasResolved) return;
          this.status = 'playing';
          this.callbacks.onPlay?.();
        },
        onDone: () => {
          if (hasResolved) return;
          hasResolved = true;
          this.isTTSActive = false;
          this.status = 'stopped';
          this.callbacks.onFinish?.();
          resolve();
        },
        onStopped: () => {
          if (hasResolved) return;
          hasResolved = true;
          this.isTTSActive = false;
          this.status = 'stopped';
          this.callbacks.onStop?.();
          resolve();
        },
        onError: (error) => {
          // SCOPE 1: Manejo de errores robusto - NO reintentar, simplemente fallback limpio
          if (hasResolved) return;
          hasResolved = true;
          this.isTTSActive = false;
          console.warn('[TTS] Error occurred, using fallback (silent):', error.message);
          // Restaurar estado UI sin error visible - flujo continúa
          this.status = 'stopped';
          this.currentSource = null;
          // Completar silenciosamente para que el flujo continúe
          this.callbacks.onFinish?.();
          resolve(); // Resolver en lugar de reject para evitar propagación de error
        },
      };

      if (this.isMuted) {
        // Si está silenciado, marcar como completado inmediatamente
        if (hasResolved) return;
        hasResolved = true;
        this.isTTSActive = false;
        this.status = 'stopped';
        this.callbacks.onFinish?.();
        resolve();
        return;
      }

      try {
        // Intentar reproducir TTS
        Speech.speak(text, options);
        // Nota: La promise se resuelve en onDone/onError/onStopped
      } catch (error) {
        // SCOPE 1: Catch síncrono de errores - fallback inmediato
        if (hasResolved) return;
        hasResolved = true;
        this.isTTSActive = false;
        const errorObj = error instanceof Error ? error : new Error(String(error));
        console.warn('[TTS] Synchronous error, using fallback (silent):', errorObj.message);
        this.status = 'stopped';
        this.currentSource = null;
        this.callbacks.onFinish?.();
        resolve(); // Resolver en lugar de reject
      }
    });
  }

  /**
   * Pausar reproducción
   * SAFE: Handles errors gracefully
   */
  async pause(): Promise<void> {
    if (this.status === 'playing') {
      try {
      if (this.currentSource?.type === 'tts') {
        try {
          Speech.stop();
        } catch {
          // Ignore TTS errors
        }
          this.status = 'paused';
          this.callbacks.onPause?.();
        } else if (this.sound) {
          try {
            await this.sound.pauseAsync();
          } catch {
            // Ignore pause errors
          }
          this.status = 'paused';
          this.callbacks.onPause?.();
        }
      } catch {
        // Ensure state is updated even if pause fails
        this.status = 'paused';
      }
    }
  }

  /**
   * Reanudar reproducción
   */
  async resume(): Promise<void> {
    if (this.status === 'paused') {
      if (this.currentSource?.type === 'tts') {
        // TTS no se puede reanudar, reproducir desde el inicio
        if (this.currentSource) {
          await this.play(this.currentSource);
        }
      } else if (this.sound) {
        if (!this.isMuted) {
          await this.sound.playAsync();
        }
        this.status = 'playing';
        this.callbacks.onPlay?.();
      }
    }
  }

  /**
   * Detener reproducción
   * SAFE: Idempotent - safe to call multiple times or when already stopped
   * Always resets state reliably, even if errors occur or nothing is playing
   * SCOPE 1: Reset flag TTS activo
   */
  async stop(): Promise<void> {
    try {
      // SCOPE 1: Reset flag TTS antes de intentar detener
      this.isTTSActive = false;

      // Always try to stop TTS first (safe even if no TTS is active)
      try {
        Speech.stop();
      } catch {
        // Ignore TTS errors - Speech.stop() is safe to call even if nothing is playing
        // Some platforms may throw errors, but we can safely ignore them
      }

      // Stop audio if present
      if (this.sound) {
        try {
          await this.sound.stopAsync();
        } catch {
          // Ignore stop errors - continue to unload
        }
        try {
          await this.sound.unloadAsync();
        } catch {
          // Ignore unload errors - sound may already be unloaded
        }
        this.sound = null;
      }
    } catch {
      // Ignore any errors during stop - we'll still reset state
    }

    // Always reset state, regardless of errors or previous state
    // This makes stop() idempotent - safe to call multiple times
    this.status = 'stopped';
    this.currentSource = null;
    this.isTTSActive = false; // SCOPE 1: Asegurar reset de flag TTS
    this.callbacks.onStop?.();
  }

  /**
   * Silenciar/activar sonido
   */
  async setMuted(muted: boolean): Promise<void> {
    this.isMuted = muted;

    if (this.status === 'playing') {
      if (this.currentSource?.type === 'tts') {
        if (muted) {
          Speech.stop();
        } else {
          // Reanudar TTS no es posible, se mantiene silenciado
        }
      } else if (this.sound) {
        if (muted) {
          await this.sound.setVolumeAsync(0);
        } else {
          await this.sound.setVolumeAsync(1.0);
        }
      }
    }
  }

  /**
   * Obtener estado actual
   */
  getStatus(): AudioManagerStatus {
    return this.status;
  }

  /**
   * Obtener estado de muted
   */
  getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * SCOPE 1: Obtener tipo de fuente de audio actual de forma clara
   */
  getAudioSourceType(): AudioSourceType {
    if (!this.currentSource) {
      return 'none';
    }
    if (this.currentSource.type === 'url') {
      return 'file';
    }
    if (this.currentSource.type === 'tts') {
      return 'tts';
    }
    return 'none';
  }

  /**
   * Limpiar recursos
   */
  async cleanup(): Promise<void> {
    await this.stop();
    this.callbacks = {};
  }
}

// Singleton instance
export const audioManager = new AudioManager();

