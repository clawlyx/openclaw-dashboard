import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

type TableRow = Record<string, string>;

export type UsageModelRow = {
  model: string;
  requests: string;
  totalTokens: string;
};

export type UsageSourceShare = {
  source: string;
  share: string;
};

export type UsageHistoryPoint = {
  date: string;
  generatedAt?: string;
  reportPath: string;
  totalRequests: string;
  totalRequestsValue: number;
  totalTokens: string;
  totalTokensValue: number;
  inputTokens?: string;
  inputTokensValue?: number;
  outputTokens?: string;
  outputTokensValue?: number;
  topModel?: string;
  oauthStatus?: string;
  quota5h?: string;
  quota5hValue?: number;
  quota7d?: string;
  quota7dValue?: number;
};

export type UsageHistorySnapshot = {
  available: boolean;
  points: UsageHistoryPoint[];
  reportCount: number;
  rangeStart?: string;
  rangeEnd?: string;
  reportsWindowLabel?: string;
  recentRequestsTotal?: string;
  recentTokensTotal?: string;
  averageRequests?: string;
  averageTokens?: string;
  peakRequestsDate?: string;
  peakRequestsValue?: string;
  peakTokensDate?: string;
  peakTokensValue?: string;
  notes?: string[];
  error?: string;
};

export type UsageSnapshot = {
  available: boolean;
  reportDate?: string;
  generatedAt?: string;
  reportPath?: string;
  totalRequests?: string;
  totalTokens?: string;
  inputTokens?: string;
  outputTokens?: string;
  topModel?: string;
  oauthStatus?: string;
  quota5h?: string;
  quota7d?: string;
  quotaSource?: "report" | "models" | "session-status";
  quotaObservedAt?: string;
  quickSummary?: string[];
  topModelSources?: UsageSourceShare[];
  models?: UsageModelRow[];
  history: UsageHistorySnapshot;
  notes?: string[];
  error?: string;
};

export type CronJobSnapshot = {
  id: string;
  name: string;
  enabled: boolean;
  schedule: string;
  sessionTarget: string;
  delivery: string;
  lastRunStatus: string;
  lastDeliveryStatus: string;
  nextRunAt?: string;
  lastRunAt?: string;
  nextRunAtMs?: number;
  lastRunAtMs?: number;
  consecutiveErrors: number;
};

export type CronSnapshot = {
  available: boolean;
  jobs: CronJobSnapshot[];
  enabledCount: number;
  disabledCount: number;
  attentionCount: number;
  nextJobs: CronJobSnapshot[];
  failingJobs: CronJobSnapshot[];
  path?: string;
  error?: string;
};

export type OpenClawSourceKind = "default" | "custom" | "demo";

export type DashboardSnapshot = {
  generatedAt: string;
  openclawHome: string;
  openclawSourceKind: OpenClawSourceKind;
  openclawSourceLabel: string;
  usage: UsageSnapshot;
  cron: CronSnapshot;
};

type ResolvedOpenClawHome = {
  home: string;
  sourceKind: OpenClawSourceKind;
  sourceLabel: string;
};

type ParsedUsageReport = UsageHistoryPoint & {
  quickSummary: string[];
  topModelSources: UsageSourceShare[];
  models: UsageModelRow[];
};

type LiveQuotaSnapshot = {
  oauthStatus?: string;
  quota5h: string;
  quota5hValue?: number;
  quota7d: string;
  quota7dValue?: number;
  source: "models" | "session-status";
  observedAt?: string;
};

const DEFAULT_OPENCLAW_HOME = path.join(os.homedir(), ".openclaw");
const DEMO_OPENCLAW_HOME = path.join(process.cwd(), "demo", "openclaw-home");
const NUMBER_FORMATTER = new Intl.NumberFormat("en-US");
const execFileAsync = promisify(execFile);
const OPENCLAW_MODELS_TIMEOUT_MS = 2_000;
const MAX_SESSION_LOG_FILES = 24;
const LIVE_MODELS_USAGE_PATTERN =
  /-\s*openai-codex usage:\s*([^ ]+)\s+(\d+)% left\s+⏱([^·\n]+?)\s+·\s+(?:Week|7d)\s+(\d+)% left\s+⏱([^\n]+)/;
