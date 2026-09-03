"use client";

import { ModeToggle } from "@/components/ui/mode-toggle";
import { useUser } from "@/contexts/user-context";
import { useRouter } from "next/navigation";

export default function Profile() {
  const { user, loading } = useUser();
  const router = useRouter();

  if (loading) {
    return (
      <main
        dir="rtl"
        className="px-5 py-8 sm:px-8 lg:px-10"
      >
        <div className="mx-auto max-w-4xl space-y-6 animate-pulse">
          <div className="h-8 w-32 rounded-lg bg-neutral-200 dark:bg-neutral-800" />

          <div className="rounded-3xl border border-neutral-200 p-8 dark:border-neutral-800">
            <div className="flex flex-col items-center gap-5 sm:flex-row">
              <div className="h-24 w-24 rounded-full bg-neutral-200 dark:bg-neutral-800" />

              <div className="space-y-3 text-center sm:text-right">
                <div className="h-7 w-40 rounded-lg bg-neutral-200 dark:bg-neutral-800" />
                <div className="h-4 w-56 rounded-lg bg-neutral-200 dark:bg-neutral-800" />
              </div>
            </div>
          </div>

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

  if (!user) {
    return (
      <main
        dir="rtl"
        className="flex min-h-[70vh] items-center justify-center px-5"
      >
        <div className="text-center">
          <h1 className="text-2xl font-semibold">
            تعذر تحميل الملف الشخصي
          </h1>

          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            يرجى تسجيل الدخول والمحاولة مرة أخرى.
          </p>
        </div>
      </main>
    );
  }

  const joinedDate = new Intl.DateTimeFormat("ar-DZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(user.created_at));

  return (
    <main
      dir="rtl"
      className="px-5 py-8 sm:px-8 lg:px-10"
    >
      <div className="mx-auto max-w-4xl space-y-6">

        <header>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            حسابك
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
            الملف الشخصي
          </h1>
        </header>

        <section className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-50 p-7 dark:border-neutral-800 dark:bg-neutral-950 sm:p-10">
          <div className="relative z-10 flex flex-col items-center gap-6 sm:flex-row">

            <div className="relative shrink-0">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-24 w-24 rounded-full border border-neutral-200 object-cover shadow-sm dark:border-neutral-800"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full border border-neutral-200 bg-neutral-100 text-3xl font-semibold dark:border-neutral-800 dark:bg-neutral-900">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="absolute bottom-1 left-1 h-4 w-4 rounded-full border-2 border-white bg-green-500 dark:border-black" />
            </div>

            <div className="min-w-0 flex-1 text-center sm:text-right">
              <h2 className="truncate text-2xl font-semibold">
                {user.name}
              </h2>

              <p className="mt-1 truncate text-sm text-neutral-500 dark:text-neutral-400">
                {user.email}
              </p>

              <p className="mt-3 text-xs text-neutral-400">
                عضو منذ {joinedDate}
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push("/app/plan")}
              className="rounded-xl border border-neutral-200 px-5 py-2.5 text-sm font-medium transition-all hover:border-neutral-400 hover:bg-white dark:border-neutral-800 dark:hover:border-neutral-600 dark:hover:bg-neutral-900"
            >
              تغيير الخطة
            </button>

            <ModeToggle />
          </div>

          <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-neutral-200/50 blur-3xl dark:bg-neutral-800/30" />
        </section>

        <section className="rounded-3xl border border-neutral-200 p-6 dark:border-neutral-800 sm:p-8">

          <div className="mb-6">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              معلومات الحساب
            </p>

            <h2 className="mt-1 text-xl font-semibold">
              معلوماتك
            </h2>
          </div>

          <div className="divide-y divide-neutral-200 dark:divide-neutral-800">

            <InfoRow
              label="الاسم"
              value={user.name}
            />

            <InfoRow
              label="البريد الإلكتروني"
              value={user.email}
            />

            <InfoRow
              label="الهدف اليومي"
              value={`${user.daily_goal} آية`}
            />

            <InfoRow
              label="السلسلة الحالية"
              value={`${user.streak} يوم`}
            />

            <InfoRow
              label="القلوب"
              value={String(user.hearts)}
            />

            <InfoRow
              label="تاريخ الانضمام"
              value={joinedDate}
            />

          </div>
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

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-6 py-4">
      <span className="text-sm text-neutral-500 dark:text-neutral-400">
        {label}
      </span>

      <span className="max-w-[65%] truncate text-sm font-medium">
        {value}
      </span>
    </div>
  );
}
