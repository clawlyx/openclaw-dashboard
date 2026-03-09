"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import type { ThemeMode } from "@/lib/theme";

type ThemeSwitchProps = {
  label: string;
  lightLabel: string;
  darkLabel: string;
  theme: ThemeMode;
};

export function ThemeSwitch({ label, lightLabel, darkLabel, theme }: ThemeSwitchProps) {
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const [hash, setHash] = useState("");
  const currentQuery = searchParams.toString();
  const currentPath = currentQuery ? `${pathname}?${currentQuery}` : pathname;
  const nextPath = `${currentPath}${hash}`;

  useEffect(() => {
    const syncHash = () => setHash(window.location.hash);
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  return (
    <div className="themeSwitch" aria-label={label}>
      <a
        href={`/api/theme?mode=light&next=${encodeURIComponent(nextPath)}`}
        className={`themeOption ${theme === "light" ? "themeOptionActive" : ""}`}
        aria-label={lightLabel}
        title={lightLabel}
        aria-current={theme === "light" ? "page" : undefined}
      >
        <span className="themeOptionIcon" aria-hidden="true">
          ☀
        </span>
        <span className="themeOptionText">{lightLabel}</span>
      </a>
      <a
        href={`/api/theme?mode=dark&next=${encodeURIComponent(nextPath)}`}
        className={`themeOption ${theme === "dark" ? "themeOptionActive" : ""}`}
        aria-label={darkLabel}
        title={darkLabel}
        aria-current={theme === "dark" ? "page" : undefined}
      >
        <span className="themeOptionIcon" aria-hidden="true">
          ☾
        </span>
        <span className="themeOptionText">{darkLabel}</span>
      </a>
    </div>
  );
}
