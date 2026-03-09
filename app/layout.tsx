import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";

import "./globals.css";
import { resolveTheme, THEME_COOKIE } from "@/lib/theme";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display"
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono"
});

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const cookieStore = await cookies();
  const theme = resolveTheme(cookieStore.get(THEME_COOKIE)?.value);

  return (
    <html data-theme={theme} suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} ${plexMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