const LIVE_STATUS_USAGE_PATTERN =
  /📊 Usage:\s*([^ ]+)\s+(\d+)% left\s+⏱([^·\n]+?)\s+·\s+(?:Week|7d)\s+(\d+)% left\s+⏱([^\n]+)/;
const MODELS_PROFILE_PATTERN = /-\s*([^ ]+)\s+([a-z]+)(?:\s+expires in\s+(.+))?$/i;

const clean = (value: string) => value.trim().replace(/\*\*/g, "");
const expandHomeShortcut = (target: string) => {
  if (target === "~") return os.homedir();
  if (target.startsWith("~/")) return path.join(os.homedir(), target.slice(2));
  if (target.startsWith("$HOME/")) return path.join(os.homedir(), target.slice(6));
  if (target.startsWith("${HOME}/")) return path.join(os.homedir(), target.slice(8));
  return target;
};

const isRelativeInside = (value: string) => value !== ".." && !value.startsWith(`..${path.sep}`) && value !== "";

const formatDisplayPath = (target: string) => {
  const cwdRelative = path.relative(process.cwd(), target);
  if (cwdRelative === "") return ".";
  if (isRelativeInside(cwdRelative)) return cwdRelative.split(path.sep).join("/");

  const homeRelative = path.relative(os.homedir(), target);
  if (target === os.homedir()) return "~";
  if (isRelativeInside(homeRelative)) return `~/${homeRelative.split(path.sep).join("/")}`;

  const segments = target.split(path.sep).filter(Boolean);
  if (segments.length <= 2) return target;
  return `.../${segments.slice(-2).join("/")}`;
};

const normalizeHome = (target: string) => {
  const expandedTarget = expandHomeShortcut(target.trim());
  return path.isAbsolute(expandedTarget)
    ? expandedTarget
    : path.resolve(process.cwd(), expandedTarget);
};

const pathExists = async (target: string) => {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
};

const resolveOpenClawHome = async (): Promise<ResolvedOpenClawHome> => {
  const configuredHome = process.env.OPENCLAW_HOME?.trim();

  if (configuredHome) {
    const normalizedHome = normalizeHome(configuredHome);
    return {
      home: normalizedHome,
      sourceKind: normalizedHome === DEMO_OPENCLAW_HOME ? "demo" : "custom",
      sourceLabel: normalizedHome === DEMO_OPENCLAW_HOME ? "bundled demo" : "OPENCLAW_HOME"
    };
  }

  if (await pathExists(DEFAULT_OPENCLAW_HOME)) {
    return {
      home: DEFAULT_OPENCLAW_HOME,
      sourceKind: "default",
      sourceLabel: "~/.openclaw"
    };
  }

  if (await pathExists(DEMO_OPENCLAW_HOME)) {
    return {
      home: DEMO_OPENCLAW_HOME,
      sourceKind: "demo",
      sourceLabel: "bundled demo"
    };
  }

  return {
    home: DEFAULT_OPENCLAW_HOME,
    sourceKind: "default",
    sourceLabel: "~/.openclaw"
  };
};

const getSectionLines = (lines: string[], heading: string) => {
  const start = lines.findIndex((line) => line.trim() === heading);
  if (start === -1) return [];

  const section: string[] = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (line.startsWith("## ") && line.trim() !== heading) break;
    section.push(line);
  }

  return section;
};

const parseMarkdownTable = (lines: string[], heading: string): TableRow[] => {
  const section = getSectionLines(lines, heading).filter((line) => line.startsWith("|"));
  if (section.length < 2) return [];

  const headers = section[0]
    .split("|")
    .slice(1, -1)
    .map(clean);

  return section
    .slice(1)
    .filter((line) => {
      const firstCell = clean(line.split("|")[1] || "");
      return firstCell && !/^[-]+$/.test(firstCell);
    })
    .map((line) => {
      const values = line
        .split("|")
        .slice(1, -1)
        .map(clean);

      return headers.reduce<TableRow>((row, header, index) => {
        row[header] = values[index] || "";
        return row;
      }, {});
    });
};

const parseBulletSection = (lines: string[], heading: string) =>
  getSectionLines(lines, heading)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.slice(2));

const resolveUsageDirectory = (openclawHome: string) =>
  path.join(openclawHome, "workspace", "memory", "usage");
