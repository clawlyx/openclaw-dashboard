import type { Metadata } from "next";
import { cookies } from "next/headers";

import { AgentsOfficePanel } from "@/components/agents-office-panel";
import { AgentsVirtualOfficePanel } from "@/components/agents-virtual-office-panel";
import { LiveRefresh } from "@/components/live-refresh";
import { MissionControlPanel, type MissionControlHandoff } from "@/components/mission-control-panel";
import { SectionShell } from "@/components/section-shell";
import { ProviderLimitWindows } from "@/components/provider-limit-windows";
import { UsageHistoryPanel } from "@/components/usage-history-panel";
import { ThemeSwitch } from "@/components/theme-switch";
import {
  formatDateTimeLabel,
  formatQuotaDisplay,
  formatQuotaSourceLabel,
  formatReportDateLabel,
  formatReportsWindowLabel,
  formatStatusLabel,
  formatSourceLabel,
  presentCronJob,
  translateDashboardText,
  translateDashboardTexts
} from "@/lib/dashboard-presenters";
import { formatMessage, getMessages, localeTag, resolveLocale, type Locale } from "@/lib/i18n";
import { getDashboardSnapshot } from "@/lib/openclaw";
import { resolveTheme, THEME_COOKIE } from "@/lib/theme";

export const dynamic = "force-dynamic";

const DASHBOARD_VIEWS = ["overview", "agents", "mission-control", "history", "usage", "scheduler"] as const;

type DashboardView = (typeof DASHBOARD_VIEWS)[number];
type DashboardPanel =
  | "summary"
  | "providers"
  | "source"
  | "virtual"
  | "floor"
  | "queues"
  | "activity"
  | "missions"
  | "queue"
  | "reviews"
  | "release"
  | "trend"
  | "requests"
  | "tokens"
  | "breakdown"
  | "limits"
  | "models"
  | "health"
  | "jobs"
  | "attention";

const DASHBOARD_PANELS: Record<DashboardView, DashboardPanel[]> = {
  overview: ["summary", "providers", "source"],
  agents: ["virtual", "floor", "queues", "activity"],
  "mission-control": ["missions", "queue", "reviews", "release"],
  history: ["trend", "requests", "tokens"],
  usage: ["breakdown", "limits", "models"],
  scheduler: ["health", "jobs", "attention"]
};

type HomePageProps = {
  searchParams?:
    | Promise<{
        lang?: string;
        view?: string;
        panel?: string;
        missionTask?: string;
        missionFeature?: string;
        missionQueue?: string;
        missionLane?: string;
        missionMapping?: string;
      }>
    | {
        lang?: string;
        view?: string;
        panel?: string;
        missionTask?: string;
        missionFeature?: string;
        missionQueue?: string;
        missionLane?: string;
        missionMapping?: string;
      };
};

const resolveView = (raw?: string): DashboardView =>
  DASHBOARD_VIEWS.includes(raw as DashboardView) ? (raw as DashboardView) : "overview";

const resolvePanel = (view: DashboardView, raw?: string): DashboardPanel =>
  DASHBOARD_PANELS[view].includes(raw as DashboardPanel) ? (raw as DashboardPanel) : DASHBOARD_PANELS[view][0];

const buildHref = (targetLocale: Locale, view?: DashboardView, panel?: DashboardPanel) => {
  const search = new URLSearchParams();

  if (targetLocale === "zh") {
    search.set("lang", "zh");
  }

  if (view && (view !== "overview" || panel)) {
    search.set("view", view);
  }

  if (panel) {
    search.set("panel", panel);
  }

  const query = search.toString();
  return query ? `/?${query}` : "/";
};

const formatCompactValue = (value: number | undefined, locale: Locale, fallback: string) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return fallback;
  }

  return new Intl.NumberFormat(localeTag(locale), {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);
};

const parseOptionalTimestampMs = (value?: string) => {
  if (!value) return undefined;
  const timestampMs = Date.parse(value);
  return Number.isFinite(timestampMs) ? timestampMs : undefined;
};

const formatMissionLaneLabel = (lane: "research" | "build" | "qa" | "release", copy: ReturnType<typeof getMessages>["missionControl"]) => {
  switch (lane) {
    case "research":
      return copy.laneResearch;
    case "build":
      return copy.laneBuild;
    case "qa":
      return copy.laneQa;
    case "release":
      return copy.laneRelease;
  }
};

