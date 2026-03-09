import type { Metadata } from "next";

import { SectionShell } from "@/components/section-shell";
import { StatCard } from "@/components/stat-card";
import { UsageHistoryPanel } from "@/components/usage-history-panel";
import {
  formatDateTimeLabel,
  formatQuotaDisplay,
  formatQuotaHint,
  formatQuotaSourceLabel,
  formatReportDateLabel,
  formatReportsWindowLabel,
  formatSourceLabel,
  presentCronJob,
  translateDashboardText,
  translateDashboardTexts
} from "@/lib/dashboard-presenters";
import { formatMessage, getMessages, localeTag, resolveLocale, type Locale } from "@/lib/i18n";
import { getDashboardSnapshot } from "@/lib/openclaw";

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

  const snapshot = await getDashboardSnapshot();
  const { usage, cron, openclawHome, openclawSourceKind, openclawSourceLabel } = snapshot;
  const na = t.common.na;
  const unavailable = t.common.unavailable;

  const localizedSourceLabel = formatSourceLabel(openclawSourceKind, openclawSourceLabel, t);
  const quotaHint = formatQuotaHint(usage, t);
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
    quota5h: formatQuotaDisplay(usage.quota5h, t),
    quota7d: formatQuotaDisplay(usage.quota7d, t),
    error: translateDashboardText(usage.error, t),
    notes: translateDashboardTexts(usage.notes, t),
    history: {
      ...usage.history,
      error: translateDashboardText(usage.history.error, t),
      notes: translateDashboardTexts(usage.history.notes, t),
      reportsWindowLabel: formatReportsWindowLabel(Math.min(7, usage.history.reportCount), t)
    }
  };

  const presentJob = (job: (typeof cron.nextJobs)[number]) => presentCronJob({ job, locale, messages: t });
  const nextJobs = cron.nextJobs.map(presentJob);
  const failingJobs = cron.failingJobs.map(presentJob);
  const cronError = translateDashboardText(cron.error, t);
  const nextRunLabel = nextJobs[0]?.nextRunAt || na;

  const navItems = [
    { id: "overview", label: t.nav.overview },
    { id: "history", label: t.nav.history },
    { id: "usage", label: t.nav.usage },
    { id: "scheduler", label: t.nav.scheduler },
    { id: "roadmap", label: t.nav.roadmap }
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

          <div className="heroActionRow">
            <a href={buildHref(locale, "history")} className="heroActionPrimary">
              {t.hero.primaryCta}
            </a>
            <a href={buildHref(locale, "scheduler")} className="heroActionSecondary">
              {t.hero.secondaryCta}
            </a>
          </div>

          <div className="heroMeta heroMetaGrid">
            <div className="metaChip">{formatMessage(t.hero.generated, { value: generatedLabel })}</div>
            <div className="metaChip">{formatMessage(t.hero.source, { value: localizedSourceLabel })}</div>
            <div className="metaChip">{formatMessage(t.hero.usageSource, { value: reportDateLabel })}</div>
            <div className="metaChip">{formatMessage(t.hero.cronJobs, { count: cron.jobs.length })}</div>
          </div>
        </div>

        <div className="heroRail">
          <article className="signalCard signalCardQuota">
            <p className="eyebrow">{t.hero.pulseEyebrow}</p>
            <h2 className="signalCardTitle">{t.hero.pulseTitle}</h2>

            <div className="quotaValue quotaValueHero">
              <div className="quotaItem">
                <span className="quotaKey">{t.stats.window5h}</span>
                <strong className="quotaFigure">{localizedUsage.quota5h || na}</strong>
              </div>
              <div className="quotaDivider" />
              <div className="quotaItem">
                <span className="quotaKey">{t.stats.window7d}</span>
                <strong className="quotaFigure">{localizedUsage.quota7d || na}</strong>
              </div>
            </div>

            <p className="signalCardCopy">{formatMessage(t.hero.pulseFooter, { value: quotaSourceLabel })}</p>
          </article>

          <article className="signalCard">
            <p className="eyebrow">{t.hero.opsEyebrow}</p>
            <div className="signalList">
              <div className="signalRow">
                <span className="signalLabel">{t.hero.sourcePath}</span>
                <strong className="signalValue">
                  <code>{openclawHome}</code>
                </strong>
              </div>
              <div className="signalRow">
                <span className="signalLabel">{t.hero.nextRun}</span>
                <strong className="signalValue">{nextRunLabel}</strong>
              </div>
              <div className="signalRow">
                <span className="signalLabel">{t.hero.attention}</span>
                <strong className="signalValue">{cron.attentionCount}</strong>
              </div>
            </div>
          </article>
        </div>
      </section>

      {openclawSourceKind === "demo" ? (
        <section className="infoBox">
          <p className="eyebrow">{t.demo.eyebrow}</p>
          <p>{t.demo.copy}</p>
        </section>
      ) : null}

      <section className="statsGrid">
        <StatCard label={t.stats.totalRequests} value={usage.totalRequests || na} hint={t.stats.latestUsage} />
        <StatCard label={t.stats.totalTokens} value={usage.totalTokens || na} hint={t.stats.inputOutput} />
        <StatCard
          label={t.stats.quotaRemaining}
          value={
            <div className="quotaValue">
              <div className="quotaItem">
                <span className="quotaKey">{t.stats.window5h}</span>
                <strong className="quotaFigure">{localizedUsage.quota5h || na}</strong>
              </div>
              <div className="quotaDivider" />
              <div className="quotaItem">
                <span className="quotaKey">{t.stats.window7d}</span>
                <strong className="quotaFigure">{localizedUsage.quota7d || na}</strong>
              </div>
            </div>
          }
          hint={quotaHint}
        />
        <StatCard
          label={t.stats.jobsAttention}
          value={String(cron.attentionCount)}
          hint={cron.available ? t.stats.failedUndelivered : cronError || t.stats.cronUnavailable}
          tone={cron.attentionCount > 0 ? "warning" : "default"}
        />
      </section>

      <UsageHistoryPanel
        id="history"
        history={localizedUsage.history}
        locale={locale}
        copy={{ ...t.history, section: t.usage.section }}
        common={t.common}
      />

      <div className="contentGrid">
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
                  <span className="metricLabel">{t.usage.oauth}</span>
                  <strong>{localizedUsage.oauthStatus || na}</strong>
                </div>
                <div className="metricLine">
                  <span className="metricLabel">{t.usage.remaining7d}</span>
                  <strong>{localizedUsage.quota7d || na}</strong>
                </div>
              </div>

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
              <div className="statsGridCompact">
                <StatCard label={t.scheduler.enabled} value={String(cron.enabledCount)} />
                <StatCard label={t.scheduler.disabled} value={String(cron.disabledCount)} />
                <StatCard
                  label={t.scheduler.attention}
                  value={String(cron.attentionCount)}
                  tone={cron.attentionCount > 0 ? "warning" : "default"}
                />
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

      <section id="roadmap" className="footerPanel sectionAnchor">
        <div>
          <p className="eyebrow">{t.roadmap.eyebrow}</p>
          <h2>{t.roadmap.title}</h2>
        </div>
        <ul className="plainList">
          {t.roadmap.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
