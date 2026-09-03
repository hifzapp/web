"use client";

import { Button } from "@/components/ui/button";
import gsap from "gsap";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

type Ayah = {
  id: number;
  surah_number: number;
  ayah_number: number;
  verse_key: string;
  words_count: number;
  text: string;
};

type Block = {
  id: number;
  text: string;
};

type WordBlock = {
  id: number;
  words: string[];
};

type ShuffledWord = {
  id: number;
  word: string;
  wordIndex: number;
};

type Result = "success" | "failed" | null;

const normalizeArabic = (text: string) => {
  return text
    .replace(/[\u064B-\u0652]/g, "") 
    .replace(/[أإآ]/g, "ا") 
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ء/g, ""); 
};

export default function TestStage({
  currentAyah,
  id,
}: {
  currentAyah: Ayah[];
  id: string;
}) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [dividedBlocks, setDividedBlocks] = useState<WordBlock[]>([]);
  const [userInput, setUserInput] = useState<ShuffledWord[]>([]);
  const [result, setResult] = useState<Result>(null);
  const [wordInput, setWordInput] = useState("");
  const router = useRouter();
  const inputRefs = useRef<(HTMLDivElement | null)[]>([]);
  const resultRef = useRef<HTMLDivElement>(null);
  const [heartLosts, setHeartLost] = useState(0);
  const [Mistakes, setMistakes] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    setBlocks(
      currentAyah.map((ayah) => ({
        id: ayah.id,
        text: ayah.text,
      }))
    );

    setUserInput([]);
    setResult(null);
    setWordInput("");
  }, [currentAyah]);

  useEffect(() => {
    setDividedBlocks(
      blocks.map((block) => ({
        id: block.id,
        words: block.text.split(" "),
      }))
    );
  }, [blocks]);

  const shuffledWords = useMemo(() => {
    return dividedBlocks
      .flatMap((block) =>
        block.words.map((word, index) => ({
          id: block.id,
          word,
          wordIndex: index,
        }))
      )
      .sort(() => Math.random() - 0.5);
  }, [dividedBlocks]);

  const addUserInput = (word: ShuffledWord) => {
    if (result) return;
    setUserInput((current) => [...current, word]);
  };

  // const Check = async () => {
  //   const correctOrder = dividedBlocks.flatMap((block) =>
  //     block.words.map((_, index) => ({
  //       id: block.id,
  //       wordIndex: index,
  //     }))
  //   );

  //   const isCorrect =
  //     userInput.length === correctOrder.length &&
  //     userInput.every(
  //       (word, index) =>
  //         word.id === correctOrder[index].id &&
  //         word.wordIndex === correctOrder[index].wordIndex
  //     );

  //   const newResult = isCorrect ? "success" : "failed";
  //   setResult(newResult);

  //   if (!isCorrect) {
  //     setMistakes((m) => m + 1);
  //     setHeartLost((h) => h + 1);

  //     setTimeout(() => {
  //       setUserInput([]);
  //       setResult(null);
  //       setWordInput(""); 
  //     }, 2000);

  //     return;
  //   }

  //   try {
  //     await api.post(`/app/sessions/${id}/complete`, {
  //       mistakes: Mistakes,
  //       hearts_lost: heartLosts,
  //     });

  //     setTimeout(() => {
  //       router.push("/app");
  //     }, 2000);
  //   } catch (error) {
  //     console.error("Failed to complete session:", error);
  //   }
  // };

  useEffect(() => {
    if (userInput.length === 0) return;
    const element = inputRefs.current[userInput.length - 1];
    if (!element) return;

    gsap.fromTo(
      element,
      { y: 20, opacity: 0, scale: 0.8 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.45,
        ease: "back.out(1.7)",
      }
    );
  }, [userInput]);

  useEffect(() => {
    if (!result || !resultRef.current) return;

    gsap.fromTo(
      resultRef.current,
      { opacity: 0, y: 20, scale: 0.9 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        ease: "back.out(1.5)",
      }
    );
  }, [result]);

  const removeUserInput = (word: ShuffledWord) => {
    if (result) return;

    const index = userInput.findIndex(
      (item) =>
        item.id === word.id && item.wordIndex === word.wordIndex
    );

    if (index === -1) return;

    const element = inputRefs.current[index];

    if (element) {
      gsap.to(element, {
        y: -10,
        opacity: 0,
        scale: 0.8,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => {
          setUserInput((current) =>
            current.filter(
              (item) =>
                !(item.id === word.id && item.wordIndex === word.wordIndex)
            )
          );
        },
      });
    } else {
      setUserInput((current) =>
        current.filter(
          (item) =>
            !(item.id === word.id && item.wordIndex === word.wordIndex)
        )
      );
    }
  };

  const availableWords = useMemo(() => {
    return shuffledWords.filter((word) => {
      const alreadySelected = userInput.some(
        (selected) =>
          selected.id === word.id && selected.wordIndex === word.wordIndex
      );
      return !alreadySelected;
    });
  }, [shuffledWords, userInput]);

  const filteredWords = useMemo(() => {
    const query = wordInput.trim();
    if (!query) return [];

    const normalizedQuery = normalizeArabic(query);
    if (!normalizedQuery) return [];

    return availableWords.filter((word) => {
      const normalizedWord = normalizeArabic(word.word);
      return normalizedWord.includes(normalizedQuery); 
    });
  }, [availableWords, wordInput]);

  const Check = async () => {
    const correctOrder = dividedBlocks.flatMap((block) =>
      block.words.map((_, index) => ({
        id: block.id,
        wordIndex: index,
      }))
    );

    const isCorrect =
      userInput.length === correctOrder.length &&
      userInput.every(
        (word, index) =>
          word.id === correctOrder[index].id &&
          word.wordIndex === correctOrder[index].wordIndex
      );

    const newResult = isCorrect ? "success" : "failed";
    setResult(newResult);

    if (!isCorrect) {
      setMistakes((m) => m + 1);
      setHeartLost((h) => h + 1);

      setTimeout(() => {
        setUserInput([]);
        setResult(null);
        setWordInput(""); 
      }, 2000);

      return;
    }

    try {
      await api.post(`/app/sessions/${id}/complete`, {
        mistakes: Mistakes,
        hearts_lost: heartLosts,
      });

      setTimeout(() => {
        router.push("/app");
      }, 2000);
    } catch (error) {
      console.error("Failed to complete session:", error);
    }
  };


  if (show) {
    return (
      <div
        dir="rtl"
        className="flex p-3 flex-col items-center justify-center gap-10"
      >
        <div className="w-full max-w-3xl space-y-4">
          <div className="text-center">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              مراجعة الحفظ
            </p>
            <h2 className="mt-2 text-3xl font-semibold">
              راجع ما حفظته قبل الاختبار
            </h2>
          </div>

          <div className="space-y-4">
            {currentAyah.map((ayah) => (
              <div
                key={ayah.id}
                className="
                  group rounded-2xl border
                  border-neutral-200
                  p-6
                  transition-all
                  duration-300
                  hover:border-green-500/50
                  hover:shadow-[0_0_30px_rgba(34,197,94,0.15)]
                  dark:border-neutral-800
                  dark:hover:border-green-500/50
                  dark:hover:shadow-[0_0_30px_rgba(34,197,94,0.12)]
                "
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs text-neutral-400">
                    سورة {ayah.surah_number} — الآية {ayah.ayah_number}
                  </span>
                </div>

                <p
                  className="
                    text-right
                    text-3xl
                    leading-[2.2]
                    transition-all
                    duration-300
                    font-[QuranCommon]
                    group-hover:text-green-500
                    group-hover:drop-shadow-[0_0_8px_rgba(34,197,94,0.35)]
                  "
                >
                  {ayah.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShow(false)}
          className="
            rounded-xl
            bg-black
            px-8
            py-3.5
            text-sm
            font-semibold
            text-white
            transition-all
            duration-300
            hover:scale-[1.02]
            hover:shadow-[0_0_25px_rgba(34,197,94,0.25)]
            active:scale-[0.98]
            dark:bg-white
            dark:text-black
          "
        >
          أنا جاهز للاختبار
        </button>

       
      </div>
    );
  }

  return (
<div className="w-full p-4 lg:w-1/2 mx-auto flex flex-col gap-8">

  <div className="grid grid-cols-1 gap-4">
    <div className="
      relative overflow-hidden
      rounded-2xl
      border border-border/60
      bg-card/60
      backdrop-blur-sm
      p-5
      text-center
      shadow-sm
      
    ">
      <div className="text-sm text-muted-foreground mb-2">
        المحاولات 
      </div>

      <div className="text-3xl font-bold tabular-nums">
        {Mistakes}
      </div>

    </div>

   
  </div>


  <div className="
    relative
    min-h-40
    rounded-3xl
    border border-border/60
    bg-muted/20
    p-6
    shadow-inner
  ">
    <div className="
      absolute
      top-4
      right-5
      text-xs
      text-muted-foreground
      select-none
    ">
      ترتيبك
    </div>

    <div className="
      min-h-28
      flex
      flex-wrap
      items-center
      justify-center
      content-center
      gap-3
      pt-5
    ">
      {userInput.length > 0 ? (
        userInput.map((word, index) => (
          <div
            key={`${word.id}-${word.wordIndex}-${index}`}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            onClick={() => removeUserInput(word)}
            className="
              group
              relative
              rounded-2xl
              border border-border
              bg-background
              px-5
              py-3
              font-[QuranCommon]
              text-4xl
              leading-none
              cursor-pointer
              select-none
              shadow-sm

              transition-all
              duration-200

              hover:-translate-y-1
              hover:border-red-400/60
              hover:bg-red-500/5
              hover:shadow-md

              active:scale-95
            "
          >
            {word.word}

            <span className="
              pointer-events-none
              absolute
              -top-2
              -left-2
              flex
              h-5
              w-5
              items-center
              justify-center
              rounded-full
              bg-red-500
              text-[10px]
              font-sans
              text-white
              opacity-0
              scale-75
              transition-all
              duration-200
              group-hover:opacity-100
              group-hover:scale-100
            ">
              ×
            </span>
          </div>
        ))
      ) : (
        <div className="text-center text-muted-foreground">
          <p className="text-sm">
            اختر الكلمات بالترتيب الصحيح
          </p>
        </div>
      )}
    </div>
  </div>


  {result && (
    <div
      ref={resultRef}
      className={`
        relative
        overflow-hidden
        rounded-3xl
        border
        p-8
        text-center
        shadow-sm
        ${
          result === "success"
            ? "border-green-500/30 bg-green-500/5"
            : "border-red-500/30 bg-red-500/5"
        }
      `}
    >
      <div
        className={`
          mx-auto
          mb-4
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-full
          text-2xl
          ${
            result === "success"
              ? "bg-green-500/10 text-green-600"
              : "bg-red-500/10 text-red-600"
          }
        `}
      >
        {result === "success" ? "✓" : "×"}
      </div>

      <h2 className="text-3xl font-bold tracking-tight">
        {result === "success"
          ? "أحسنت، نجحت"
          : "لم تنجح"}
      </h2>

      <p className="mt-2 text-muted-foreground">
        {result === "success"
          ? "رتبت الآيات بالشكل الصحيح."
          : "الترتيب غير صحيح."}
      </p>

     
    </div>
  )}


  {!result && (
    <Button
      disabled={userInput.length === 0}
      onClick={Check}
      className="
        mx-auto
        h-14
        w-full
        max-w-md
        rounded-2xl
        text-lg
        font-semibold
        shadow-sm
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:shadow-md
        disabled:hover:translate-y-0
      "
    >
      تحقق من الترتيب
    </Button>
  )}


  {!result && (
    <div className="
      w-full
      max-w-3xl
      mx-auto
      rounded-3xl
      border border-border/60
      bg-card/50
      p-5
      shadow-sm
      backdrop-blur-sm
    ">
      <div className="mb-3 px-1 text-right">
        <p className="text-sm font-medium">
          أضف كلمة
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          ابحث عن الكلمة ثم اضغط عليها لإضافتها
        </p>
      </div>

      <div className="relative">
        <input
          type="text"
          value={wordInput}
          onChange={(e) => setWordInput(e.target.value)}
          placeholder="ابحث عن كلمة..."
          dir="rtl"
          autoFocus
          className="
            h-16
            w-full
            rounded-2xl
            border
            border-border
            bg-background
            px-6
            text-center
            font-[QuranCommon]
            text-3xl
            shadow-sm
            outline-none

            transition-all
            duration-200

            placeholder:text-muted-foreground/50

            focus:border-green-500/50
            focus:ring-4
            focus:ring-green-500/10
          "
        />
      </div>


      {wordInput.trim() && (
        <div className="
          mt-4
          max-h-56
          overflow-y-auto
          rounded-2xl
          bg-muted/30
          p-3
        ">
          {filteredWords.length > 0 ? (
            <div className="
              flex
              flex-wrap
              justify-center
              gap-2
            ">
              {filteredWords.map((word) => (
                <div
                  key={`${word.id}-${word.wordIndex}`}
                  onClick={() => {
                    addUserInput(word);
                    setWordInput("");
                  }}
                  className="
                    rounded-xl
                    border border-border/70
                    bg-background
                    px-5
                    py-2.5
                    font-[QuranCommon]
                    text-3xl
                    leading-none
                    cursor-pointer
                    select-none
                    shadow-sm

                    transition-all
                    duration-150

                    hover:-translate-y-0.5
                    hover:border-green-500/50
                    hover:bg-green-500/5
                    hover:shadow-md

                    active:scale-95
                  "
                >
                  {word.word}
                </div>
              ))}
            </div>
          ) : (
            <div className="
              flex
              h-20
              items-center
              justify-center
              text-sm
              text-muted-foreground
            ">
              لا توجد كلمات مطابقة
            </div>
          )}
        </div>
      )}
    </div>
  )}

</div>
  );
}