import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import "./carbon.css";
import "./quiz-v3.css";

export const metadata: Metadata = {
  title: "Solo Studying — Practice & Examination",
  description:
    "Practice academic subjects, prepare with curated examinations, and understand every answer.",
  icons: {
    icon: "/solo-mark.svg",
    shortcut: "/solo-mark.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
