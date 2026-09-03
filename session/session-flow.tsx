"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import api, { handleApiError } from "@/lib/api";
import {
  QuranData,
  RecitationData,
  HifzSession,
  Stage,
  TestState,
  FinalTestState,
  Ayah,
} from "@/types/types";
import { CDN_URL, REPETITIONS_PER_AYAH } from "@/constant/constant";
import { isArabicMatch } from "@/lib/utils";
import LoadingStage from "./loading-stage";
import ErrorStage from "./error-stage";
import ListeningStage from "./listening-stage";
import TestingStage from "./testing-stage";
import SuccessStage from "./success-stage";
import { useUser } from "@/contexts/user-context";

interface SessionFlowProps {
  sessionId: string | string[];
}

export default function SessionFlow({ sessionId }: SessionFlowProps) {
  const router = useRouter();
  const id = Array.isArray(sessionId) ? sessionId[0] : sessionId;
  const user = useUser();

  const [session, setSession] = useState<HifzSession | null>(null);
  const [quran, setQuran] = useState<QuranData | null>(null);
  const [recitation, setRecitation] = useState<RecitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>("loading");

  const [currentAyahNumber, setCurrentAyahNumber] = useState<number | null>(null);

  const [testState, setTestState] = useState<TestState>({
    currentAyahIndex: 0,
    hearts: user.user?.hearts as number,
    userInput: "",
    isCorrect: null,
    isChecking: false,
    cooldownSeconds: 0,
    cooldownTimer: null,
  });

  const [finalTestState, setFinalTestState] = useState<FinalTestState>({
    inputs: {},
    results: {},
    isSubmitting: false,
    allCorrect: null,
  });

  const ayahNumbers = useMemo(() => {
    if (!session) return [];
    const numbers: number[] = [];
    for (let i = session.start_ayah; i <= session.end_ayah; i++) {
      numbers.push(i);
    }
    return numbers;
  }, [session]);

  const currentAyah = useMemo(() => {
    if (!session || !quran || currentAyahNumber === null) return null;
    return Object.values(quran).find(
      (item) =>
        item.surah_number === session.surah_number &&
        item.ayah_number === currentAyahNumber,
    );
  }, [session, quran, currentAyahNumber]);

  const recitationAyah = useMemo(() => {
    if (!session || !recitation || currentAyahNumber === null) return null;
    const key = `${session.surah_number}:${currentAyahNumber}`;
    return recitation[key] ?? null;
  }, [session, recitation, currentAyahNumber]);

  const audioUrl = useMemo(() => {
    if (!session || currentAyahNumber === null) return null;
    const surah = String(session.surah_number).padStart(3, "0");
    const ayah = String(currentAyahNumber).padStart(3, "0");
    
    return `https://everyayah.com/data/Yasser_Ad-Dussary_128kbps/${surah}${ayah}.mp3`;
  }, [session, currentAyahNumber]);

  const testAyahs = useMemo(() => {
    if (!session || !quran) return [];
    return ayahNumbers
      .map((num) =>
        Object.values(quran).find(
          (a) =>
            a.surah_number === session.surah_number && a.ayah_number === num,
        ),
      )
      .filter((a): a is Ayah => a !== undefined);
  }, [session, quran, ayahNumbers]);

  const currentTestAyah = testAyahs[testState.currentAyahIndex] ?? null;

  useEffect(() => {
    async function load() {
      if (!id || !CDN_URL) {
        setError("تعذر تحميل جلسة الحفظ.");
        setLoading(false);
        setStage("error");
        return;
      }

      try {
        const [sessionResponse, quranResponse, recitationResponse] =
          await Promise.all([
            api.get(`/app/sessions/${id}`),
            fetch(`${CDN_URL}/quran-metadata-ayah.json`),
            fetch(`${CDN_URL}/ayah-recitation-yasser-al-dosari-murattal-hafs-961.json`),
          ]);

        const sessionData = sessionResponse.data?.session;
        if (!sessionData) {
          throw new Error("لم يتم العثور على جلسة الحفظ.");
        }
        if (!quranResponse.ok) {
          throw new Error("تعذر تحميل بيانات القرآن.");
        }
        if (!recitationResponse.ok) {
          throw new Error("تعذر تحميل بيانات التلاوة.");
        }

        const quranData: QuranData = await quranResponse.json();
        const recitationData: RecitationData = await recitationResponse.json();

        setSession(sessionData);
        setQuran(quranData);
        setRecitation(recitationData);
        setCurrentAyahNumber(sessionData.start_ayah);
        setStage("listening");
      } catch (err) {
        console.error(err);
        setError(handleApiError(err));
        setStage("error");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  const handleListeningComplete = () => {
    if (!session || currentAyahNumber === null) return;

    if (currentAyahNumber < session.end_ayah) {
      setCurrentAyahNumber(currentAyahNumber + 1);
    } else {
      setStage("testing");
    }
  };

  const handleTestInputChange = (value: string) => {
    setTestState((prev) => ({
      ...prev,
      userInput: value,
      isCorrect: null,
    }));
  };

const handleCheckAnswer = () => {
  if (!currentTestAyah || testState.isChecking) return;

  setTestState((prev) => ({
    ...prev,
    isChecking: true,
  }));

  const correct = isArabicMatch(
    testState.userInput,
    currentTestAyah.text,
  );

  if (correct) {
    if (testState.currentAyahIndex + 1 < testAyahs.length) {
      setTimeout(() => {
        setTestState((prev) => ({
          ...prev,
          currentAyahIndex: prev.currentAyahIndex + 1,
          userInput: "",
          isCorrect: null,
          isChecking: false,
        }));
      }, 300);
    } else {
      setTimeout(() => {
        setTestState((prev) => ({
          ...prev,
          isCorrect: true,
          isChecking: false,
        }));

        setStage("final-test");
      }, 300);
    }
  } else {
    const newHearts = testState.hearts - 1;

    if (newHearts <= 0) {
      setTestState((prev) => ({
        ...prev,
        hearts: 0,
        isCorrect: false,
        isChecking: false,
      }));

      handleHeartsDepleted();
    } else {
      setTestState((prev) => ({
        ...prev,
        hearts: newHearts,
        isCorrect: false,
        isChecking: false,
      }));
    }
  }
};

  const handleHeartsDepleted = async () => {
    try {
      const response = await api.post(`/app/sessions/${id}/hearts-lost`, {
        hearts_lost: testState.hearts,
      });

      const cooldownSeconds = response.data?.cooldown_seconds ?? 300;
      setTestState((prev) => ({
        ...prev,
        cooldownSeconds,
      }));
      setStage("cooldown");
    } catch (err) {
      console.error("Failed to get cooldown:", err);
      setTestState((prev) => ({
        ...prev,
        cooldownSeconds: 300,
      }));
      setStage("cooldown");
    }
  };

  useEffect(() => {
    if (stage !== "cooldown") return;

    const totalSeconds = testState.cooldownSeconds;
    let remaining = totalSeconds;

    setTestState((prev) => ({ ...prev, cooldownTimer: remaining }));

    const timer = setInterval(() => {
      remaining -= 1;
      setTestState((prev) => ({ ...prev, cooldownTimer: remaining }));

      if (remaining <= 0) {
        clearInterval(timer);
        setTestState((prev) => ({
          ...prev,
          hearts: prev.hearts,
          cooldownTimer: 0,
          userInput: "",
          isCorrect: null,
          isChecking: false,
        }));
        setStage("testing");
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [stage, testState.cooldownSeconds]);

  const handleFinalTestInputChange = (ayahNumber: number, value: string) => {
    setFinalTestState((prev) => ({
      ...prev,
      inputs: { ...prev.inputs, [ayahNumber]: value },
      results: { ...prev.results, [ayahNumber]: null },
    }));
  };

  const handleFinalTestSubmit = async () => {
    if (finalTestState.isSubmitting) return;

    setFinalTestState((prev) => ({ ...prev, isSubmitting: true }));

    const results: Record<number, boolean> = {};
    let allCorrect = true;

    for (const ayah of testAyahs) {
      const userInput = finalTestState.inputs[ayah.ayah_number] ?? "";
      const correct = isArabicMatch(userInput, ayah.text);
      results[ayah.ayah_number] = correct;
      if (!correct) allCorrect = false;
    }

    setFinalTestState((prev) => ({
      ...prev,
      results,
      allCorrect,
      isSubmitting: false,
    }));

    if (allCorrect) {
      try {
        await api.post(`/app/sessions/${id}/complete`, {
          score: 100,
          mistakes: 0,
        });
      } catch (err) {
        console.error("Failed to report success:", err);
      }
      setStage("success");
    }
  };

  const handleCloseSuccess = () => {
    router.push("/dashboard");
  };

  if (stage === "loading") return <LoadingStage />;
  if (stage === "error") return <ErrorStage message={error ?? "خطأ"} />;

  if (
    stage === "listening" &&
    session &&
    currentAyah &&
    recitationAyah &&
    audioUrl
  ) {
    return (
           <ListeningStage
        session={session}
        currentAyah={currentAyah}
        recitationAyah={recitationAyah}
        audioUrl={audioUrl}
        repetitions={REPETITIONS_PER_AYAH}
        onComplete={handleListeningComplete}
      />
    );
  }

  if (stage === "testing" && currentTestAyah) {
    return (
      <TestingStage
      id={id as string}
        currentAyah={testAyahs}
      />
    );
  }
  if (stage === "success") {
    return <SuccessStage testState={testState} onClose={handleCloseSuccess} />;
  }

  return (
    <main dir="rtl" className="flex  items-center justify-center px-5">
      <div className="text-neutral-500">جارٍ التحميل...</div>
    </main>
  );
}