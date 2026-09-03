"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import api, { handleApiError } from "@/lib/api";
import Link from "next/link";

type HifzSession = {
  id: number;
  user_id: number;
  session_type: "memorization" | "review";
  duration: number;
  surah_number: number;
  start_ayah: number;
  end_ayah: number;
  is_complete: boolean;
  score: number;
  mistakes: number;
  hearts_lost: number;
  created_at: string;
  updated_at: string;
};

type SessionsMeta = {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
};

type SessionsResponse = {
  sessions: HifzSession[];
  meta: SessionsMeta;
};

export default function Sessions() {
  const router = useRouter();

  const [sessions, setSessions] = useState<HifzSession[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const observerRef = useRef<IntersectionObserver | null>(null);

  const hasMore = page < totalPages;

  const fetchSessions = useCallback(
    async (pageToFetch: number) => {
      try {
        if (pageToFetch === 1) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        setError(null);

        const response = await api.get<SessionsResponse>(
          `/app/sessions?page=${pageToFetch}&limit=20`
        );

        const data = response.data;

        setSessions((current) => {
          if (pageToFetch === 1) {
            return data.sessions;
          }

          return [...current, ...data.sessions];
        });

        setPage(data.meta.page);
        setTotalPages(data.meta.total_pages);
      } catch (error) {
        console.error(
          "Failed to fetch sessions:",
          handleApiError(error)
        );

        setError(handleApiError(error));
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchSessions(1);
  }, [fetchSessions]);

  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading || loadingMore || !hasMore) {
        return;
      }

      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            fetchSessions(page + 1);
          }
        },
        {
          rootMargin: "500px",
        }
      );

      if (node) {
        observerRef.current.observe(node);
      }
    },
    [loading, loadingMore, hasMore, page, fetchSessions]
  );

  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  if (loading) {
    return (
      <main
        dir="rtl"
        className="min-h-screen px-5 py-8 sm:px-8 lg:px-10"
      >
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <div className="h-4 w-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />

            <div className="mt-3 h-10 w-48 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800" />
          </div>

          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="h-24 animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-900"
              />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (error && sessions.length === 0) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center px-5"
      >
        <div className="text-center">
          <p className="text-lg font-semibold">
            حدث خطأ أثناء تحميل الحصص
          </p>

          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            {error}
          </p>

          <button
            type="button"
            onClick={() => fetchSessions(1)}
            className="mt-6 rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white dark:bg-white dark:text-black"
          >
            إعادة المحاولة
          </button>
        </div>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen px-5 py-8 sm:px-8 lg:px-10"
    >
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            سجل التعلم
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            جميع الحصص
          </h1>

          <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
            جميع حصص الحفظ والمراجعة التي أنجزتها.
          </p>
        </header>

        {sessions.length === 0 ? (
          <div className="rounded-3xl border border-neutral-200 p-10 text-center dark:border-neutral-800">
            <p className="font-medium">
              لا توجد حصص حتى الآن
            </p>

            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
              ابدأ أول حصة حفظ لتظهر هنا.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  type="button"
                  onClick={() =>
                    router.push(`/app/session/${session.id}`)
                  }
                  className="
                    group
                    flex
                    w-full
                    items-center
                    justify-between
                    rounded-2xl
                    border
                    border-neutral-200
                    p-5
                    text-right
                    transition-all
                    duration-200
                    hover:border-neutral-400
                    hover:shadow-sm
                    dark:border-neutral-800
                    dark:hover:border-neutral-600
                  "
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <h2 className="font-semibold">
                        {session.session_type === "memorization"
                          ? "جلسة حفظ"
                          : "جلسة مراجعة"}
                      </h2>

                      <span
                        className={`
                          rounded-full
                          px-2.5
                          py-1
                          text-xs
                          font-medium
                          ${
                            session.is_complete
                              ? "bg-green-500/10 text-green-600 dark:text-green-400"
                              : "bg-neutral-100 text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400"
                          }
                        `}
                      >
                        {session.is_complete
                          ? "مكتملة"
                          : "غير مكتملة"}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                      سورة {session.surah_number}
                      {" — "}
                      الآيات {session.start_ayah} إلى{" "}
                      {session.end_ayah}
                    </p>

                    <p className="mt-1 text-xs text-neutral-400">
                      {formatDate(session.created_at)}
                    </p>
                  </div>

                  <div className="mr-4 shrink-0 text-left">
                   

                    <p className="mt-1 text-xs text-neutral-400">
                      النتيجة
                    </p>
                  </div>
                </button>
              ))}
            </div>

            <div
              ref={loadMoreRef}
              className="flex min-h-24 items-center justify-center"
            >
              {loadingMore && (
                <div className="flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-black dark:border-neutral-700 dark:border-t-white" />

                  <span>تحميل المزيد...</span>
                </div>
              )}

              {!loadingMore && !hasMore && (
                <Link href={"/app"}>  
                <p className="text-sm text-neutral-400">
                 الرجوع

                </p>
                </Link>
              )}
            </div>

            {error && sessions.length > 0 && (
              <div className="mt-4 text-center">
                <p className="text-sm text-red-500">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => fetchSessions(page + 1)}
                  className="mt-3 text-sm font-medium underline"
                >
                  حاول مرة أخرى
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("ar-DZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}