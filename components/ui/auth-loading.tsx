import LiquidWaveSpinner from "@/components/ui/loading";

export default function AuthLoading() {
  return (
    <div className="fixed inset-0 z-[9999] flex h-screen w-full flex-col items-center justify-center bg-background">
      <LiquidWaveSpinner />
    </div>
  );
}