import type { Metadata } from "next";
import { cookies } from "next/headers";

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

type HomePageProps = {
  searchParams?: Promise<{ lang?: string }> | { lang?: string };
};

const buildHref = (targetLocale: Locale, hash?: string) => {
  const base = targetLocale === "en" ? "/" : "/?lang=zh";
  return hash ? `${base}#${hash}` : base;
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
  const t = getMessages(locale);
  const cookieStore = await cookies();
  const theme = resolveTheme(cookieStore.get(THEME_COOKIE)?.value);

  const snapshot = await getDashboardSnapshot();
  const { usage, cron, openclawHome, openclawSourceKind, openclawSourceLabel } = snapshot;
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
  ] as const;

  const navItems = [
    { id: "overview", label: t.nav.overview },
    { id: "history", label: t.nav.history },
    { id: "usage", label: t.nav.usage },
    { id: "scheduler", label: t.nav.scheduler }
  ];

  return (
    <main className="pageShell" lang={localeTag(locale)}>
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
          {navItems.map((item) => (
            <a key={item.id} href={buildHref(locale, item.id)} className="menuLink">
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
                href={buildHref(targetLocale)}
                className={`languageOption ${locale === targetLocale ? "languageOptionActive" : ""}`}
                aria-current={locale === targetLocale ? "page" : undefined}
              >
                {t.language[targetLocale]}
              </a>
            ))}
          </div>
        </div>
      </header>

      <section id="overview" className="hero sectionAnchor">
        <div className="heroMain">
          <p className="eyebrow">{t.hero.eyebrow}</p>
          <h1>{t.hero.title}</h1>
          <p className="heroCopy">{formatMessage(t.hero.copy, { home: openclawHome })}</p>

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
        </div>

        <div className="heroRail">
          <article className="signalCard signalCardQuota">
            <p className="eyebrow">{t.hero.pulseEyebrow}</p>
            <h2 className="signalCardTitle">{t.hero.pulseTitle}</h2>
            <p className="signalCardLead">{t.hero.pulseCopy}</p>

            {providerRoster.length ? (
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
            ) : null}

            <p className="signalCardCopy">{formatMessage(t.hero.pulseFooter, { value: quotaSourceLabel })}</p>
          </article>

        </div>
      </section>

      <UsageHistoryPanel
        id="history"
        history={localizedUsage.history}
        locale={locale}
        copy={{ ...t.history, section: t.nav.history }}
        common={t.common}
      />

      <div className="contentStack">
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

              <details className="detailDisclosure">
                <summary>{t.usage.tableToggle}</summary>
                <div className="tableWrap tableWrapNested">
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
              </details>
            </>
          ) : (
            <div className="emptyState">
              <p>{localizedUsage.error}</p>
              {(localizedUsage.notes || []).map((note) => (
                <p key={note}>{note}</p>
              ))}
            </div>
          )}
        </SectionShell>

        <SectionShell id="scheduler" eyebrow={t.scheduler.section} title={t.scheduler.title} description={t.scheduler.description}>
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

              {failingJobs.length > 0 ? (
                <div className="alertBox">
                  <p className="eyebrow">{t.scheduler.needsAttention}</p>
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
              ) : null}
            </>
          ) : (
            <div className="emptyState">
              <p>{cronError}</p>
              <p>
                <code>{cron.path}</code>
              </p>
            </div>
          )}
        </SectionShell>
      </div>

    </main>
  );
}
