"use client";

export function MainContent({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 relative z-20 pointer-events-none">
      {children}
    </main>
  );
}
