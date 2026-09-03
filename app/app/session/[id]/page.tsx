"use client";

import { useParams } from "next/navigation";
import SessionFlow from "@/session/session-flow";

export default function SessionPage() {
  const params = useParams();
  return <SessionFlow sessionId={params.id as string} />;
}