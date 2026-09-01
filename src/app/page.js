'use client';

/**
 * Innmotek Admin CMS - Root Index Redirect
 * 
 * Automatically routes users to /dashboard if active session exists, else /login.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent-gold border-t-transparent"></div>
        <p className="text-sm uppercase tracking-widest text-neutral-400 font-medium">Loading Control Center...</p>
      </div>
    </div>
  );
}