const resolveCronJobsPath = (openclawHome: string) => path.join(openclawHome, "cron", "jobs.json");

const parseNumber = (value?: string) => {
  if (!value) return undefined;

  const match = clean(value).replace(/,/g, "").match(/-?\d+(?:\.\d+)?/);
  if (!match) return undefined;

  const numeric = Number(match[0]);
  return Number.isFinite(numeric) ? numeric : undefined;
};

const formatNumber = (value: number) => NUMBER_FORMATTER.format(Math.round(value));
const parseTimestampMs = (value?: string) => {
  if (!value) return undefined;

  const timestampMs = Date.parse(value);
  return Number.isFinite(timestampMs) ? timestampMs : undefined;
};

const asObject = (value: unknown) =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : undefined;

const formatQuotaRemaining = (percent: string, remaining: string) => ({
  label: `${percent.trim()}%（剩余约 ${remaining.trim()}）`,
  value: parseNumber(percent)
});

const buildRowLookup = (rows: TableRow[]) =>
  Object.fromEntries(
    rows.map((row) => {
      const key = row.Metric || row["📊 Metric"] || row.Model || row.Provider || row.Source || "";
      return [key, row.Value || row.Today || ""];
    })
  );

const parseLiveQuotaLine = (line: string, source: LiveQuotaSnapshot["source"]) => {
  const match = line.match(source === "models" ? LIVE_MODELS_USAGE_PATTERN : LIVE_STATUS_USAGE_PATTERN);
  if (!match) return null;

  const quota5h = formatQuotaRemaining(match[2], match[3]);
  const quota7d = formatQuotaRemaining(match[4], match[5]);

  return {
    quota5h: quota5h.label,
    quota5hValue: quota5h.value,
    quota7d: quota7d.label,
    quota7dValue: quota7d.value
  };
};

const parseLiveQuotaFromModels = async (
  openclawHome: ResolvedOpenClawHome
): Promise<LiveQuotaSnapshot | null> => {
  try {
    const { stdout } = await execFileAsync("openclaw", ["models"], {
      encoding: "utf8",
      env: {
        ...process.env,
        OPENCLAW_HOME: openclawHome.home
      },
      timeout: OPENCLAW_MODELS_TIMEOUT_MS,
      maxBuffer: 1024 * 1024
    });
    const lines = stdout.split(/\r?\n/);
    const usageLine = lines.find((line) => line.includes("openai-codex usage:"));
    const profileLine = lines.find((line) => /^\s*-\s*openai-codex:/.test(line));
    const quota = usageLine ? parseLiveQuotaLine(usageLine, "models") : null;

    if (!quota) return null;

    const profileMatch = profileLine?.match(MODELS_PROFILE_PATTERN);

    return {
      ...quota,
      oauthStatus: profileMatch?.[1] ? `oauth (${profileMatch[1]})` : undefined,
      source: "models",
      observedAt: new Date().toISOString()
    };
  } catch {
    return null;
  }
};

const getSessionStatusText = (record: unknown) => {
  const entry = asObject(record);
  const message = asObject(entry?.message);

  if (entry?.type !== "message" || message?.role !== "toolResult" || message?.toolName !== "session_status") {
    return undefined;
  }

  const details = asObject(message.details);
  if (typeof details?.statusText === "string") {
    return details.statusText;
  }

  if (!Array.isArray(message.content)) return undefined;

  const textBlock = message.content
    .map((item) => asObject(item))
    .find((item) => item?.type === "text" && typeof item.text === "string");

  return typeof textBlock?.text === "string" ? textBlock.text : undefined;
};

const parseLiveQuotaFromSessionStatusText = ({
  statusText,
  observedAt
}: {
  statusText: string;
  observedAt?: string;
}): LiveQuotaSnapshot | null => {
  const usageLine = statusText
    .split(/\r?\n/)
    .find((line) => line.includes("📊 Usage:"));
  const quota = usageLine ? parseLiveQuotaLine(usageLine, "session-status") : null;

  if (!quota) return null;

  const oauthLine = statusText
    .split(/\r?\n/)
    .find((line) => line.includes("🔑 "));
  const oauthMatch = oauthLine?.match(/🔑\s*([^\n]+)/);

  return {
    ...quota,
    oauthStatus: oauthMatch?.[1]?.trim(),
    source: "session-status",
    observedAt
  };
};

