interface ErrorStageProps {
  message: string;
}

export default function ErrorStage({ message }: ErrorStageProps) {
  return (
    <main dir="rtl" className="flex min-h-screen items-center justify-center px-5">
      <div className="w-full max-w-lg rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
        {message}
      </div>
    </main>
  );
}