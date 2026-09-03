"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useUser } from "@/contexts/user-context";
import { numberToArabic, surahNames } from "@/lib/format";
import api from "@/lib/api";

type Ayah = {
  id: number;
  surah_number: number;
  ayah_number: number;
  verse_key: string;
  words_count: number;
  text: string;
};

type QuranData = Record<string, Ayah>;

type CreatedSession = {
  id: number;
  session_type: string;
  duration: number;
  surah_number: number;
  start_ayah: number;
  end_ayah: number;
  score: number;
  mistakes: number;
  hearts_lost: number;
};

const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL;
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function NewSession() {
  const router = useRouter();

  const { user, loading: userLoading } = useUser();

  const [quran, setQuran] = useState<QuranData | null>(null);
  const [quranLoading, setQuranLoading] = useState(true);
  const [quranError, setQuranError] = useState<string | null>(null);

  const [surahNumber, setSurahNumber] = useState(1);
  const [startAyah, setStartAyah] = useState(1);

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    async function loadQuran() {
      if (!CDN_URL) {
        setQuranError("لم يتم إعداد رابط بيانات القرآن.");
        setQuranLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${CDN_URL}/quran-metadata-ayah.json`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch Quran data");
        }

        const data: QuranData = await response.json();

        setQuran(data);
      } catch (error) {
        console.error(error);
        setQuranError("تعذر تحميل بيانات القرآن.");
      } finally {
        setQuranLoading(false);
      }
    }

    loadQuran();
  }, []);

  const surahAyahs = useMemo(() => {
    if (!quran) return [];

    return Object.values(quran)
      .filter((ayah) => ayah.surah_number === surahNumber)
      .sort((a, b) => a.ayah_number - b.ayah_number);
  }, [quran, surahNumber]);

  const startingAyah = useMemo(() => {
    return surahAyahs.find(
      (ayah) => ayah.ayah_number === startAyah
    );
  }, [surahAyahs, startAyah]);

  const selectedAyahs = useMemo(() => {
    if (!user || !quran || !startingAyah) return [];

    return Object.values(quran)
      .filter((ayah) => ayah.id >= startingAyah.id)
      .sort((a, b) => a.id - b.id)
      .slice(0, user.daily_goal);
  }, [quran, startingAyah, user]);

  const firstSelectedAyah = selectedAyahs[0];

  const lastSelectedAyah =
    selectedAyahs[selectedAyahs.length - 1];

  const startDescription = firstSelectedAyah
    ? `الآية ${numberToArabic(
        firstSelectedAyah.ayah_number
      )} من سورة ${
        surahNames[firstSelectedAyah.surah_number]
      }`
    : null;

  const endDescription = lastSelectedAyah
    ? `الآية ${numberToArabic(
        lastSelectedAyah.ayah_number
      )} من سورة ${
        surahNames[lastSelectedAyah.surah_number]
      }`
    : null;

  async function handleStartSession() {
    if (
      creating ||
      !user ||
      selectedAyahs.length === 0 ||
      !firstSelectedAyah ||
      !lastSelectedAyah
    ) {
      return;
    }

    if (!API_URL) {
      setCreateError("لم يتم إعداد رابط الخادم.");
      return;
    }

    setCreating(true);
    setCreateError(null);

    try {
      const response = await api.post("/app/sessions/", {
        session_type: "memorization",
        duration: 0,
        surah_number: surahNumber,
        start_ayah: firstSelectedAyah.ayah_number,
        end_ayah: lastSelectedAyah.ayah_number,
        score: 0,
        mistakes: 0,
        hearts_lost: 0,
      });

      const session: CreatedSession = response.data.session;

      if (!session?.id) {
        throw new Error("لم يتم إرجاع معرف الجلسة.");
      }

      router.push(`/app/session/${session.id}`);
    } catch (error) {
     console.error(error); 
     setCreateError( error instanceof Error ? error.message : "تعذر إنشاء جلسة الحفظ." ); 
     setCreating(false);
    }

  }

  if (userLoading || quranLoading || !user) {
    return (
      <main className="min-h-screen px-5 py-8">
        <div className="mx-auto max-w-4xl animate-pulse">
          <div className="h-10 w-48 rounded-xl bg-neutral-200 dark:bg-neutral-800" />

          <div className="mt-6 h-64 rounded-3xl bg-neutral-100 dark:bg-neutral-900" />
        </div>
      </main>
    );
  }

  if (quranError) {
    return (
      <main
        dir="rtl"
        className="px-5 py-8 sm:px-8 lg:px-10"
      >
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
            {quranError}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="px-5 py-8 sm:px-8 lg:px-10"
    >
      <div className="mx-auto max-w-4xl space-y-6">
        <header>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            جلسة جديدة
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            ماذا تريد أن تحفظ اليوم؟
          </h1>
        </header>

        <section className="rounded-3xl border border-neutral-200 bg-neutral-50 p-7 dark:border-neutral-800 dark:bg-neutral-950 sm:p-10">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="surah"
                className="mb-2 block text-sm font-medium"
              >
                السورة
              </label>

              <select
                id="surah"
                value={surahNumber}
                onChange={(event) => {
                  setSurahNumber(Number(event.target.value));
                  setStartAyah(1);
                }}
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 outline-none dark:border-neutral-800 dark:bg-black"
              >
                {Array.from({ length: 114 }, (_, index) => {
                  const number = index + 1;

                  return (
                    <option key={number} value={number}>
                      سورة {surahNames[number]}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label
                htmlFor="ayah"
                className="mb-2 block text-sm font-medium"
              >
                أول آية
              </label>

              <select
                id="ayah"
                value={startAyah}
                onChange={(event) =>
                  setStartAyah(Number(event.target.value))
                }
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 outline-none dark:border-neutral-800 dark:bg-black"
              >
                {surahAyahs.map((ayah) => (
                  <option
                    key={ayah.id}
                    value={ayah.ayah_number}
                  >
                    الآية {ayah.ayah_number}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-black">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                هدفك اليومي
              </span>

              <span className="font-semibold">
                {user.daily_goal} آية
              </span>
            </div>

            {firstSelectedAyah && lastSelectedAyah && (
              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    ستبدأ من
                  </p>

                  <p className="mt-1 text-lg font-semibold">
                    {startDescription}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    وتنتهي عند
                  </p>

                  <p className="mt-1 text-lg font-semibold">
                    {endDescription}
                  </p>
                </div>
              </div>
            )}

            <div className="mt-5">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                عدد الآيات
              </p>

              <p className="mt-1 font-semibold">
                {selectedAyahs.length}
              </p>
            </div>
          </div>

          {selectedAyahs.length > 0 && (
            <div className="mt-8">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium">
                  الآيات المحددة
                </p>

                <span className="text-xs text-neutral-400">
                  {selectedAyahs.length} آية
                </span>
              </div>

              <div className="max-h-80 space-y-3 overflow-y-auto rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800">
                {selectedAyahs.map((ayah) => (
                  <div
                    key={ayah.id}
                    className="border-b border-neutral-100 pb-3 last:border-0 last:pb-0 dark:border-neutral-900"
                  >
                    <span className="ml-2 text-xs text-neutral-400">
                      {ayah.verse_key}
                    </span>

                    <span className="font-[QuranCommon] text-2xl leading-[2.5]">
                      {ayah.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {createError && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
              {createError}
            </div>
          )}

          <button
            type="button"
            onClick={handleStartSession}
            disabled={
              creating ||
              selectedAyahs.length === 0
            }
            className="mt-8 w-full rounded-xl bg-black px-7 py-3.5 text-sm font-semibold text-white transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-black"
          >
            {creating ? "جاري إنشاء الجلسة..." : "ابدأ الحفظ"}
          </button>
        </section>
      </div>
    </main>
  );
}