export async function generateMetadata({ searchParams }: HomePageProps): Promise<Metadata> {
  const params = searchParams ? await searchParams : undefined;
  const locale = resolveLocale(params?.lang);
  const t = getMessages(locale);

  return {
    title: t.meta.title,
    description: t.meta.description
  };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = searchParams ? await searchParams : undefined;
  const locale = resolveLocale(params?.lang);
  const activeView = resolveView(params?.view);
  const activePanel = resolvePanel(activeView, params?.panel);
  const t = getMessages(locale);
  const cookieStore = await cookies();
  const theme = resolveTheme(cookieStore.get(THEME_COOKIE)?.value);

  const snapshot = await getDashboardSnapshot();
  const { usage, cron, agents, missionControl, openclawHome, openclawSourceKind, openclawSourceLabel } = snapshot;
  const missionMutationMode = "local";
  const na = t.common.na;
  const unavailable = t.common.unavailable;

  const localizedSourceLabel = formatSourceLabel(openclawSourceKind, openclawSourceLabel, t);
  const quotaSourceLabel = formatQuotaSourceLabel(usage.quotaSource, t);
  const generatedLabel = formatDateTimeLabel(Date.parse(snapshot.generatedAt), locale, unavailable);
  const reportDateLabel = formatReportDateLabel(usage.reportDate, locale, unavailable);
  const modeLabel =
    openclawSourceKind === "demo"
      ? t.hero.modeDemo
      : openclawSourceKind === "custom"
        ? t.hero.modeCustom
        : t.hero.modeLive;

  const localizedUsage = {
    ...usage,
    oauthStatus: usage.oauthStatus ? formatStatusLabel(usage.oauthStatus, t) : undefined,
    quota5h: formatQuotaDisplay(usage.quota5h, t),
    quota7d: formatQuotaDisplay(usage.quota7d, t),
    providerProfiles: (usage.providerProfiles || []).map((profile) => ({
      ...profile,
      authType: profile.authType ? formatStatusLabel(profile.authType, t) : undefined
    })),
    providerLimits: (usage.providerLimits || []).map((provider) => ({
      ...provider,
      authStatus: provider.authStatus ? formatStatusLabel(provider.authStatus, t) : undefined,
      profileStatus: provider.profileStatus ? formatStatusLabel(provider.profileStatus, t) : undefined,
      windows: provider.windows.map((window) => ({
        ...window,
        remaining: formatQuotaDisplay(window.remaining, t)
      }))
    })),
    error: translateDashboardText(usage.error, t),
    notes: translateDashboardTexts(usage.notes, t),
    history: {
      ...usage.history,
      error: translateDashboardText(usage.history.error, t),
      notes: translateDashboardTexts(usage.history.notes, t),
      reportsWindowLabel: formatReportsWindowLabel(Math.min(7, usage.history.reportCount), t)
    }
  };

  const primaryProviderLimit = localizedUsage.providerLimits[0];
  const providerWindows = (
    primaryProviderLimit?.windows.length
      ? primaryProviderLimit.windows
      : [
          localizedUsage.quota5h
            ? { id: "5h", label: t.stats.window5h, remaining: localizedUsage.quota5h }
            : null,
          localizedUsage.quota7d
            ? { id: "7d", label: t.stats.window7d, remaining: localizedUsage.quota7d }
            : null
        ].filter(
          (
            window
          ): window is {
            id: string;
            label: string;
            remaining: string;
          } => Boolean(window)
        )
  ).map((window) => ({
    id: window.id,
    label: window.label,
    value: window.remaining || na
  }));

  const primaryProviderLabel = primaryProviderLimit?.providerLabel || t.hero.pulseTitle;
  const providerAuthStatus = primaryProviderLimit?.authStatus || localizedUsage.oauthStatus || na;
  const providerRoster = [
    ...localizedUsage.providerProfiles.map((profile) => ({
      ...profile,
      isActive:
        profile.providerId === primaryProviderLimit?.providerId &&
        profile.profileLabel === primaryProviderLimit?.profileLabel
    })),
    ...(!localizedUsage.providerProfiles.some(
      (profile) =>
        profile.providerId === primaryProviderLimit?.providerId &&
        profile.profileLabel === primaryProviderLimit?.profileLabel
    ) &&
    primaryProviderLimit
      ? [
          {
            providerId: primaryProviderLimit.providerId,
            providerLabel: primaryProviderLimit.providerLabel,
            profileLabel: primaryProviderLimit.profileLabel || "",
            authType: providerAuthStatus !== na ? providerAuthStatus : undefined,
            profileExpiresIn: primaryProviderLimit.profileExpiresIn,
            isActive: true
          }
        ]
      : [])
  ].sort((left, right) => Number(Boolean(right.isActive)) - Number(Boolean(left.isActive)));

  const presentJob = (job: (typeof cron.nextJobs)[number]) => presentCronJob({ job, locale, messages: t });
  const nextJobs = cron.nextJobs.map(presentJob);
  const failingJobs = cron.failingJobs.map(presentJob);
  const cronError = translateDashboardText(cron.error, t);
  const nextRunLabel = nextJobs[0]?.nextRunAt || na;
  const lastRunMs = cron.jobs.reduce<number | undefined>((latest, job) => {
    if (typeof job.lastRunAtMs !== "number") return latest;
    if (typeof latest !== "number" || job.lastRunAtMs > latest) return job.lastRunAtMs;
    return latest;
  }, undefined);
  const lastRunLabel = formatDateTimeLabel(lastRunMs, locale, na);
  const statusValue =
    cron.attentionCount > 0
      ? t.hero.statusAttention
      : usage.available && cron.available
        ? t.hero.statusHealthy
        : t.hero.statusPartial;
  const statusHint =
    cron.attentionCount > 0
      ? formatMessage(t.hero.statusAttentionHint, { count: cron.attentionCount })
      : usage.available && cron.available
        ? formatMessage(t.hero.statusNextRunHint, { value: nextRunLabel })
        : t.hero.statusPartialHint;

  const heroSummary = [
    {
      label: t.hero.statusLabel,
      value: statusValue,
      hint: statusHint,
      tone: cron.attentionCount > 0 ? "warning" : "default"
    },
    {
      label: t.history.recentRequests,
      value: localizedUsage.history.recentRequestsTotal || localizedUsage.totalRequests || na,
      hint: localizedUsage.history.reportsWindowLabel || t.stats.latestUsage,
      tone: "default" as const
    },
    {
      label: t.usage.topModel,
      value: localizedUsage.topModel || na,
      hint: formatMessage(t.hero.providerHint, { value: primaryProviderLabel }),
      tone: "default" as const
    }
  ];

  const heroMeta = [
    { label: t.hero.generatedShort, value: generatedLabel },
    { label: t.hero.sourceShort, value: localizedSourceLabel },
    { label: t.hero.usageSourceShort, value: reportDateLabel }
  ];

  const schedulerTotals: Array<{ label: string; value: string; tone?: "default" | "warning" }> = [
    { label: t.scheduler.enabled, value: String(cron.enabledCount) },
    { label: t.scheduler.disabled, value: String(cron.disabledCount) },
    {
      label: t.scheduler.attention,
      value: String(cron.attentionCount),
      tone: cron.attentionCount > 0 ? "warning" : "default"
    }
  ];

  const overviewCopy = formatMessage(t.hero.copy, { home: openclawHome });
  const historyRangeLabel = formatMessage(t.history.range, {
    start: localizedUsage.history.rangeStart || na,
    end: localizedUsage.history.rangeEnd || na
  });
  const agentsUpdatedLabel = formatDateTimeLabel(parseOptionalTimestampMs(agents.updatedAt), locale, na);
  const agentsLatestEventMs = agents.recentEvents
    .map((event) => parseOptionalTimestampMs(event.at))
    .filter((value): value is number => typeof value === "number")
    .sort((left, right) => right - left)[0];
  const agentsLatestEventLabel = formatDateTimeLabel(agentsLatestEventMs, locale, na);
  const agentsOnlineCount = agents.agents.filter((agent) => agent.status !== "offline").length;
  const agentsBlockedCount = agents.agents.filter((agent) => agent.status === "blocked").length;
  const agentsQueueCount = agents.agents.reduce((sum, agent) => sum + (agent.queueCount || 0), 0);
  const agentsRoomCount = agents.rooms.filter((room) => agents.agents.some((agent) => agent.roomId === room.id)).length;
  const missionUpdatedLabel = formatDateTimeLabel(parseOptionalTimestampMs(missionControl.updatedAt), locale, na);
  const missionWorkerLabel = missionControl.worker.connected
    ? t.missionControl.workerConnected
    : t.missionControl.workerDisconnected;
  const missionLatestTaskLabel = missionControl.worker.latestTask
    ? `${missionControl.worker.latestTask.tqId} · ${formatMissionLaneLabel(
        missionControl.worker.latestTask.lane,
        t.missionControl
      )}`
    : t.missionControl.latestTaskFallback;
  const latestHistoryPoint = localizedUsage.history.points.at(-1);
  const latestRequestsLabel = latestHistoryPoint
    ? formatCompactValue(latestHistoryPoint.totalRequestsValue, locale, na)
    : na;
  const latestTokensLabel = latestHistoryPoint
    ? formatCompactValue(latestHistoryPoint.totalTokensValue, locale, na)
    : na;

  const viewItems: Array<{ id: DashboardView; label: string; hint: string }> = [
    { id: "overview", label: t.nav.overview, hint: statusValue },
    { id: "agents", label: t.nav.agents, hint: agentsOnlineCount ? String(agentsOnlineCount) : t.agents.title },
    {
      id: "mission-control",
      label: t.nav.missionControl,
      hint: missionControl.stats.activeFeatures ? String(missionControl.stats.activeFeatures) : t.missionControl.title
    },
    {
      id: "history",
      label: t.nav.history,
      hint: localizedUsage.history.reportsWindowLabel || t.history.title
    },
    { id: "usage", label: t.nav.usage, hint: primaryProviderLabel },
    { id: "scheduler", label: t.nav.scheduler, hint: nextRunLabel }
  ];

  const panelItemsByView: Record<
    DashboardView,
    Array<{ id: DashboardPanel; label: string; hint: string; description: string }>
  > = {
    overview: [
      { id: "summary", label: t.nav.overview, hint: statusValue, description: overviewCopy },
      { id: "providers", label: t.hero.pulseTitle, hint: primaryProviderLabel, description: t.hero.pulseCopy },
      { id: "source", label: t.hero.sourceShort, hint: localizedSourceLabel, description: overviewCopy }
    ],
    agents: [
      {
        id: "virtual",
        label: t.agents.virtualTitle,
        hint: agents.officeName || t.agents.virtualTitle,
        description: t.agents.virtualDescription
      },
      {
        id: "floor",
        label: t.agents.floorTitle,
        hint: agentsOnlineCount ? String(agentsOnlineCount) : na,
        description: t.agents.floorDescription
      },
      {
        id: "queues",
        label: t.agents.queuesTitle,
        hint: String(agentsQueueCount),
        description: t.agents.queuesDescription
      },
      {
        id: "activity",
        label: t.agents.activityTitle,
        hint: agentsLatestEventLabel,
        description: t.agents.activityDescription
      }
    ],
    "mission-control": [
      {
        id: "missions",
        label: t.missionControl.overviewTitle,
        hint: String(missionControl.stats.activeFeatures),
        description: t.missionControl.overviewDescription
      },
      {
        id: "queue",
        label: t.missionControl.queueTitle,
        hint: String(missionControl.stats.openTasks),
        description: t.missionControl.queueDescription
      },
      {
        id: "reviews",
        label: t.missionControl.reviewTitle,
        hint: String(missionControl.stats.reviewTasks),
        description: t.missionControl.reviewDescription
      },
      {
        id: "release",
        label: t.missionControl.releaseTitle,
        hint: String(missionControl.stats.readyToRelease),
        description: t.missionControl.releaseDescription
      }
    ],
    history: [
      {
        id: "trend",
        label: t.history.title,
        hint: localizedUsage.history.reportsWindowLabel || String(localizedUsage.history.reportCount || 0),
        description: t.history.description
      },
      {
        id: "requests",
        label: t.history.requestsPerReport,
        hint: latestRequestsLabel,
        description: t.history.description
      },
      {
        id: "tokens",
        label: t.history.tokensPerReport,
        hint: latestTokensLabel,
        description: t.history.description
      }
    ],
    usage: [
      {
        id: "breakdown",
        label: t.usage.topModelBreakdown,
        hint: localizedUsage.topModel || na,
        description: t.usage.topModelDescription
      },
      {
        id: "limits",
        label: t.usage.limitWindows,
        hint: providerWindows[0]?.value || na,
        description: formatMessage(t.hero.providerHint, { value: primaryProviderLabel })
      },
      {
        id: "models",
        label: t.usage.tableToggle,
        hint: String((localizedUsage.models || []).length),
        description: t.usage.topModelDescription
      }
    ],
    scheduler: [
      { id: "health", label: t.scheduler.title, hint: statusValue, description: t.scheduler.description },
      { id: "jobs", label: t.scheduler.tableJob, hint: String(nextJobs.length), description: t.scheduler.description },
      {
        id: "attention",
        label: t.scheduler.needsAttention,
        hint: String(cron.attentionCount),
        description: t.scheduler.description
      }
    ]
  };

  const contextualSummaryByView: Record<
    DashboardView,
    { label: string; value: string; hint: string; tone?: "default" | "warning" }
  > = {
    overview: {
      label: t.hero.statusLabel,
      value: statusValue,
      hint: statusHint,
      tone: cron.attentionCount > 0 ? "warning" : "default"
    },
    agents: {
      label: t.agents.floorStatus,
      value: agentsBlockedCount > 0 ? t.agents.floorAttention : t.agents.floorHealthy,
      hint: formatMessage(t.agents.floorHint, { count: agentsOnlineCount }),
      tone: agentsBlockedCount > 0 ? "warning" : "default"
    },
    "mission-control": {
      label: t.missionControl.workerStatus,
      value: missionWorkerLabel,
      hint: missionLatestTaskLabel,
      tone: missionControl.stats.blockedTasks > 0 ? "warning" : "default"
    },
    history: {
      label: t.history.title,
      value: String(localizedUsage.history.reportCount || 0),
      hint: historyRangeLabel
    },
    usage: {
      label: t.usage.topModel,
      value: localizedUsage.topModel || na,
      hint: formatMessage(t.hero.providerHint, { value: primaryProviderLabel })
    },
    scheduler: {
      label: t.scheduler.attention,
      value: String(cron.attentionCount),
      hint: cron.available ? formatMessage(t.hero.statusNextRunHint, { value: nextRunLabel }) : cronError || na,
      tone: cron.attentionCount > 0 ? "warning" : "default"
    }
  };

  const contextualFactsByView: Record<DashboardView, Array<{ label: string; value: string }>> = {
    overview: [
      { label: t.hero.generatedShort, value: generatedLabel },
      { label: t.hero.sourceShort, value: localizedSourceLabel },
      { label: t.hero.usageSourceShort, value: reportDateLabel },
      { label: t.hero.lastRun, value: lastRunLabel }
    ],
    agents: [
      { label: t.agents.updated, value: agentsUpdatedLabel },
      { label: t.agents.summaryQueues, value: String(agentsQueueCount) },
      { label: t.agents.summaryRooms, value: String(agentsRoomCount || agents.rooms.length) },
      { label: t.agents.latest, value: agentsLatestEventLabel }
    ],
    "mission-control": [
      { label: t.missionControl.updated, value: missionUpdatedLabel },
      { label: t.missionControl.summaryTasks, value: String(missionControl.stats.openTasks) },
      { label: t.missionControl.summaryReview, value: String(missionControl.stats.reviewTasks) },
      { label: t.missionControl.summaryReady, value: String(missionControl.stats.readyToRelease) }
    ],
    history: [
      { label: t.history.title, value: historyRangeLabel },
      { label: t.history.reports, value: String(localizedUsage.history.reportCount || 0) },
      { label: t.history.recentRequests, value: localizedUsage.history.averageRequests || na },
      { label: t.history.recentTokens, value: localizedUsage.history.averageTokens || na }
    ],
    usage: [
      { label: t.usage.authStatus, value: providerAuthStatus },
      { label: t.usage.activeProvider, value: primaryProviderLabel },
      { label: providerWindows[0]?.label || t.stats.window5h, value: providerWindows[0]?.value || na },
      { label: providerWindows[1]?.label || t.stats.window7d, value: providerWindows[1]?.value || quotaSourceLabel }
    ],
    scheduler: [
      { label: t.scheduler.enabled, value: String(cron.enabledCount) },
      { label: t.scheduler.disabled, value: String(cron.disabledCount) },
      { label: t.hero.lastRun, value: lastRunLabel },
      { label: t.hero.nextRun, value: nextRunLabel }
    ]
  };

  const activeViewItem = viewItems.find((item) => item.id === activeView) || viewItems[0];
  const activePanelItems = panelItemsByView[activeView];
  const activePanelItem = activePanelItems.find((item) => item.id === activePanel) || activePanelItems[0];
  const contextualSummary = contextualSummaryByView[activeView];
  const contextualFacts = contextualFactsByView[activeView];
  const historyFocus = activePanel === "requests" ? "requests" : activePanel === "tokens" ? "tokens" : "all";
  const missionQueue: MissionControlHandoff["queue"] =
    params?.missionQueue === "ready"
      ? "ready"
      : params?.missionQueue === "running"
        ? "running"
        : params?.missionQueue === "review"
          ? "review"
          : params?.missionQueue === "blocked"
            ? "blocked"
            : undefined;
  const missionLane: MissionControlHandoff["lane"] =
    params?.missionLane === "research"
      ? "research"
      : params?.missionLane === "build"
        ? "build"
        : params?.missionLane === "qa"
          ? "qa"
          : params?.missionLane === "release"
            ? "release"
            : undefined;
  const missionMappingState: MissionControlHandoff["mapping"] =
    params?.missionMapping === "exact"
      ? "exact"
      : params?.missionMapping === "partial"
        ? "partial"
        : params?.missionMapping === "unavailable"
          ? "unavailable"
          : undefined;
  const missionHandoff: MissionControlHandoff = {
    taskId: params?.missionTask?.trim() || undefined,
    featureId: params?.missionFeature?.trim() || undefined,
    queue: missionQueue,
    lane: missionLane,
    mapping: missionMappingState
  };

  const providerRosterContent = providerRoster.length ? (
    <div className="providerRoster" aria-label={t.hero.providerMetaLabel}>
      {providerRoster.map((profile) => {
        const rowBadges = [
          profile.profileLabel
            ? { id: "profile", label: t.hero.providerMetaProfile, value: profile.profileLabel }
            : null,
          profile.authType
            ? { id: "auth", label: t.hero.providerMetaAuth, value: profile.authType }
            : profile.isActive && providerAuthStatus !== na
              ? { id: "auth-fallback", label: t.hero.providerMetaAuth, value: providerAuthStatus }
              : null,
          profile.isActive && primaryProviderLimit?.profileStatus
            ? { id: "status", label: t.hero.providerMetaStatus, value: primaryProviderLimit.profileStatus }
            : null,
          profile.profileExpiresIn
            ? { id: "expiry", label: t.hero.providerMetaExpiry, value: profile.profileExpiresIn }
            : null
        ].filter((badge): badge is { id: string; label: string; value: string } => Boolean(badge));

        return (
          <article
            key={`${profile.providerId}:${profile.profileLabel}`}
            className={`providerProfileRow ${profile.isActive ? "providerProfileRowActive" : ""}`}
          >
            <div className="providerProfileHead">
              <strong className="providerProfileName">{profile.providerLabel}</strong>
              {profile.isActive ? <span className="providerProfileState">{t.hero.providerActive}</span> : null}
            </div>

            {rowBadges.length ? (
              <div className="providerMetaRow">
                {rowBadges.map((badge) => (
                  <span key={`${profile.providerId}:${badge.id}`} className="providerMetaBadge">
                    <span className="providerMetaBadgeKey">{badge.label}</span>
                    <span className="providerMetaBadgeValue">{badge.value}</span>
                  </span>
                ))}
              </div>
            ) : null}

            {profile.isActive && providerWindows.length ? (
              <div className="providerWindowsInline">
                <ProviderLimitWindows windows={providerWindows} variant="compact" />
              </div>
            ) : null}

            {profile.freeQuota ? (
              <div className="providerProfilePanel">
                <span className="providerProfilePanelLabel">{t.hero.providerFreeQuota}</span>
                <div className="providerProfileFacts">
                  <div className="providerProfileFact">
                    <span className="providerProfileFactKey">{t.hero.providerFreeRemaining}</span>
                    <strong className="providerProfileFactValue">
                      {profile.freeQuota.remainingRequests || na}
                      {profile.freeQuota.configuredRequests ? ` / ${profile.freeQuota.configuredRequests}` : ""}
                    </strong>
                  </div>
                  <div className="providerProfileFact">
                    <span className="providerProfileFactKey">{t.hero.providerFreeUsage}</span>
                    <strong className="providerProfileFactValue">
                      {profile.freeQuota.usageRequests || profile.freeQuota.usedRequests || na}
                      {profile.freeQuota.usageRequests || profile.freeQuota.usedRequests
                        ? ` ${t.hero.providerRequestsShort}`
                        : ""}
                      {profile.freeQuota.usageTokens
                        ? ` · ${profile.freeQuota.usageTokens} ${t.hero.providerTokensShort}`
                        : profile.freeQuota.usedShare
                          ? ` · ${profile.freeQuota.usedShare}`
                          : ""}
                    </strong>
                  </div>
                </div>
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  ) : (
    <div className="emptyState">
      <p>{na}</p>
    </div>
  );

  const renderUsageUnavailable = () => (
    <div className="emptyState">
      <p>{localizedUsage.error}</p>
      {(localizedUsage.notes || []).map((note) => (
        <p key={note}>{note}</p>
      ))}
    </div>
  );

  const renderSchedulerUnavailable = () => (
    <div className="emptyState">
      <p>{cronError}</p>
      <p>
        <code>{cron.path}</code>
      </p>
    </div>
  );

  const renderActiveContent = () => {
    if (activeView === "overview") {
      if (activePanel === "providers") {
        return (
          <SectionShell
            id="overview"
            eyebrow={t.hero.pulseEyebrow}
            title={t.hero.pulseTitle}
            description={t.hero.pulseCopy}
          >
            <article className="signalCard signalCardQuota">
              {providerRosterContent}
              <p className="signalCardCopy">{formatMessage(t.hero.pulseFooter, { value: quotaSourceLabel })}</p>
            </article>
          </SectionShell>
        );
      }

      if (activePanel === "source") {
        const sourceFacts = [
          ...heroMeta,
          { label: t.hero.lastRun, value: lastRunLabel },
          { label: t.hero.nextRun, value: nextRunLabel },
          { label: t.hero.statusLabel, value: statusValue },
          { label: t.hero.generatedShort, value: modeLabel }
        ];

        return (
          <SectionShell id="overview" eyebrow={t.nav.overview} title={t.hero.title} description={overviewCopy}>
            <div className="miniSummaryGrid">
              {sourceFacts.map((item) => (
                <article key={item.label} className="miniSummaryCard">
                  <span className="miniSummaryLabel">{item.label}</span>
                  <strong className="miniSummaryValue miniSummaryValueCompact">{item.value}</strong>
                </article>
              ))}
            </div>

            <div className="infoBox">
              <p>
                <code>{openclawHome}</code>
              </p>
            </div>
          </SectionShell>
        );
      }

      return (
        <section id="overview" className="hero heroSingle">
          <div className="heroMain">
            <p className="eyebrow">{t.hero.eyebrow}</p>
            <h1>{t.hero.title}</h1>
            <p className="heroCopy">{overviewCopy}</p>

            <div className="heroSummary" aria-label={t.nav.overview}>
              {heroSummary.map((item) => (
                <article
                  key={item.label}
                  className={`heroSummaryCard ${item.tone === "warning" ? "heroSummaryCardWarning" : ""}`}
                >
                  <span className="heroSummaryLabel">{item.label}</span>
                  <strong className="heroSummaryValue">{item.value}</strong>
                  <span className="heroSummaryHint">{item.hint}</span>
                </article>
              ))}
              <article className="heroSummaryCard heroSummaryCardPair">
                <span className="heroSummaryLabel">{t.hero.runWindowLabel}</span>
                <div className="heroSummaryPair">
                  <div className="heroSummaryPairRow">
                    <span className="heroSummaryPairKey">{t.hero.lastRun}</span>
                    <strong className="heroSummaryPairValue">{lastRunLabel}</strong>
                  </div>
                  <div className="heroSummaryPairRow">
                    <span className="heroSummaryPairKey">{t.hero.nextRun}</span>
                    <strong className="heroSummaryPairValue">{nextRunLabel}</strong>
                  </div>
                </div>
              </article>
            </div>

            <div className="heroMetaRow" aria-label={t.nav.overview}>
              {heroMeta.map((item) => (
                <span key={item.label} className="heroMetaItem">
                  <span className="heroMetaKey">{item.label}</span>
                  <strong className="heroMetaText">{item.value}</strong>
                </span>
              ))}
            </div>

            <div className="infoBox">
              <p>
                <code>{openclawHome}</code>
              </p>
            </div>
          </div>
        </section>
      );
    }

    if (activeView === "agents") {
      if (activePanel === "virtual") {
        return (
          <AgentsVirtualOfficePanel
            id="agents"
            agents={agents}
            missionControl={missionControl}
            pressure={snapshot.pressure}
            locale={locale}
            copy={t.agents}
            common={t.common}
            actionCopy={t.missionControl}
            mutationMode={missionMutationMode}
          />
        );
      }

      const agentsFocus = activePanel === "queues" ? "queues" : activePanel === "activity" ? "activity" : "floor";

      return (
        <AgentsOfficePanel
          id="agents"
          agents={agents}
          locale={locale}
          copy={t.agents}
          common={t.common}
          focus={agentsFocus}
        />
      );
    }

    if (activeView === "mission-control") {
      const missionFocus =
        activePanel === "queue" ? "queue" : activePanel === "reviews" ? "reviews" : activePanel === "release" ? "release" : "missions";

      return (
        <MissionControlPanel
          id="mission-control"
          missionControl={missionControl}
          locale={locale}
          copy={t.missionControl}
          common={t.common}
          focus={missionFocus}
          handoff={missionHandoff}
        />
      );
    }

    if (activeView === "history") {
      return (
        <UsageHistoryPanel
          id="history"
          history={localizedUsage.history}
          locale={locale}
          copy={{ ...t.history, section: t.nav.history }}
          common={t.common}
          focus={historyFocus}
        />
      );
    }

    if (activeView === "usage") {
      if (activePanel === "limits") {
        return (
          <SectionShell
            id="usage"
            eyebrow={t.usage.section}
            title={t.usage.limitWindows}
            description={formatMessage(t.hero.providerHint, { value: primaryProviderLabel })}
          >
            {localizedUsage.available ? (
              <>
                <div className="stack">
                  <div className="metricLine">
                    <span className="metricLabel">{t.usage.authStatus}</span>
                    <strong>{providerAuthStatus}</strong>
                  </div>
                  <div className="metricLine">
                    <span className="metricLabel">{t.usage.activeProvider}</span>
                    <strong>{primaryProviderLabel}</strong>
                  </div>
                </div>

                {providerWindows.length ? <ProviderLimitWindows windows={providerWindows} variant="compact" /> : null}

                <div className="providerLimitsPanel">
                  <p className="providerLimitsPanelLabel">{t.hero.pulseTitle}</p>
                  {providerRosterContent}
                </div>

                <div className="infoBox">
                  <p>{formatMessage(t.hero.pulseFooter, { value: quotaSourceLabel })}</p>
                </div>
              </>
            ) : (
              renderUsageUnavailable()
            )}
          </SectionShell>
        );
      }

      if (activePanel === "models") {
        return (
          <SectionShell
            id="usage"
            eyebrow={t.usage.section}
            title={t.usage.tableToggle}
            description={t.usage.topModelDescription}
          >
            {localizedUsage.available ? (
              <div className="tableWrap">
                <table>
                  <thead>
                    <tr>
                      <th>{t.usage.tableModel}</th>
                      <th>{t.usage.tableRequests}</th>
                      <th>{t.usage.tableTokens}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(localizedUsage.models || []).map((model) => (
                      <tr key={model.model}>
                        <td>{model.model}</td>
                        <td>{model.requests}</td>
                        <td>{model.totalTokens}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              renderUsageUnavailable()
            )}
          </SectionShell>
        );
      }

      return (
        <SectionShell
          id="usage"
          eyebrow={t.usage.section}
          title={t.usage.topModelBreakdown}
          description={t.usage.topModelDescription}
        >
          {localizedUsage.available ? (
            <>
              <div className="stack">
                <div className="metricLine">
                  <span className="metricLabel">{t.usage.topModel}</span>
                  <strong>{localizedUsage.topModel || na}</strong>
                </div>
                <div className="metricLine">
                  <span className="metricLabel">{t.usage.authStatus}</span>
                  <strong>{providerAuthStatus}</strong>
                </div>
                <div className="metricLine">
                  <span className="metricLabel">{t.usage.activeProvider}</span>
                  <strong>{primaryProviderLabel}</strong>
                </div>
              </div>

              {providerWindows.length ? (
                <div className="providerLimitsPanel">
                  <p className="providerLimitsPanelLabel">{t.usage.limitWindows}</p>
                  <ProviderLimitWindows windows={providerWindows} variant="compact" />
                </div>
              ) : null}

              <div className="shareList">
                {(localizedUsage.topModelSources || []).map((entry) => (
                  <article key={entry.source} className="shareRow">
                    <div className="shareLabelRow">
                      <span>{entry.source}</span>
                      <strong>{entry.share}</strong>
                    </div>
                    <div className="shareBar">
                      <div className="shareBarFill" style={{ width: entry.share }} />
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : (
            renderUsageUnavailable()
          )}
        </SectionShell>
      );
    }

    if (activePanel === "jobs") {
      return (
        <SectionShell
          id="scheduler"
          eyebrow={t.scheduler.section}
          title={t.scheduler.tableJob}
          description={t.scheduler.description}
        >
          {cron.available ? (
            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>{t.scheduler.tableJob}</th>
                    <th>{t.scheduler.tableNextRun}</th>
                    <th>{t.scheduler.tableLastStatus}</th>
                    <th>{t.scheduler.tableDelivery}</th>
                  </tr>
                </thead>
                <tbody>
                  {nextJobs.map((job) => (
                    <tr key={job.id}>
                      <td>
                        <div className="tableTitle">{job.name}</div>
                        <div className="tableSubtle">{job.schedule}</div>
                      </td>
                      <td>{job.nextRunAt}</td>
                      <td>{job.lastRunStatus}</td>
                      <td>{job.delivery}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            renderSchedulerUnavailable()
          )}
        </SectionShell>
      );
    }

    if (activePanel === "attention") {
      return (
        <SectionShell
          id="scheduler"
          eyebrow={t.scheduler.section}
          title={t.scheduler.needsAttention}
          description={t.scheduler.description}
        >
          {cron.available ? (
            failingJobs.length > 0 ? (
              <div className="alertBox">
                <ul className="plainList">
                  {failingJobs.map((job) => (
                    <li key={job.id}>
                      <strong>{job.name}</strong>
                      <span>
                        {job.lastRunStatus} / {job.lastDeliveryStatus}
                        {job.consecutiveErrors > 0 ? ` / ${t.scheduler.errors} ${job.consecutiveErrors}` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="infoBox">
                <p>{statusHint}</p>
              </div>
            )
          ) : (
            renderSchedulerUnavailable()
          )}
        </SectionShell>
      );
    }

    return (
      <SectionShell
        id="scheduler"
        eyebrow={t.scheduler.section}
        title={t.scheduler.title}
        description={t.scheduler.description}
      >
        {cron.available ? (
          <>
            <div className="miniSummaryGrid">
              {schedulerTotals.map((item) => (
                <article
                  key={item.label}
                  className={`miniSummaryCard ${item.tone === "warning" ? "miniSummaryCardWarning" : ""}`}
                >
                  <span className="miniSummaryLabel">{item.label}</span>
                  <strong className="miniSummaryValue">{item.value}</strong>
                </article>
              ))}
            </div>

            <div className="stack">
              <div className="metricLine">
                <span className="metricLabel">{t.hero.lastRun}</span>
                <strong>{lastRunLabel}</strong>
              </div>
              <div className="metricLine">
                <span className="metricLabel">{t.hero.nextRun}</span>
                <strong>{nextRunLabel}</strong>
              </div>
              <div className="metricLine">
                <span className="metricLabel">{t.hero.statusLabel}</span>
                <strong>{statusValue}</strong>
              </div>
            </div>
          </>
        ) : (
          renderSchedulerUnavailable()
        )}
      </SectionShell>
    );
  };

  return (
    <main className="pageShell" lang={localeTag(locale)}>
      <LiveRefresh enabled={openclawSourceKind !== "demo"} />
      <div className="pageGlow pageGlowLeft" />
      <div className="pageGlow pageGlowRight" />

      <header className="topBar">
        <a href={buildHref(locale)} className="brandLockup">
          <span className="brandBadge">OC</span>
          <span className="brandText">
            <strong>{t.hero.title}</strong>
            <small>{t.hero.eyebrow}</small>
          </span>
        </a>

        <nav className="menuBar" aria-label={t.nav.label}>
          {viewItems.map((item) => (
            <a
              key={item.id}
              href={buildHref(locale, item.id)}
              className={`menuLink ${activeView === item.id ? "menuLinkActive" : ""}`}
              aria-current={activeView === item.id ? "page" : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="toolbarCluster">
          <span className={`modeChip ${openclawSourceKind === "demo" ? "modeChipDemo" : ""}`}>{modeLabel}</span>
          <ThemeSwitch
            label={t.theme.label}
            lightLabel={t.theme.light}
            darkLabel={t.theme.dark}
            theme={theme}
          />
          <div className="languageSwitch" aria-label={t.language.label}>
            {(["en", "zh"] as const).map((targetLocale) => (
              <a
                key={targetLocale}
                href={buildHref(targetLocale, activeView, activePanel)}
                className={`languageOption ${locale === targetLocale ? "languageOptionActive" : ""}`}
                aria-current={locale === targetLocale ? "page" : undefined}
              >
                {t.language[targetLocale]}
              </a>
            ))}
          </div>
        </div>
      </header>

      <div className="dashboardLayout">
        <aside className="dashboardSidebar">
          <div className="sidebarSurface">
            <div className="sidebarIntro">
              <p className="eyebrow">{activeViewItem.label}</p>
              <h2 className="sidebarSectionTitle">{activePanelItem.label}</h2>
              <p className="sidebarCopy">{activePanelItem.description}</p>
            </div>

            <nav className="sidebarNav" aria-label={activeViewItem.label}>
              {activePanelItems.map((item, index) => (
                <a
                  key={item.id}
                  href={buildHref(locale, activeView, item.id)}
                  className={`sidebarNavLink ${activePanel === item.id ? "sidebarNavLinkActive" : ""}`}
                  aria-current={activePanel === item.id ? "page" : undefined}
                >
                  <span className="sidebarNavIndex">{String(index + 1).padStart(2, "0")}</span>
                  <span className="sidebarNavBody">
                    <strong className="sidebarNavLabel">{item.label}</strong>
                    <span className="sidebarNavHint">{item.hint}</span>
                  </span>
                </a>
              ))}
            </nav>

            <article
              className={`sidebarStatusCard ${
                contextualSummary.tone === "warning" ? "sidebarStatusCardWarning" : ""
              }`}
            >
              <span className="sidebarStatusLabel">{contextualSummary.label}</span>
              <strong className="sidebarStatusValue">{contextualSummary.value}</strong>
              <p className="sidebarStatusHint">{contextualSummary.hint}</p>

              <div className="sidebarFactGrid">
                {contextualFacts.map((item) => (
                  <div key={item.label} className="sidebarFact">
                    <span className="sidebarFactLabel">{item.label}</span>
                    <strong className="sidebarFactValue">{item.value}</strong>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </aside>

        <div className="dashboardMain">{renderActiveContent()}</div>
      </div>
    </main>
  );
}
