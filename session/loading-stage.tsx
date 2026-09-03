export default function LoadingStage() {
  return (
    <main className="min-h-screen px-5 py-8">
      <div className="mx-auto max-w-5xl animate-pulse">
        <div className="h-6 w-32 rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="mt-10 h-[50vh] rounded-3xl bg-neutral-100 dark:bg-neutral-900" />
      </div>
    </main>
  );
}