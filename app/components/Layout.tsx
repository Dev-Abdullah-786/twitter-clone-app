import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-lg mx-auto border-l border-r border-twitterBorder min-h-screen">
      {children}
    </div>
  );
}