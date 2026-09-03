import { useRef, useEffect } from "react";
import gsap from "gsap";
import { TestState } from "@/types/types";

interface SuccessStageProps {
  testState: TestState;
  onClose: () => void;
}



export default function SuccessStage({ testState, onClose }: SuccessStageProps) {
  const successContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (successContainerRef.current) {
      gsap.from(successContainerRef.current, {
        opacity: 0,
        scale: 0.6,
        duration: 1,
        ease: "elastic.out(1, 0.4)",
      });
    }
  }, []);

  return (
    <main dir="rtl" className="flex min-h-screen items-center justify-center px-5">
     نجحت 
    </main>
  );
}