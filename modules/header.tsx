"use client";

import Heart from "@/components/ui/heart";
import Fire from "@/components/ui/fire";
import { useUser } from "@/contexts/user-context";
import Link from "next/link";

export default function Header() {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <header className="flex w-full items-center justify-between px-6 py-4">
        <div className="h-10 w-32 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800" />
        
        <div className="h-10 w-40 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800" />
      </header>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <header className="flex w-full items-center justify-between px-6 py-4 fixed top-0 w-full backdrop-blur-xl  z-50">
      <Link href={"/app"}>
        <img
        src="/logo.svg"
        alt="logo"
        width={30}
        height={30}
      />
      </Link>

      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2">
          <Heart size={25} />

          <span className="text-sm font-semibold">
            {user.hearts}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Fire size={25} />

          <span className="text-sm font-semibold">
            {user.streak}
          </span>
        </div>
        <Link href={"/app/profile"}>
          <div className="flex items-center gap-3">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name || "User avatar"}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200 font-semibold dark:bg-neutral-800">
            {user.name?.charAt(0).toUpperCase()}
          </div>
        )}

      
      </div>
        </Link>
            
      </div>
    </header>
  );
}