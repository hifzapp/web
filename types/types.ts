export type Ayah = {
  id: number;
  surah_number: number;
  ayah_number: number;
  verse_key: string;
  words_count: number;
  text: string;
};

export type QuranData = Record<string, Ayah>;

export type Segment = [number, number, number];

export type RecitationAyah = {
  surah_number: number;
  ayah_number: number;
  audio_url: string;
  duration: number | null;
  segments: Segment[];
};

export type RecitationData = Record<string, RecitationAyah>;

export type HifzSession = {
  id: number;
  user_id: number;
  session_type: string;
  duration: number;
  surah_number: number;
  start_ayah: number;
  end_ayah: number;
  score: number;
  mistakes: number;
  hearts_lost: number;
  created_at: string;
};

export type Stage =
  | "loading"
  | "error"
  | "listening"
  | "testing"
  | "final-test"
  | "success"
  | "cooldown";

export type TestState = {
  currentAyahIndex: number;
  hearts: number;
  userInput: string;
  isCorrect: boolean | null;
  isChecking: boolean;
  cooldownSeconds: number;
  cooldownTimer: number | null;
};

export type FinalTestState = {
  inputs: Record<number, string>;
  results: Record<number, boolean | null>;
  isSubmitting: boolean;
  allCorrect: boolean | null;
};