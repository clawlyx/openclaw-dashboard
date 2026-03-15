import { formatMessage, getMessages, localeTag, type Locale } from "@/lib/i18n";
import type { CronJobSnapshot, OpenClawSourceKind, UsageSnapshot } from "@/lib/openclaw";

type Messages = ReturnType<typeof getMessages>;

const pickCountLabel = (one: string, other: string, count: number) =>
  formatMessage(count === 1 ? one : other, { count });

export const formatSourceLabel = (
  sourceKind: OpenClawSourceKind,
  sourceLabel: string,
  messages: Messages
) => {
  if (sourceKind === "demo") return messages.data.sourceLabelDemo;
  return sourceLabel;
};

export const formatQuotaSourceLabel = (source: UsageSnapshot["quotaSource"], messages: Messages) => {
  switch (source) {
    case "models":
      return messages.hero.quotaSourceModels;
    case "session-status":
      return messages.hero.quotaSourceSession;
    default:
      return messages.hero.quotaSourceReport;
  }
};

export const formatQuotaHint = (usage: UsageSnapshot, messages: Messages) => {
  const status = usage.oauthStatus || messages.common.unavailable;

  switch (usage.quotaSource) {
    case "models":
      return formatMessage(messages.data.quotaHintModels, { status });
    case "session-status":
      return formatMessage(messages.data.quotaHintSession, { status });
    default:
      return formatMessage(messages.data.quotaHintReport, { status });
  }
};

export const formatQuotaDisplay = (value: string | undefined, messages: Messages) => {
  if (!value) return undefined;

  const normalized = value.replace(/[（]/g, "(").replace(/[）]/g, ")");
  const percentMatch = normalized.match(/(\d+)%/);
  const remainingMatch =
    normalized.match(/(?:剩余约|remaining about|remaining|left)\s*([^)]+)/i) ||
    normalized.match(/%[^0-9A-Za-z]*([0-9]+\s*[dhm].*)$/i);

  if (percentMatch && remainingMatch?.[1]) {
    return formatMessage(messages.data.quotaWithTime, {
      percent: percentMatch[1],
      remaining: remainingMatch[1].trim()
    });
  }

  if (percentMatch) {
    return formatMessage(messages.data.quotaPercentOnly, { percent: percentMatch[1] });
  }

  return value;
};

export const translateDashboardText = (text: string | undefined, messages: Messages) => {
  if (!text) return undefined;

  switch (text) {
    case "No normalized usage history available yet.":
      return messages.data.historyUnavailable;
    case "No usage reports found yet.":
      return messages.data.noUsageReports;
    case "Generate a report first or point OPENCLAW_HOME at a populated install.":
      return messages.data.generateReportHint;
    case "Unable to parse usage reports.":
      return messages.data.unableToParseUsageReports;
    case "Showing bundled demo data because no local OpenClaw home was found.":
      return messages.data.demoFallbackNote;
    case "Usage data comes from markdown reports under workspace/memory/usage.":
      return messages.data.usageReportsNote;
    case "Quota values are refreshed from live `openclaw models` output.":
      return messages.data.quotaLiveModelsNote;
    case "Quota values are refreshed from the latest `session_status` log when `openclaw models` is unavailable.":
      return messages.data.quotaLiveSessionNote;
    case "Quota values currently come from the latest usage report snapshot.":
      return messages.data.quotaSnapshotNote;
    case "Top model breakdown is refreshed from live session JSONL data.":
      return messages.data.liveModelBreakdownNote;
    case "The parser accepts both the newer account-status format and older quota-only report formats.":
      return messages.data.parserCompatibilityNote;
    case "Unable to read usage reports.":
      return messages.data.unableToReadUsageReports;
    case "Unable to read cron jobs.":
      return messages.data.unableToReadCronJobs;
    default:
      break;
  }

  const expectedDirectoryMatch = text.match(/^Expected directory: (.+)$/);
  if (expectedDirectoryMatch) {
    return formatMessage(messages.data.expectedDirectory, { path: expectedDirectoryMatch[1] });
  }

  const normalizedReportsMatch = text.match(/^Normalized (\d+) usage report(s?) for the trend view\.$/);
  if (normalizedReportsMatch) {
    const count = Number(normalizedReportsMatch[1]);
    return pickCountLabel(messages.data.normalizedReportsOne, messages.data.normalizedReportsOther, count);
  }

  const skippedReportsMatch = text.match(/^Skipped (\d+) unreadable report(s?)\.$/);
  if (skippedReportsMatch) {
    const count = Number(skippedReportsMatch[1]);
    return pickCountLabel(messages.data.skippedReportsOne, messages.data.skippedReportsOther, count);
  }

  return text;
};

