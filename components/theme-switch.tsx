"use client";

import { useEffect, useState } from "react";

const THEME_KEY = "oc-dashboard-theme";

type ThemeMode = "system" | "light" | "dark";

function normalizeTheme(value: string | null): ThemeMode {
  return value === "light" || value === "dark" || value === "system" ? value : "system";
}

function resolveTheme(mode: ThemeMode) {
  if (mode === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return mode;
}

export function ThemeSwitch({
  label,
  options
}: {
  label: string;
  options: Record<ThemeMode, string>;
}) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "system";
    return normalizeTheme(window.localStorage.getItem(THEME_KEY));
  });

  useEffect(() => {
    document.documentElement.dataset.theme = resolveTheme(mode);
    window.localStorage.setItem(THEME_KEY, mode);
  }, [mode]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (normalizeTheme(window.localStorage.getItem(THEME_KEY)) === "system") {
        document.documentElement.dataset.theme = resolveTheme("system");
      }
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return (
    <div className="themeSwitch" aria-label={label}>
      {(["system", "light", "dark"] as const).map((item) => (
        <button
          key={item}
          type="button"
          className={`themeOption ${mode === item ? "themeOptionActive" : ""}`}
          onClick={() => setMode(item)}
        >
          {options[item]}
        </button>
      ))}
    </div>
  );
}
