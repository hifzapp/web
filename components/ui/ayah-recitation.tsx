"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "./button";

type Segment = [number, number, number];

type AyahRecitationProps = {
  text: string;
  segments: Segment[];
  audioUrl: string;
  autoPlay?: boolean;
  onComplete?: () => void;
  className?: string;
};

function splitIntoGroups(
  words: string[],
  maxWords = 4
): string[][] {
  if (words.length === 0) {
    return [];
  }

  if (words.length <= maxWords) {
    return [words];
  }

  const groupsCount = Math.ceil(words.length / maxWords);
  const baseSize = Math.floor(words.length / groupsCount);
  const remainder = words.length % groupsCount;

  const groups: string[][] = [];
  let index = 0;

  for (let i = 0; i < groupsCount; i++) {
    const size = baseSize + (i < remainder ? 1 : 0);

    groups.push(words.slice(index, index + size));

    index += size;
  }

  return groups;
}

export default function AyahRecitation({
  text,
  segments,
  audioUrl,
  autoPlay = true,
  onComplete,
  className = "",
}: AyahRecitationProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const [currentGroup, setCurrentGroup] = useState(0);
  const [currentWord, setCurrentWord] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullAyah, setIsFullAyah] = useState(false);

  const words = useMemo(
    () => text.trim().split(/\s+/),
    [text]
  );

  const groups = useMemo(
    () => splitIntoGroups(words),
    [words]
  );

  const groupRanges = useMemo(() => {
    let start = 0;

    return groups.map((group) => {
      const range = {
        start,
        end: start + group.length - 1,
      };

      start += group.length;

      return range;
    });
  }, [groups]);

  const currentRange = groupRanges[currentGroup];

  const currentGroupStart = currentRange?.start ?? 0;
  const currentGroupEnd = currentRange?.end ?? 0;

  const getGroupStartTime = () => {
    const segment = segments[currentGroupStart];

    if (!segment) {
      return 0;
    }

    return segment[1] / 1000;
  };

  const getGroupEndTime = () => {
    const nextSegment = segments[currentGroupEnd + 1];

    if (nextSegment) {
      return nextSegment[1] / 1000;
    }

    return audioRef.current?.duration ?? Infinity;
  };

  const stopTracking = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const playCurrentGroup = async () => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    setIsFullAyah(false);
    audio.currentTime = getGroupStartTime();

    try {
      await audio.play();
    } catch (error) {
      console.error("Failed to play audio:", error);
      setIsPlaying(false);
    }
  };

  const playFullAyah = async () => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    setIsFullAyah(true);
    audio.currentTime = 0;

    try {
      await audio.play();
    } catch (error) {
      console.error("Failed to play audio:", error);
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    const update = () => {
      if (audio.paused) {
        rafRef.current = null;
        return;
      }

      const currentTimeMs = audio.currentTime * 1000;
      const durationMs = audio.duration * 1000;

      if (!durationMs || Number.isNaN(durationMs)) {
        rafRef.current = requestAnimationFrame(update);
        return;
      }

      let activeSegmentIndex = -1;

      const startIndex = isFullAyah ? 0 : currentGroupStart;
      const endIndex = isFullAyah
        ? segments.length - 1
        : currentGroupEnd;

      for (let i = startIndex; i <= endIndex; i++) {
        const segment = segments[i];

        if (!segment) {
          break;
        }

        const [, start] = segment;

        if (currentTimeMs >= start) {
          activeSegmentIndex = i;
        } else {
          break;
        }
      }

      setCurrentWord(activeSegmentIndex);

      if (!isFullAyah) {
        const groupEndTime = getGroupEndTime();

        if (audio.currentTime >= groupEndTime - 0.03) {
          audio.currentTime = getGroupStartTime();

          if (!audio.paused) {
            rafRef.current = requestAnimationFrame(update);
          }

          return;
        }
      }

      rafRef.current = requestAnimationFrame(update);
    };

    const startTracking = () => {
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(update);
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      startTracking();
    };

    const handlePause = () => {
      setIsPlaying(false);
      stopTracking();
    };

    const handleEnded = () => {
      stopTracking();
      setCurrentWord(-1);
      setIsPlaying(false);

      if (isFullAyah) {
        setIsFullAyah(false);
      }
    };

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    if (!audio.paused) {
      startTracking();
    }

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      stopTracking();
    };
  }, [
    currentGroup,
    currentGroupStart,
    currentGroupEnd,
    segments,
    isFullAyah,
  ]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.pause();
    stopTracking();

    audio.src = audioUrl;
    audio.load();

    setCurrentGroup(0);
    setCurrentWord(-1);
    setIsPlaying(false);
    setIsFullAyah(false);

    if (!autoPlay) {
      return;
    }

    const play = async () => {
      try {
        audio.currentTime = 0;
        await audio.play();
      } catch (error) {
        console.error("Failed to autoplay:", error);
        setIsPlaying(false);
      }
    };

    if (audio.readyState >= 3) {
      play();
    } else {
      audio.addEventListener("canplay", play, {
        once: true,
      });

      return () => {
        audio.removeEventListener("canplay", play);
      };
    }
  }, [audioUrl, autoPlay]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || isFullAyah || !isPlaying) {
      return;
    }

    setCurrentWord(-1);
    playCurrentGroup();
  }, [currentGroup]);

  const nextGroup = () => {
    if (currentGroup >= groups.length - 1) {
      const audio = audioRef.current;

      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }

      stopTracking();
      setIsPlaying(false);
      setCurrentWord(-1);

      onComplete?.();

      return;
    }

    setCurrentGroup((previous) => previous + 1);
  };

  const previousGroup = () => {
    if (currentGroup <= 0) {
      return;
    }

    setCurrentGroup((previous) => previous - 1);
  };

  const togglePlay = async () => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (audio.paused) {
      if (isFullAyah) {
        await playFullAyah();
      } else {
        await playCurrentGroup();
      }
    } else {
      audio.pause();
    }
  };

  return (
    <div
      className={`flex flex-col items-center gap-5 ${className}`}
    >
      <div className="max-w-5xl text-center">
        <div className="font-[QuranCommon] text-4xl leading-[2.3] sm:text-5xl sm:leading-[2.4] lg:text-6xl">
          {words.map((word, index) => {
            const isCurrentGroup =
              index >= currentGroupStart &&
              index <= currentGroupEnd;

            const isActive =
              currentWord === index;

            return (
              <span
                key={`${index}-${word}`}
                className={[
                  "mx-1 inline-block",
                  "transition-all duration-150",
                  isActive
                    ? [
                        "scale-[1.04]",
                        "text-green-500",
                        "drop-shadow-[0_0_18px_rgba(0,0,0,0.35)]",
                        "dark:text-white",
                        "dark:drop-shadow-[0_0_18px_rgba(255,255,255,0.45)]",
                      ].join(" ")
                    : isFullAyah
                      ? "text-neutral-800 dark:text-neutral-200"
                      : isCurrentGroup
                        ? "text-neutral-800 dark:text-neutral-200"
                        : "text-neutral-300 dark:text-neutral-700",
                ].join(" ")}
              >
                {word}
              </span>
            );
          })}
        </div>
      </div>

      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        ياسر الدوسري
      </p>

      <div className="text-sm text-neutral-500 dark:text-neutral-400">
        {isFullAyah ? (
          <span className="font-semibold text-neutral-900 dark:text-white">
            الآية كاملة
          </span>
        ) : (
          <>
            المجموعة{" "}
            <span className="font-semibold text-neutral-900 dark:text-white">
              {groups.length === 0 ? 0 : currentGroup + 1}
            </span>{" "}
            من {groups.length}
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        {!isFullAyah && (
          <>
            <button
              type="button"
              onClick={previousGroup}
              disabled={currentGroup === 0}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-neutral-200 text-neutral-900 transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-30 dark:border-neutral-800 dark:text-white"
            >
              →
            </button>

            <button
              type="button"
              onClick={togglePlay}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-black text-white transition-transform hover:scale-105 active:scale-95 dark:bg-white dark:text-black"
            >
              {isPlaying ? "Ⅱ" : "▶"}
            </button>

            <button
              type="button"
              onClick={nextGroup}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-neutral-200 text-neutral-900 transition hover:scale-105 dark:border-neutral-800 dark:text-white"
            >
              ←
            </button>
          </>
        )}

        {isFullAyah && (
          <button
            type="button"
            onClick={togglePlay}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-black text-white transition-transform hover:scale-105 active:scale-95 dark:bg-white dark:text-black"
          >
            {isPlaying ? "Ⅱ" : "▶"}
          </button>
        )}
      </div>

      <Button
        type="button"
        onClick={playFullAyah}
        className={"p-5 mt-10 w-1/5"}
      >
        الآية كاملة
      </Button>

      <audio ref={audioRef} />
    </div>
  );
}