export const translateDashboardTexts = (texts: string[] | undefined, messages: Messages) =>
  (texts || []).map((text) => translateDashboardText(text, messages) || text);

export const formatReportsWindowLabel = (count: number, messages: Messages) =>
  pickCountLabel(messages.data.reportsWindowOne, messages.data.reportsWindowOther, count);

const translateStatusToken = (value: string, messages: Messages) => {
  switch (value.toLowerCase()) {
    case "ok":
      return messages.data.statusOk;
    case "healthy":
      return messages.data.statusHealthy;
    case "oauth":
      return messages.data.statusOauth;
    case "api":
      return messages.data.statusApi;
    case "failed":
      return messages.data.statusFailed;
    case "not-delivered":
      return messages.data.statusNotDelivered;
    case "error":
      return messages.data.statusError;
    case "never":
      return messages.data.statusNever;
    case "n/a":
      return messages.data.statusNa;
    case "none":
      return messages.data.deliveryNone;
    case "announce":
      return messages.data.deliveryAnnounce;
    default:
      return value;
  }
};

export const formatStatusLabel = (value: string, messages: Messages) => translateStatusToken(value, messages);

export const formatDeliveryLabel = (delivery: string, messages: Messages) => {
  if (!delivery.includes(":")) {
    return translateStatusToken(delivery, messages);
  }

  const [channel, ...rest] = delivery.split(":");
  const localizedChannel = translateStatusToken(channel, messages);
  return `${localizedChannel}:${rest.join(":")}`;
};

export const formatScheduleLabel = (schedule: string, messages: Messages) => {
  if (schedule === "N/A") return messages.common.na;

  const everyMatch = schedule.match(/^every\s+(.+)$/i);
  if (everyMatch) {
    return formatMessage(messages.data.scheduleEvery, { value: everyMatch[1] });
  }

  const timezoneMatch = schedule.match(/^(.*)\s+\(([^)]+)\)$/);
  if (timezoneMatch) {
    const timezone = timezoneMatch[2] === "local" ? messages.data.scheduleLocal : timezoneMatch[2];
    return `${timezoneMatch[1]} (${timezone})`;
  }

  return schedule;
};

export const formatDateTimeLabel = (valueMs: number | undefined, locale: Locale, fallback: string) => {
  if (typeof valueMs !== "number" || Number.isNaN(valueMs)) return fallback;

  return new Intl.DateTimeFormat(localeTag(locale), {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(valueMs));
};

export const formatReportDateLabel = (value: string | undefined, locale: Locale, fallback: string) => {
  if (!value) return fallback;

  return new Intl.DateTimeFormat(localeTag(locale), {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(`${value}T00:00:00`));
};

export const presentCronJob = ({
  job,
  locale,
  messages
}: {
  job: CronJobSnapshot;
  locale: Locale;
  messages: Messages;
}) => ({
  ...job,
  name: job.name || messages.data.unnamedJob,
  schedule: formatScheduleLabel(job.schedule, messages),
  delivery: formatDeliveryLabel(job.delivery, messages),
  lastRunStatus: formatStatusLabel(job.lastRunStatus, messages),
  lastDeliveryStatus: formatStatusLabel(job.lastDeliveryStatus, messages),
  nextRunAt: formatDateTimeLabel(job.nextRunAtMs, locale, messages.common.na),
  lastRunAt: formatDateTimeLabel(job.lastRunAtMs, locale, messages.common.na)
});
