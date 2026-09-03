"use client";

import { useEffect, useMemo, useState } from "react";
import { useUser } from "@/contexts/user-context";
import { api, handleApiError } from "@/lib/api";
import Link from "next/link";

interface HifzProgress {
  id: number;
  user_id: number;
  surah_number: number;
  start_ayah: number;
  end_ayah: number;
  mastery_level: number;
  repetitions: number;
  last_reviewed_at?: string | null;
  created_at: string;
  updated_at: string;
}

interface DailyProgress {
  id: number;
  user_id: number;
  date: string;
  new_ayahs_count: number;
  reviewed_count: number;
  goal_target: number;
  is_goal_achieved: boolean;
}

interface HifzSession {
  id: number;
  user_id: number;
  session_type: "memorization" | "review";
  duration: number;
  surah_number: number;
  start_ayah: number;
  is_complete : boolean;
  end_ayah: number;
  score: number;
  mistakes: number;
  hearts_lost: number;
  created_at: string;
  updated_at: string;
}

export default function Dashboard() {
  const { user, loading } = useUser();

  const [progress, setProgress] = useState<HifzProgress[]>([]);
  const [dailyProgress, setDailyProgress] =
    useState<DailyProgress | null>(null);
  const [sessions, setSessions] = useState<HifzSession[]>([]);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      try {
        setLoadingDashboard(true);

        const response = await api.get("/app/dashboard");


        const {
          daily,
          progress,
          sessions,
        } = response.data;

        setProgress(progress ?? []);
        setDailyProgress(
          progress ??
            daily ??
            null,
        );

        setSessions(sessions ?? []);
      } catch (error) {
        console.error(
          "Failed to fetch dashboard data:",
          handleApiError(error),
        );
      } finally {
        setLoadingDashboard(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const todayCompleted = dailyProgress?.new_ayahs_count ?? 0;

  const dailyGoal = user?.daily_goal ?? 0;

  const dailyPercentage =
    dailyGoal > 0
      ? Math.min(Math.round((todayCompleted / dailyGoal) * 100), 100)
      : 0;

const totalMemorizedAyahs = useMemo(() => {
  return sessions
    .filter((session) => session.is_complete)
    .reduce((total, session) => {
      return total + (session.end_ayah - session.start_ayah + 1);
    }, 0);
}, [sessions]);

  const latestProgress = progress[progress.length - 1];

  const currentSurah = latestProgress?.surah_number ?? null;

  const currentStartAyah = latestProgress?.start_ayah ?? null;

  const currentEndAyah = latestProgress?.end_ayah ?? null;

  const hasSessions = sessions.length > 0;

  if (loading || !user || loadingDashboard) {
    return (
      <main className="min-h-screen bg-white px-5 py-8 text-black dark:bg-black dark:text-white">
        <div className="mx-auto max-w-6xl animate-pulse space-y-6">
          <div className="h-8 w-48 rounded-lg bg-neutral-200 dark:bg-neutral-800" />

          <div className="h-72 rounded-3xl bg-neutral-100 dark:bg-neutral-900" />

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-32 rounded-2xl bg-neutral-100 dark:bg-neutral-900"
              />
            ))}
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
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex items-end justify-between">
          <div>
            <p className="mb-2 text-sm text-neutral-500 dark:text-neutral-400">
              {getGreeting()}
            </p>

            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {user.name}
            </h1>
          </div>

          <div className="hidden text-left sm:block">
            <p className="text-xs text-neutral-400">
              هدفك اليومي
            </p>

            <p className="mt-1 text-lg font-semibold">
              {user.daily_goal} آية
            </p>
          </div>
        </header>

        <section className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-50 p-7 dark:border-neutral-800 dark:bg-neutral-950 sm:p-10">
          <div className="relative z-10 max-w-2xl">
            <p className="mb-3 text-2xl font-extrabold">
             تريد حفظ آيات جديدة ؟
            </p>

        <Link href={"/app/session/new"} className="w-full">
            <button
              type="button"
              className="mt-8 rounded-xl bg-black px-7 py-3.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-[0.98] dark:bg-white dark:text-black"
            >
              {todayCompleted > 0
                ? "استكمل الحفظ"
                : "بدأ حصة جديدة"}
            </button>        
        </Link>

          </div>

          <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-neutral-200/50 blur-3xl dark:bg-neutral-800/30" />
        </section>
      </div>

      <div className="mx-auto mt-4 max-w-6xl space-y-6">
        <section className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-50 p-7 dark:border-neutral-800 dark:bg-neutral-950 sm:p-10">
          <div className="relative z-10 ">
            <p className="mb-3 text-sm font-medium text-neutral-500 dark:text-neutral-400">
              الحصص
            </p>

            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              الحصص السابقة
            </h2>

            <p className="mt-3 text-neutral-500 dark:text-neutral-400">
              جميع الحصص التي أنجزتها والحصص السابقة.
            </p>

            <div className="mt-8 w-full">
              {!hasSessions ? (
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  لا توجد حصص حتى الآن
                </p>
              ) : (
                <div className="space-y-3 w-full">
                  {sessions.slice(0, 3).reverse().map((session) => (
                    <Session 
                      key={session.id}
                      session={session}
                    />
                  ))}
                </div>
              )}
            </div>
            <Link href={"/app/session"}>
              <button
                type="button"
                className="mt-8 rounded-xl bg-black px-7 py-3.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-[0.98] dark:bg-white dark:text-black"
              >
                عرض جميع الحصص
              </button>
            
            </Link>
          </div>

          <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-neutral-200/50 blur-3xl dark:bg-neutral-800/30" />
        </section>
      </div>

      <div className="mx-auto mt-4 max-w-6xl">
        <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard
            label="السلسلة"
            value={String(user.streak)}
            suffix="يوم"
          />

          <StatCard
            label="القلوب"
            value={String(user.hearts)}
            suffix=""
          />

          <StatCard
            label="المحفوظ"
            value={String(totalMemorizedAyahs)}
            suffix="آية"
          />

          <StatCard
            label="هدف اليوم"
            value={String(user.daily_goal)}
            suffix="آية"
          />
        </section>
      </div>

    

    </main>
  );
}

function StatCard({
  label,
  value,
  suffix,
}: {
  label: string;
  value: string;
  suffix: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800">
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        {label}
      </p>

      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-2xl font-semibold">
          {value}
        </span>

        {suffix && (
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}


function Session({
  session,
}: {
  session: HifzSession;
}) {
  return (
    <Link href={`/app/session/${session.id}`} className="mb-1 mt-1">
    <div className="flex w-full items-center justify-between rounded-2xl mt-3 mb-3 border border-neutral-200 p-4 dark:border-neutral-800">
      <div>
        <p className="font-medium">
          {session.session_type === "memorization"
            ? "جلسة حفظ"
            : "جلسة مراجعة"}
        </p>

        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          سورة {session.surah_number} — الآيات{" "}
          {session.start_ayah} إلى {session.end_ayah}
        </p>
      </div>

      <div className="text-left">
        <p className="text-sm font-semibold">
          {session.is_complete == true ?  "تم الحفظ": "لم يتم الحفظ" }
        </p>

        <p className="mt-1 text-xs text-neutral-400">
          {formatDate(session.created_at)}
        </p>
      </div>
    </div>
    </Link>
  );
}

function calculateProgress(
  item: HifzProgress,
): number {
  
  return Math.min(
    Math.max(item.mastery_level * 20, 0),
    100,
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("ar-DZ", {
    day: "numeric",
    month: "short",
  }).format(new Date(date));
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "صباح الخير";
  }

  return "مساء الخير";
}