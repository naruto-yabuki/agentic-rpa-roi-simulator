import type { Metadata } from "next";
import "./globals.css";
import { SettingsProvider } from "@/lib/settings-context";

export const metadata: Metadata = {
  title: "Agentic RPA 削減効果シミュレーター",
  description: "株式会社ニューロスフィア Agentic RPA — 一次商談用コスト削減試算ツール",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="font-sans">
        <SettingsProvider>{children}</SettingsProvider>
      </body>
    </html>
  );
}