const parseLiveQuotaFromSessionLogs = async (
  openclawHome: ResolvedOpenClawHome
): Promise<LiveQuotaSnapshot | null> => {
  const agentsRoot = path.join(openclawHome.home, "agents");

  try {
    const agentDirectories = await fs.readdir(agentsRoot, { withFileTypes: true });
    const sessionFileGroups = await Promise.all(
      agentDirectories
        .filter((entry) => entry.isDirectory())
        .map(async (entry) => {
          const sessionsDirectory = path.join(agentsRoot, entry.name, "sessions");

          try {
            const sessionEntries = await fs.readdir(sessionsDirectory, { withFileTypes: true });
            return Promise.all(
              sessionEntries
                .filter((sessionEntry) => sessionEntry.isFile() && sessionEntry.name.endsWith(".jsonl"))
                .map(async (sessionEntry) => {
                  const filePath = path.join(sessionsDirectory, sessionEntry.name);
                  const stats = await fs.stat(filePath);

                  return {
                    filePath,
                    mtimeMs: stats.mtimeMs
                  };
                })
            );
          } catch {
            return [];
          }
        })
    );

    const candidateFiles = sessionFileGroups
      .flat()
      .sort((left, right) => right.mtimeMs - left.mtimeMs)
      .slice(0, MAX_SESSION_LOG_FILES);

    let latestQuota:
      | (LiveQuotaSnapshot & {
          observedAtMs?: number;
        })
      | null = null;

    for (const file of candidateFiles) {
      const lines = (await fs.readFile(file.filePath, "utf8")).split(/\r?\n/).filter(Boolean);

      for (let index = lines.length - 1; index >= 0; index -= 1) {
        try {
          const record = JSON.parse(lines[index]) as unknown;
          const statusText = getSessionStatusText(record);

          if (!statusText) continue;

          const observedAt = typeof asObject(record)?.timestamp === "string" ? String(asObject(record)?.timestamp) : undefined;
          const parsedQuota = parseLiveQuotaFromSessionStatusText({
            statusText,
            observedAt
          });

          if (!parsedQuota) continue;

          const observedAtMs = parseTimestampMs(observedAt);
          if (!latestQuota || (observedAtMs || 0) > (latestQuota.observedAtMs || 0)) {
            latestQuota = {
              ...parsedQuota,
              observedAtMs
            };
          }

          break;
        } catch {
          continue;
        }
      }
    }

    if (!latestQuota) return null;

    const { observedAtMs: _observedAtMs, ...quota } = latestQuota;
    return quota;
  } catch {
    return null;
  }
};

const resolveLiveQuota = async (openclawHome: ResolvedOpenClawHome) => {
  const [modelsQuota, sessionLogQuota] = await Promise.all([
    parseLiveQuotaFromModels(openclawHome),
    parseLiveQuotaFromSessionLogs(openclawHome)
  ]);

  return modelsQuota || sessionLogQuota;
};

const shouldUseLiveQuota = ({
  liveQuota,
  latestReport
}: {
  liveQuota: LiveQuotaSnapshot | null;
  latestReport: ParsedUsageReport;
}) => {
  if (!liveQuota) return false;
  if (liveQuota.source === "models") return true;

  if (!latestReport.generatedAt) return true;

  const liveTimestampMs = parseTimestampMs(liveQuota.observedAt);
  const reportTimestampMs = parseTimestampMs(latestReport.generatedAt);

  if (liveTimestampMs === undefined || reportTimestampMs === undefined) return true;
  return liveTimestampMs >= reportTimestampMs;
};

