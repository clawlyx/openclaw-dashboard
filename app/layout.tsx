import type { ReactNode } from "react";
import Script from "next/script";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";

import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display"
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono"
});

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} ${plexMono.variable}`}>
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){
            try {
              var key='oc-dashboard-theme';
              var mode=localStorage.getItem(key) || 'system';
              var resolved = mode === 'system'
                ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
                : mode;
              document.documentElement.dataset.theme = resolved;
            } catch (e) {}
          })();`}
        </Script>
        {children}
      </body>
    </html>
  );
}
