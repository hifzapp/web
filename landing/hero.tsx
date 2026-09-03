"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import GoogleAuthButton from "@/components/ui/google-auth";

export default function Hero() {
  const curtainRef = useRef<HTMLDivElement>(null);
  const wordsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!curtainRef.current || !wordsRef.current) return;

    const words = Array.from(wordsRef.current.children);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      words.forEach((word) => {
        tl.fromTo(
          word,
          {
            y: 50,
            opacity: 0,
            filter: "blur(12px)",
          },
          {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.9,
            ease: "power3.out",
          }
        )
        .to({}, { duration: 0.6 })
        .to(word, {
          y: -50,
          opacity: 0,
          filter: "blur(12px)",
          duration: 0.7,
          ease: "power3.in",
        });
      });

      tl.to(curtainRef.current, {
        yPercent: -100,
        duration: 1.4,
        ease: "power4.inOut",
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <main id="main" className="relative h-screen overflow-hidden">
    <section className="relative z-0 mt-[20vh] w-full">
  <div className="flex h-full flex-col items-center justify-center text-center px-4">
    <span className="mb-4 rounded-full bg-neutral-100 px-4 py-1.5 text-xs font-medium text-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-800">
      رحلتك مع القرآن تبدأ من هنا
    </span>

    <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl md:text-8xl">
      احفظ بثبات، واثبت على وردك.
    </h1>

    <p className="mt-6 max-w-xl text-lg leading-relaxed text-neutral-600 dark:text-neutral-400 sm:text-xl">
      طريقتك اليومية لتثبيت الحفظ، ضبط المتشابهات، وتتبع إتقانك دون تشتيت.
    </p>

    <GoogleAuthButton />
  </div>
</section>

      <div
        ref={curtainRef}
        className="
          fixed
          inset-0
          z-50
          flex
          items-center
          justify-center
          pointer-events-none
          bg-black
          dark:bg-white
        "
      >
        <div
          ref={wordsRef}
          className="
            relative
            flex
            h-32
            w-full
            items-center
            justify-center
            text-center
            text-white
            dark:text-black
          "
        >
          <span className="absolute text-6xl font-extrabold tracking-tight opacity-0 md:text-8xl">
            حفظ
          </span>
          <span className="absolute text-6xl font-extrabold tracking-tight opacity-0 md:text-8xl">
            تثبيت
          </span>
          <span className="absolute text-6xl font-extrabold tracking-tight opacity-0 md:text-8xl">
            إتقان
          </span>
        </div>
      </div>
    </main>
  );
}