const parseUsageReport = ({
  content,
  reportDate,
  reportPath
}: {
  content: string;
  reportDate: string;
  reportPath: string;
}): ParsedUsageReport => {
  const lines = content.split(/\r?\n/);
  const summaryRows = parseMarkdownTable(lines, "## 📊 Summary");
  const accountRows = parseMarkdownTable(lines, "## 🔐 Account Status");
  const modelRows = parseMarkdownTable(lines, "## 📈 Breakdown by Model");
  const modelSourceRows = parseMarkdownTable(lines, "## 🧭 Model × Source Breakdown");
  const quickSummary = parseBulletSection(lines, "## ⚡ Quick Summary (for embedding)");
  const generatedAt = lines.find((line) => line.startsWith("> 自动生成于 "))?.replace("> 自动生成于 ", "");

  const summaryByMetric = buildRowLookup(summaryRows);
  const accountByMetric = buildRowLookup(accountRows);

  const models = modelRows
    .filter((row) => row.Model && row.Model !== "Total" && !row.Model.startsWith("system/"))
    .map((row) => ({
      model: row.Model,
      requests: row.Requests,
      totalTokens: row.Total
    }))
    .slice(0, 8);

  const topModel = models[0]?.model;
  const topModelSources = topModel
    ? modelSourceRows
        .filter((row) => row.Model === topModel)
        .slice(0, 5)
        .map((row) => ({
          source: row.Source,
          share: row["Share within Model"]
        }))
    : [];

  const totalRequests = summaryByMetric["Total Requests"] || "0";
  const totalTokens = summaryByMetric["Total Tokens"] || "0";
  const inputTokens = summaryByMetric["Input Tokens"];
  const outputTokens = summaryByMetric["Output Tokens"];
  const quota5h = accountByMetric["5h剩余额度"];
  const quota7d = accountByMetric["7d剩余额度"];

  return {
    date: reportDate,
    generatedAt,
    reportPath,
    totalRequests,
    totalRequestsValue: parseNumber(totalRequests) || 0,
    totalTokens,
    totalTokensValue: parseNumber(totalTokens) || 0,
    inputTokens,
    inputTokensValue: parseNumber(inputTokens),
    outputTokens,
    outputTokensValue: parseNumber(outputTokens),
    topModel,
    oauthStatus: accountByMetric["OAuth/token 状态"],
    quota5h,
    quota5hValue: parseNumber(quota5h),
    quota7d,
    quota7dValue: parseNumber(quota7d),
    quickSummary,
    topModelSources,
    models
  };
};

const createHistoryUnavailable = (error: string, notes?: string[]): UsageHistorySnapshot => ({
  available: false,
  points: [],
  reportCount: 0,
  error,
  notes
});

const buildUsageHistory = ({
  reports,
  sourceKind,
  skippedReports
}: {
  reports: ParsedUsageReport[];
  sourceKind: OpenClawSourceKind;
  skippedReports: string[];
}): UsageHistorySnapshot => {
  if (reports.length === 0) {
    return createHistoryUnavailable("No normalized usage history available yet.");
  }

  const recentWindow = reports.slice(-Math.min(7, reports.length));
  const recentRequestsTotal = recentWindow.reduce((sum, report) => sum + report.totalRequestsValue, 0);
  const recentTokensTotal = recentWindow.reduce((sum, report) => sum + report.totalTokensValue, 0);
  const averageRequests = reports.reduce((sum, report) => sum + report.totalRequestsValue, 0) / reports.length;
  const averageTokens = reports.reduce((sum, report) => sum + report.totalTokensValue, 0) / reports.length;
  const peakRequests = reports.reduce((peak, report) =>
    report.totalRequestsValue > peak.totalRequestsValue ? report : peak
  );
  const peakTokens = reports.reduce((peak, report) =>
    report.totalTokensValue > peak.totalTokensValue ? report : peak
  );

  const notes = [
    ...(sourceKind === "demo" ? ["Showing bundled demo data because no local OpenClaw home was found."] : []),
    `Normalized ${reports.length} usage report${reports.length === 1 ? "" : "s"} for the trend view.`,
    ...(skippedReports.length > 0
      ? [`Skipped ${skippedReports.length} unreadable report${skippedReports.length === 1 ? "" : "s"}.`]
      : [])
  ];

  return {
    available: true,
    points: reports,
    reportCount: reports.length,
    rangeStart: reports[0]?.date,
    rangeEnd: reports.at(-1)?.date,
    reportsWindowLabel: `Last ${recentWindow.length} report${recentWindow.length === 1 ? "" : "s"}`,
    recentRequestsTotal: formatNumber(recentRequestsTotal),
    recentTokensTotal: formatNumber(recentTokensTotal),
    averageRequests: formatNumber(averageRequests),
    averageTokens: formatNumber(averageTokens),
    peakRequestsDate: peakRequests.date,
    peakRequestsValue: formatNumber(peakRequests.totalRequestsValue),
    peakTokensDate: peakTokens.date,
    peakTokensValue: formatNumber(peakTokens.totalTokensValue),
    notes
  };
};

