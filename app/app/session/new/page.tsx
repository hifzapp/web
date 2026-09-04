"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, ChevronRight, Search } from "lucide-react";

import { useUser } from "@/contexts/user-context";
import { numberToArabic, surahNames } from "@/lib/format";
import api from "@/lib/api";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

  const [step, setStep] = useState(1);

  const [surahNumber, setSurahNumber] = useState(1);
  const [startAyah, setStartAyah] = useState<number | null>(null);

  const [surahDialogOpen, setSurahDialogOpen] = useState(false);
  const [surahSearch, setSurahSearch] = useState("");

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
    if (!startAyah) return undefined;

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

  const filteredSurahs = useMemo(() => {
    const query = surahSearch.trim().toLowerCase();

    if (!query) {
      return Array.from({ length: 114 }, (_, index) => index + 1);
    }

    return Array.from({ length: 114 }, (_, index) => index + 1).filter(
      (number) =>
        surahNames[number]
          ?.toLowerCase()
          .includes(query) ||
        String(number).includes(query)
    );
  }, [surahSearch]);

  const canContinue = () => {
    if (step === 1) return surahNumber > 0;
    if (step === 2) return startAyah !== null;
    return true;
  };

  function handleNext() {
    if (!canContinue()) return;

    setCreateError(null);

    if (step < 3) {
      setStep((current) => current + 1);
    }
  }

  function handleBack() {
    setCreateError(null);

    if (step > 1) {
      setStep((current) => current - 1);
    }
  }

  function handleSelectSurah(number: number) {
    setSurahNumber(number);
    setStartAyah(null);
    setSurahDialogOpen(false);
    setSurahSearch("");
  }

  function handleSelectAyah(ayahNumber: number) {
    setStartAyah(ayahNumber);
  }

  async function handleStartSession() {
    if (
      creating ||
      !user ||
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

      setCreateError(
        error instanceof Error
          ? error.message
          : "تعذر إنشاء جلسة الحفظ."
      );

      setCreating(false);
    }
  }

  if (userLoading || quranLoading || !user) {
    return (
      <main className="min-h-screen px-5 py-8">
        <div className="mx-auto max-w-4xl animate-pulse">
          <div className="h-8 w-32 rounded-xl bg-neutral-200 dark:bg-neutral-800" />

          <div className="mt-8 h-[500px] rounded-[2rem] bg-neutral-100 dark:bg-neutral-900" />
        </div>
      </main>
    );
  }

  if (quranError) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center px-5"
      >
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
          {quranError}
        </div>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="px-5 py-10 sm:px-8 lg:px-10"
    >
      <div className="mx-auto flex max-w-3xl flex-col">

        <div className="mb-12">
          <div className="flex items-center justify-center gap-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  item <= step
                    ? "w-16 bg-black dark:bg-white"
                    : "w-8 bg-neutral-200 dark:bg-neutral-800"
                }`}
              />
            ))}
          </div>

          <p className="mt-4 text-center text-xs text-neutral-400">
            الخطوة {numberToArabic(step)} من {numberToArabic(3)}
          </p>
        </div>


        {step === 1 && (
          <section className="flex flex-1 flex-col">
            <div className="text-center">
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                لنبدأ الحصة
              </p>

              <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                ما السورة التي تريد أن تحفظ منها؟
              </h1>

              <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-neutral-500 dark:text-neutral-400">
                اختر السورة التي تريد أن تبدأ منها اليوم، وسنحدد
                لك بقية الحصة بناءً على هدفك اليومي.
              </p>
            </div>

            <div className="my-auto flex justify-center py-16">
              <Dialog
                open={surahDialogOpen}
                onOpenChange={setSurahDialogOpen}
              >
                <DialogTrigger className={"w-full"} >
                  <button
                    type="button"
                    className="group w-1/2 rounded-[2rem] border border-neutral-200 bg-white p-8 text-right shadow-sm transition-all duration-300 dark:border-neutral-800 dark:bg-neutral-950"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-neutral-400">
                          السورة المختارة
                        </p>

                        <p className="mt-2 text-2xl font-semibold">
                          سورة {surahNames[surahNumber]}
                        </p>

                        <p className="mt-1 text-sm text-neutral-400">
                          السورة {numberToArabic(surahNumber)}
                        </p>
                      </div>

                      
                    </div>
                  </button>
                </DialogTrigger>

                <DialogContent
                  dir="rtl"
                  className="max-w-lg overflow-hidden rounded-[2rem] p-0"
                >
                  <DialogHeader className="px-6 pt-6">
                    <DialogTitle className="text-xl">
                      اختر السورة
                    </DialogTitle>
                  </DialogHeader>

                  <div className="px-6 pb-4">
                    <div className="relative">
                      <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />

                      <Input
                        value={surahSearch}
                        onChange={(event) =>
                          setSurahSearch(event.target.value)
                        }
                        placeholder="ابحث عن سورة..."
                        className="h-11 rounded-xl pr-10"
                      />
                    </div>
                  </div>

                  <div className="max-h-[55vh] overflow-y-auto px-4 pb-5">
                    <div className="grid gap-2 sm:grid-cols-2">
                      {filteredSurahs.map((number) => {
                        const selected =
                          number === surahNumber;

                        return (
                          <button
                            key={number}
                            type="button"
                            onClick={() =>
                              handleSelectSurah(number)
                            }
                            className={`flex items-center justify-between rounded-xl border p-4 text-right transition-all ${
                              selected
                                ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                                : "border-neutral-200 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
                            }`}
                          >
                            <div>
                              <p className="font-medium">
                                سورة {surahNames[number]}
                              </p>

                              <p
                                className={`mt-1 text-xs ${
                                  selected
                                    ? "text-white/60 dark:text-black/60"
                                    : "text-neutral-400"
                                }`}
                              >
                                {numberToArabic(number)}
                              </p>
                            </div>

                            {selected && (
                              <Check className="h-4 w-4" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleNext}
                className="h-12 rounded-xl px-7"
              >
                التالي
                <ChevronLeft className="mr-2 h-4 w-4" />
              </Button>
            </div>
          </section>
        )}


        {step === 2 && (
          <section className="flex flex-1 flex-col">
            <div className="text-center">
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                سورة {surahNames[surahNumber]}
              </p>

              <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                من أي آية تريد أن تبدأ؟
              </h1>

              <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-neutral-500 dark:text-neutral-400">
                اختر الآية التي تريد أن تكون بداية حفظك اليوم.
              </p>
            </div>


            <div className="mt-10 rounded-[1.5rem] border border-neutral-200 bg-neutral-50 p-5 text-center dark:border-neutral-800 dark:bg-neutral-950">
              {firstSelectedAyah && lastSelectedAyah ? (
               <>
  <p className="text-sm text-neutral-500 dark:text-neutral-400">
    ستبدأ الحفظ من
  </p>

  <p className="mt-4 text-2xl font-[QuranCommon] leading-[2.2] font-semibold">
    {firstSelectedAyah.text}
  </p>

  <p className="my-3 text-neutral-300 dark:text-neutral-700">
    إلى
  </p>

  <p className="text-2xl font-[QuranCommon] leading-[2.2] font-semibold">
    {lastSelectedAyah.text}
  </p>

  <p className="mt-4 text-xs text-neutral-400">
    {numberToArabic(selectedAyahs.length)} آية
  </p>
</>
              ) : (
                <>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    اختر آية للبدء
                  </p>

                  <p className="mt-2 font-medium">
                    هدفك اليومي:{" "}
                    {numberToArabic(user.daily_goal)} آية
                  </p>
                </>
              )}
            </div>


            <div className="mt-6 flex-1 overflow-hidden rounded-[2rem] border border-neutral-200 dark:border-neutral-800">
              <div className="max-h-[430px] overflow-y-auto p-3">
                <div className="space-y-2">
                  {surahAyahs.map((ayah) => {
                    const selected =
                      ayah.ayah_number === startAyah;

                    return (
                      <button
                        key={ayah.id}
                        type="button"
                        onClick={() =>
                          handleSelectAyah(
                            ayah.ayah_number
                          )
                        }
                        className={`group w-full rounded-2xl p-5 text-right transition-all duration-200 ${
                          selected
                            ? "bg-black text-white shadow-lg dark:bg-white dark:text-black"
                            : "hover:bg-neutral-50 dark:hover:bg-neutral-900"
                        }`}
                      >
                        <div className="mb-3 flex items-center gap-3">
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium `}
                        
                          >
                            {numberToArabic(
                              ayah.ayah_number
                            )}
                          </span>

                         
                        </div>

                        <p
                          className={`font-[QuranCommon] text-2xl leading-[2.3] ${
                            selected
                              ? "text-white dark:text-black"
                              : "text-neutral-900 dark:text-neutral-100"
                          }`}
                        >
                          {ayah.text}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {createError && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
                {createError}
              </div>
            )}

            <div className="mt-6 flex items-center justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={handleBack}
                className="h-12 rounded-xl px-5"
              >
                <ChevronRight className="ml-2 h-4 w-4" />
                رجوع
              </Button>

              <Button
                onClick={handleNext}
                disabled={!startAyah}
                className="h-12 rounded-xl px-7"
              >
                التالي
                <ChevronLeft className="mr-2 h-4 w-4" />
              </Button>
            </div>
          </section>
        )}


        {step === 3 && (
          <section className="flex flex-1 flex-col">
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950">
                <Check className="h-8 w-8" />
              </div>

              <p className="mt-8 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                كل شيء جاهز
              </p>

              <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                هل أنت مستعد؟
              </h1>

              <p className="mx-auto mt-5 max-w-lg text-sm leading-8 text-neutral-500 dark:text-neutral-400">
                ستبدأ جلسة الحفظ من الآية{" "}
                <span className="font-semibold text-neutral-900 dark:text-white">
                  {firstSelectedAyah
                    ? numberToArabic(
                        firstSelectedAyah.ayah_number
                      )
                    : ""}
                </span>{" "}
                إلى الآية{" "}
                <span className="font-semibold text-neutral-900 dark:text-white">
                  {lastSelectedAyah
                    ? numberToArabic(
                        lastSelectedAyah.ayah_number
                      )
                    : ""}
                </span>{" "}
                من سورة{" "}
                <span className="font-semibold text-neutral-900 dark:text-white">
                  {surahNames[surahNumber]}
                </span>
                .
              </p>

              <div className="mt-10 grid w-full max-w-md grid-cols-2 gap-3">
                <div className="rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800">
                  <p className="text-xs text-neutral-400">
                    السورة
                  </p>

                  <p className="mt-2 font-semibold">
                    {surahNames[surahNumber]}
                  </p>
                </div>

                <div className="rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800">
                  <p className="text-xs text-neutral-400">
                    عدد الآيات
                  </p>

                  <p className="mt-2 font-semibold">
                    {numberToArabic(selectedAyahs.length)}
                  </p>
                </div>
              </div>
            </div>

            {createError && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
                {createError}
              </div>
            )}

            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={handleBack}
                disabled={creating}
                className="h-12 rounded-xl px-5"
              >
                <ChevronRight className="ml-2 h-4 w-4" />
                رجوع
              </Button>

              <Button
                type="button"
                onClick={handleStartSession}
                disabled={
                  creating ||
                  selectedAyahs.length === 0
                }
                className="h-12 rounded-xl px-8"
              >
                {creating
                  ? "جاري تجهيز الحصة..."
                  : "ابدأ الحصة"}
                {!creating && (
                  <ChevronLeft className="mr-2 h-4 w-4" />
                )}
              </Button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}