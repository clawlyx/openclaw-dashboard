import en from "@/locales/en.json";
import zh from "@/locales/zh.json";

export type Locale = "en" | "zh";

const messages = { en, zh } as const;

export function resolveLocale(raw?: string): Locale {
  return raw === "zh" ? "zh" : "en";
}

export function getMessages(locale: Locale) {
  return messages[locale];
}

export function formatMessage(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce(
    (output, [key, value]) => output.replaceAll(`{${key}}`, String(value)),
    template
  );
}

export function localeTag(locale: Locale) {
  return locale === "zh" ? "zh-CN" : "en-US";
}