const readUsageReports = async (openclawHome: ResolvedOpenClawHome): Promise<UsageSnapshot> => {
  const usageDirectory = resolveUsageDirectory(openclawHome.home);
  const usageDirectoryDisplay = formatDisplayPath(usageDirectory);

  try {
    const entries = await fs.readdir(usageDirectory);
    const reportNames = entries.filter((entry) => /^\d{4}-\d{2}-\d{2}\.md$/.test(entry)).sort();

    if (reportNames.length === 0) {
      return {
        available: false,
        history: createHistoryUnavailable("No usage reports found yet.", [
          "Generate a report first or point OPENCLAW_HOME at a populated install."
        ]),
        error: "No usage reports found yet.",
        notes: ["Generate a report first or point OPENCLAW_HOME at a populated install."]
      };
    }

    const parsedResults = await Promise.all(
      reportNames.map(async (reportName) => {
        const reportPath = path.join(usageDirectory, reportName);

        try {
          const content = await fs.readFile(reportPath, "utf8");
          return {
            ok: true as const,
            report: parseUsageReport({
              content,
              reportDate: reportName.replace(/\.md$/, ""),
              reportPath: formatDisplayPath(reportPath)
            })
          };
        } catch {
          return {
            ok: false as const,
            reportName
          };
        }
      })
    );

    const reports = parsedResults
      .filter((result): result is { ok: true; report: ParsedUsageReport } => result.ok)
      .map((result) => result.report)
      .sort((left, right) => left.date.localeCompare(right.date));
    const skippedReports = parsedResults
      .filter((result): result is { ok: false; reportName: string } => !result.ok)
      .map((result) => result.reportName);

    const history = buildUsageHistory({
      reports,
      sourceKind: openclawHome.sourceKind,
      skippedReports
    });

    const latest = reports.at(-1);

    if (!latest) {
      return {
        available: false,
        history,
        error: "Unable to parse usage reports.",
        notes: [`Expected directory: ${usageDirectoryDisplay}`]
      };
    }

    const liveQuota = await resolveLiveQuota(openclawHome);
    const useLiveQuota = shouldUseLiveQuota({
      liveQuota,
      latestReport: latest
    });
    const resolvedQuota = useLiveQuota ? liveQuota : null;

    return {
      available: true,
      reportDate: latest.date,
      generatedAt: latest.generatedAt,
      reportPath: latest.reportPath,
      totalRequests: latest.totalRequests,
      totalTokens: latest.totalTokens,
      inputTokens: latest.inputTokens,
      outputTokens: latest.outputTokens,
      topModel: latest.topModel,
      oauthStatus: resolvedQuota?.oauthStatus || latest.oauthStatus,
      quota5h: resolvedQuota?.quota5h || latest.quota5h,
      quota7d: resolvedQuota?.quota7d || latest.quota7d,
      quotaSource: resolvedQuota?.source || "report",
      quotaObservedAt: resolvedQuota?.observedAt || latest.generatedAt,
      quickSummary: latest.quickSummary,
      topModelSources: latest.topModelSources,
      models: latest.models,
      history,
      notes: [
        ...(openclawHome.sourceKind === "demo"
          ? ["Showing bundled demo data because no local OpenClaw home was found."]
          : []),
        "Usage data comes from markdown reports under workspace/memory/usage.",
        resolvedQuota?.source === "models"
          ? "Quota values are refreshed from live `openclaw models` output."
          : resolvedQuota?.source === "session-status"
            ? "Quota values are refreshed from the latest `session_status` log when `openclaw models` is unavailable."
            : "Quota values currently come from the latest usage report snapshot.",
        "The parser accepts both the newer account-status format and older quota-only report formats."
      ]
    };
  } catch (error) {
    return {
      available: false,
      history: createHistoryUnavailable(
        error instanceof Error ? error.message : "Unable to read usage reports.",
        [`Expected directory: ${usageDirectoryDisplay}`]
      ),
      error: error instanceof Error ? error.message : "Unable to read usage reports.",
      notes: [`Expected directory: ${usageDirectoryDisplay}`]
    };
  }
};

