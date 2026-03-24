"use client";

import TimeAgo from "javascript-time-ago";
import { SessionProvider } from "next-auth/react";
import en from "javascript-time-ago/locale/en.json";

TimeAgo.addDefaultLocale(en);

export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
