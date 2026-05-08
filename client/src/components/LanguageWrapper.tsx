"use client";
import { LanguageProvider } from "@/lib/useLanguage";

// Client wrapper so LanguageProvider can be used inside the Server Component layout
export default function LanguageWrapper({ children }: { children: React.ReactNode }) {
  return <LanguageProvider>{children}</LanguageProvider>;
}