const formatSchedule = (job: Record<string, unknown>) => {
  const schedule = job.schedule as Record<string, unknown> | undefined;
  if (!schedule) return "N/A";

  const kind = String(schedule.kind || "unknown");
  if (kind === "cron") return `${String(schedule.expr || "N/A")} (${String(schedule.tz || "local")})`;
  if (kind === "interval") return `every ${String(schedule.every || "N/A")}`;

  return kind;
};

const formatDelivery = (job: Record<string, unknown>) => {
  const delivery = job.delivery as Record<string, unknown> | undefined;
  if (!delivery) return "none";

  const channel = String(delivery.channel || "announce");
  const to = String(delivery.to || "").trim();
  return to ? `${channel}:${to}` : channel;
};

const formatTs = (value: unknown) => {
  if (typeof value !== "number" || Number.isNaN(value)) return undefined;

  return new Date(value).toLocaleString("en-US", {
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
};

const readCronJobs = async (openclawHome: ResolvedOpenClawHome): Promise<CronSnapshot> => {
  const jobsPath = resolveCronJobsPath(openclawHome.home);
  const jobsPathDisplay = formatDisplayPath(jobsPath);

  try {
    const raw = JSON.parse(await fs.readFile(jobsPath, "utf8")) as { jobs?: Record<string, unknown>[] };
    const jobs = (raw.jobs || []).map<CronJobSnapshot>((job) => {
      const state = (job.state as Record<string, unknown> | undefined) || {};
      const nextRunAtMs = typeof state.nextRunAtMs === "number" ? state.nextRunAtMs : undefined;
      const lastRunAtMs = typeof state.lastRunAtMs === "number" ? state.lastRunAtMs : undefined;

      return {
        id: String(job.id || ""),
        name: String(job.name || "Unnamed job"),
        enabled: Boolean(job.enabled),
        schedule: formatSchedule(job),
        sessionTarget: String(job.sessionTarget || "N/A"),
        delivery: formatDelivery(job),
        lastRunStatus: String(state.lastRunStatus || state.lastStatus || "never"),
        lastDeliveryStatus: String(state.lastDeliveryStatus || "n/a"),
        nextRunAt: formatTs(nextRunAtMs),
        lastRunAt: formatTs(lastRunAtMs),
        nextRunAtMs,
        lastRunAtMs,
        consecutiveErrors: Number(state.consecutiveErrors || 0)
      };
    });

    const enabledJobs = jobs.filter((job) => job.enabled);
    const failingJobs = jobs.filter(
      (job) =>
        job.enabled &&
        (job.consecutiveErrors > 0 ||
          !["ok", "never"].includes(job.lastRunStatus.toLowerCase()) ||
          ["failed", "not-delivered", "error"].includes(job.lastDeliveryStatus.toLowerCase()))
    );
    const nextJobs = [...enabledJobs]
      .filter((job) => typeof job.nextRunAtMs === "number")
      .sort((left, right) => (left.nextRunAtMs || 0) - (right.nextRunAtMs || 0))
      .slice(0, 8);

    return {
      available: true,
      jobs,
      enabledCount: enabledJobs.length,
      disabledCount: jobs.length - enabledJobs.length,
      attentionCount: failingJobs.length,
      nextJobs,
      failingJobs: failingJobs.slice(0, 8),
      path: jobsPathDisplay
    };
  } catch (error) {
    return {
      available: false,
      jobs: [],
      enabledCount: 0,
      disabledCount: 0,
      attentionCount: 0,
      nextJobs: [],
      failingJobs: [],
      path: jobsPathDisplay,
      error: error instanceof Error ? error.message : "Unable to read cron jobs."
    };
  }
};

export const getDashboardSnapshot = async (): Promise<DashboardSnapshot> => {
  const openclawHome = await resolveOpenClawHome();

  return {
    generatedAt: new Date().toISOString(),
    openclawHome: formatDisplayPath(openclawHome.home),
    openclawSourceKind: openclawHome.sourceKind,
    openclawSourceLabel: openclawHome.sourceLabel,
    usage: await readUsageReports(openclawHome),
    cron: await readCronJobs(openclawHome)
  };
};
