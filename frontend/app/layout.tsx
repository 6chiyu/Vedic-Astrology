import type { Metadata } from "next";

import "./globals.css";
import LanguageProviderWrapper from "@/components/LanguageProviderWrapper";

export const metadata: Metadata = {
  title: "Vedic Light | Vedic Astrology Chart",
  description: "Generate your Vedic birth chart with AI-powered deep insights. Supporting Chinese, English, and Hindi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <body className="min-h-screen flex flex-col">
        <LanguageProviderWrapper>
          <div className="flex-1">
            {children}
          </div>
        </LanguageProviderWrapper>
      </body>
    </html>
  );
}
