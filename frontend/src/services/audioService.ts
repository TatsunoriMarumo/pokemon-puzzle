import { AppError, ERROR_CODES } from "../constants/errorCodes";

export interface AudioPlayer {
  preload(url: string): Promise<void>;
  play(url: string): Promise<void>;
  clear(url: string): void;
  clearAll(): void;
}

interface AudioBufferLoader {
  load(url: string): Promise<AudioBuffer>;
  clear(url: string): void;
  clearAll(): void;
}

interface AudioSourcePlayer {
  play(url: string, buffer: AudioBuffer): Promise<void>;
  stop(url: string): void;
  stopAll(): void;
}

type WebkitAudioWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

class BrowserAudioContextProvider {
  private audioContext: AudioContext | null = null;

  get(): AudioContext {
    if (this.audioContext) {
      return this.audioContext;
    }

    const AudioContextClass =
      window.AudioContext ||
      (window as WebkitAudioWindow).webkitAudioContext;

    if (!AudioContextClass) {
      throw new AppError(ERROR_CODES.AUDIO_CONTEXT_NOT_SUPPORTED);
    }

    this.audioContext = new AudioContextClass();

    return this.audioContext;
  }

  async resume(): Promise<AudioContext> {
    const audioContext = this.get();

    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    return audioContext;
  }
}

class CachedAudioBufferLoader implements AudioBufferLoader {
  private readonly audioContextProvider: BrowserAudioContextProvider;
  private readonly cache = new Map<string, Promise<AudioBuffer>>();

  constructor(audioContextProvider: BrowserAudioContextProvider) {
    this.audioContextProvider = audioContextProvider;
  }

  async load(url: string): Promise<AudioBuffer> {
    const cachedBuffer = this.cache.get(url);

    if (cachedBuffer) {
      return cachedBuffer;
    }

    const bufferPromise = this.fetchAndDecode(url);
    this.cache.set(url, bufferPromise);

    return bufferPromise;
  }

  clear(url: string): void {
    this.cache.delete(url);
  }

  clearAll(): void {
    this.cache.clear();
  }

  private async fetchAndDecode(url: string): Promise<AudioBuffer> {
    const response = await fetch(url);

    if (!response.ok) {
      this.cache.delete(url);
      throw new AppError(ERROR_CODES.AUDIO_FETCH_FAILED);
    }

    const arrayBuffer = await response.arrayBuffer();
    const audioContext = this.audioContextProvider.get();

    try {
      return await audioContext.decodeAudioData(arrayBuffer);
    } catch {
      this.cache.delete(url);
      throw new AppError(ERROR_CODES.AUDIO_DECODE_FAILED);
    }
  }
}

class WebAudioSourcePlayer implements AudioSourcePlayer {
  private readonly audioContextProvider: BrowserAudioContextProvider;
  private readonly activeSources = new Map<string, AudioBufferSourceNode>();

  constructor(audioContextProvider: BrowserAudioContextProvider) {
    this.audioContextProvider = audioContextProvider;
  }

  async play(url: string, buffer: AudioBuffer): Promise<void> {
    const audioContext = await this.audioContextProvider.resume();

    this.stop(url);

    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);

    source.onended = () => {
      if (this.activeSources.get(url) === source) {
        this.activeSources.delete(url);
      }
    };

    this.activeSources.set(url, source);
    source.start(audioContext.currentTime);
  }

  stop(url: string): void {
    const source = this.activeSources.get(url);

    if (!source) {
      return;
    }

    try {
      source.stop();
    } catch {
      return;
    } finally {
      this.activeSources.delete(url);
    }
  }

  stopAll(): void {
    this.activeSources.forEach((source) => {
      try {
        source.stop();
      } catch {
        return;
      }
    });

    this.activeSources.clear();
  }
}

class BrowserAudioService implements AudioPlayer {
  private readonly audioBufferLoader: AudioBufferLoader;
  private readonly audioSourcePlayer: AudioSourcePlayer;

  constructor(
    audioBufferLoader: AudioBufferLoader,
    audioSourcePlayer: AudioSourcePlayer
  ) {
    this.audioBufferLoader = audioBufferLoader;
    this.audioSourcePlayer = audioSourcePlayer;
  }

  async preload(url: string): Promise<void> {
    await this.audioBufferLoader.load(url);
  }

  async play(url: string): Promise<void> {
    const buffer = await this.audioBufferLoader.load(url);
    await this.audioSourcePlayer.play(url, buffer);
  }

  clear(url: string): void {
    this.audioSourcePlayer.stop(url);
    this.audioBufferLoader.clear(url);
  }

  clearAll(): void {
    this.audioSourcePlayer.stopAll();
    this.audioBufferLoader.clearAll();
  }
}

const audioContextProvider = new BrowserAudioContextProvider();
const audioBufferLoader = new CachedAudioBufferLoader(audioContextProvider);
const audioSourcePlayer = new WebAudioSourcePlayer(audioContextProvider);

export const audioService: AudioPlayer = new BrowserAudioService(
  audioBufferLoader,
  audioSourcePlayer
);
