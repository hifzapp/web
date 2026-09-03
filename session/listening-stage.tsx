import { surahNames } from "@/lib/format";
import AyahRecitation from "@/components/ui/ayah-recitation";
import { Ayah, RecitationAyah, HifzSession } from "@/types/types";

interface ListeningStageProps {
  session: HifzSession;
  currentAyah: Ayah;
  recitationAyah: RecitationAyah;
  audioUrl: string;
  repetitions: number;
  onComplete: () => void;
}

export default function ListeningStage({
  session,
  currentAyah,
  recitationAyah,
  audioUrl,
  repetitions,
  onComplete,
}: ListeningStageProps) {
  return (
    <main dir="rtl" className="px-5 py-8">
      <div className="mx-auto flex max-w-6xl flex-col">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              سورة {surahNames[currentAyah.surah_number]}
            </p>
            <h1 className="mt-1 text-xl font-semibold">
              الآية {currentAyah.ayah_number}
            </h1>
          </div>
          <div className="text-left text-sm text-neutral-500 dark:text-neutral-400">
            <p className="mt-1">
              الحفظ : {session.start_ayah} - {session.end_ayah} آية
            </p>
            <p className="mt-1">التكرار: {repetitions} مرات</p>
          </div>
        </header>

        <AyahRecitation
          text={currentAyah.text}
          segments={recitationAyah.segments}
          audioUrl={audioUrl}
          onComplete={onComplete}
        />
      </div>
    </main>
  );
}