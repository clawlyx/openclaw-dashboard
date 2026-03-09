export const THEME_COOKIE = "oc-dashboard-theme";

export type ThemeMode = "light" | "dark";

export function resolveTheme(value?: string | null): ThemeMode {
  return value === "dark" ? "dark" : "light";
}

export function sanitizeNextPath(value: string | null) {
  if (!value || !value.startsWith("/")) return "/";
  if (value.startsWith("//")) return "/";
  return value;
}
