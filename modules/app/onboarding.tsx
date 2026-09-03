"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";

import { api, handleApiError } from "@/lib/api";
import { useUser } from "@/contexts/user-context";
import Link from "next/link";

const goals = [
  {
    value: 5,
    title: "5 آيات",
    description: "بداية هادئة وثابتة",
  },
  {
    value: 10,
    title: "10 آيات",
    description: "تقدم متوازن كل يوم",
  },
  {
    value: 20,
    title: "20 آية",
    description: "خطة قوية للحفظ",
  },
  {
    value: 30,
    title: "30 آية",
    description: "تقدم سريع ومنتظم",
  },
];

interface User {
  id: number;
  email: string;
  name: string;
  avatar: string;
  hearts: number;
  streak: number;
  daily_goal: number;
  onboarded: boolean;
  created_at: string;
}

type OnboardingProps ={
  isSettings : boolean;
}

export default function Onboarding({isSettings} : OnboardingProps) {
  const router = useRouter();

  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  const [checkingUser, setCheckingUser] = useState(true);

  const [selectedGoal, setSelectedGoal] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

const { user, loading } = useUser();

    useEffect(() => {
    if (loading) return;

    if (!user) {
        router.replace("/");
        return;
    }

    if (user.onboarded && isSettings == false) {
      router.replace("/app");
      return;
    }

    setCheckingUser(false);
    }, [user, loading, router]);


  useLayoutEffect(() => {
    if (checkingUser || !user || user.onboarded) return;

    const container = containerRef.current;
    const title = titleRef.current;
    const options = optionsRef.current;
    const footer = footerRef.current;

    if (!container || !title || !options || !footer) return;

    const ctx = gsap.context(() => {
      gsap.set(title, {
        opacity: 0,
        y: 40,
      });

      gsap.set(options.children, {
        opacity: 0,
        y: 30,
      });

      gsap.set(footer, {
        opacity: 0,
        y: 20,
      });

      const tl = gsap.timeline({
        defaults: {
          ease: "power3.out",
        },
      });

      tl.to(title, {
        opacity: 1,
        y: 0,
        duration: 0.8,
      })
        .to(
          options.children,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
          },
          "-=0.35",
        )
        .to(
          footer,
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
          },
          "-=0.25",
        );
    }, container);

    return () => ctx.revert();
  }, [checkingUser, user]);

  const selectGoal = (value: number) => {
    if (isSubmitting) return;

    setSelectedGoal(value);
    setError(null);

    const card = document.querySelector(
      `[data-goal="${value}"]`,
    );

    if (!card) return;

    gsap.fromTo(
      card,
      {
        scale: 0.96,
      },
      {
        scale: 1,
        duration: 0.35,
        ease: "back.out(2)",
      },
    );
  };

  const handleSubmit = async () => {
    if (!selectedGoal || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await api.post("/app/user/onboarding", {
        daily_goal: selectedGoal,
      });

      const container = containerRef.current;

      if (container) {
        await gsap.to(container, {
          opacity: 0,
          y: -30,
          duration: 0.5,
          ease: "power3.in",
        });
      }

      router.replace("/app");
    } catch (error) {
      console.error(
        "Failed to complete onboarding:",
        handleApiError(error),
      );

      setError(
        "Unable to save your daily goal. Please try again.",
      );

      setIsSubmitting(false);
    }
  };

 
  if (checkingUser) {
    return null;
  }


  if (!user || (user.onboarded && isSettings === false)) {
    return null;
  }
  return (
    <main
      ref={containerRef}
      className="
        flex
        w-full
        mt-[20vh]
        items-center
        justify-center
        bg-white
        px-6
        text-black
        dark:bg-black
        dark:text-white
      "
    >
      <div className="w-full max-w-3xl">
        <div
          ref={titleRef}
          className="mb-12 text-center"
          dir="rtl"
        >
          <p className="mb-4 text-sm font-medium text-neutral-500 dark:text-neutral-400">
            لنبدأ بخطتك
          </p>

          <h1
            className="
              text-4xl
              font-semibold
              tracking-tight
              sm:text-5xl
              md:text-6xl
            "
          >
            كم آية تريد أن تحفظ يوميًا؟
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-neutral-500 dark:text-neutral-400 sm:text-lg">
            اختر هدفًا تستطيع الالتزام به
          </p>
        </div>

        <div
          ref={optionsRef}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          dir="rtl"
        >
          {goals.map((goal) => {
            const selected = selectedGoal === goal.value;

            return (
              <button
                key={goal.value}
                type="button"
                data-goal={goal.value}
                onClick={() => selectGoal(goal.value)}
                disabled={isSubmitting}
                className={`
                  group
                  relative
                  rounded-2xl
                  border
                  p-6
                  text-right
                  transition-colors
                  duration-200

                  ${
                    selected
                      ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                      : "border-neutral-200 bg-white hover:border-neutral-400 dark:border-neutral-800 dark:bg-black dark:hover:border-neutral-600"
                  }

                  disabled:cursor-not-allowed
                `}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-semibold">
                      {goal.title}
                    </div>

                    <div
                      className={`
                        mt-2 text-sm

                        ${
                          selected
                            ? "text-neutral-300 dark:text-neutral-600"
                            : "text-neutral-500 dark:text-neutral-400"
                        }
                      `}
                    >
                      {goal.description}
                    </div>
                  </div>
                </div>

                {selected && (
                  <div className="absolute left-5 top-5 h-2 w-2 rounded-full bg-white dark:bg-black" />
                )}
              </button>
            );
          })}
        </div>

        <div
          ref={footerRef}
          className="mt-8 flex flex-col items-center"
        >
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedGoal || isSubmitting}
            className="
              w-full
              max-w-sm
              rounded-xl
              bg-black
              px-8
              py-4
              text-base
              font-semibold
              text-white
              transition-all
              hover:bg-neutral-800
              disabled:cursor-not-allowed
              disabled:opacity-30
              dark:bg-white
              dark:text-black
              dark:hover:bg-neutral-200
            "
          >
            {isSubmitting ? "جاري الحفظ..." : "متابعة"}
          </button>


          {isSettings && (
            <Link href={"/app/profile"}>
            
            <p className="mt-10">
              رجوع
            </p>
            </Link>
          )}

          {error && (
            <p
              className="mt-4 text-sm text-red-500"
              dir="rtl"
            >
              {error}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
