import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";

import "@/app/globals.css";
import { ThemeProvider } from "@/components/2d/theme-provider";
import { CursorTracker } from "@/components/shelfeye/cursor-tracker";
import { QueryProvider } from "@/components/providers/query-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
});

export const metadata: Metadata = {
  title: "ShelfEye | Retail Intelligence Platform",
  description:
    "ShelfEye helps teams detect stockout risk early and act before revenue is lost.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans`}>
        <QueryProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            <CursorTracker />
            {children}
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
