import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { THEME_STORAGE_KEY } from "@/lib/theme";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Render Resume",
  description:
    "AI resume builder for developers. Paste your history or upload a PDF, get an ATS-optimized LaTeX resume.",
};

const themeInitScript = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var t=localStorage.getItem(k);var d=t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d){document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark';}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
