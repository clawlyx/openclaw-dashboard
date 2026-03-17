import { formatDateTimeLabel } from "@/lib/dashboard-presenters";
import type { Locale } from "@/lib/i18n";
import type {
  MissionControlDeliveryMode,
  MissionControlFeatureSnapshot,
  MissionControlFeatureStatus,
  MissionControlSnapshot,
  MissionControlTaskLane,
  MissionControlTaskSnapshot,
  MissionControlTaskStatus
} from "@/lib/mission-control";
import { MissionIntakeForm } from "@/components/mission-intake-form";
import { MissionTaskActions } from "@/components/mission-task-actions";
import { SectionShell } from "@/components/section-shell";

type MissionControlMessages = {
  section: string;
  title: string;
  copy: string;
  overviewTitle: string;
  overviewDescription: string;
  queueTitle: string;
  queueDescription: string;
  reviewTitle: string;
  reviewDescription: string;
  releaseTitle: string;
  releaseDescription: string;
  summaryFeatures: string;
  summaryTasks: string;
  summaryReview: string;
  summaryBlocked: string;
  summaryReady: string;
  summaryIdeas: string;
  summaryRepos: string;
  workerStatus: string;
  workerConnected: string;
  workerDisconnected: string;
  workerHint: string;
  latestTask: string;
  latestTaskFallback: string;
  sourceLabel: string;
  statePath: string;
  heartbeat: string;
  currentLane: string;
  featureStatus: string;
  taskStatus: string;
  deliveryMode: string;
  repo: string;
  updated: string;
  branch: string;
  pr: string;
  merged: string;
  yes: string;
  no: string;
  reviewQueue: string;
  releaseReady: string;
  queueReady: string;
  queueRunning: string;
  queueReview: string;
  queueBlocked: string;
  queueEmpty: string;
  ideasAwaitingConfirmation: string;
  featuresAwaitingPr: string;
  featuresAwaitingMerge: string;
  reviewTasks: string;
  noReview: string;
  noRelease: string;
  noMissionControl: string;
  noMissionControlHint: string;
  openTasksHint: string;
  artifactsLabel: string;
  laneResearch: string;
  laneBuild: string;
  laneQa: string;
  laneRelease: string;
  statusReady: string;
  statusRunning: string;
  statusReview: string;
  statusDone: string;
  statusBlocked: string;
  featureIntake: string;
  featureResearching: string;
  featureRfcApproved: string;
  featureBuilding: string;
  featureQa: string;
  featureReadyToRelease: string;
  featureReleased: string;
  featureBlocked: string;
  deliveryAdvisoryOnly: string;
  deliveryLocalOnly: string;
  deliveryCommitRequired: string;
  deliveryPushRequired: string;
  deliveryPrRequired: string;
  intakeTitle: string;
  intakeDescription: string;
  intakeTitleField: string;
  intakeDetailsField: string;
  intakeRepoField: string;
  intakeProjectField: string;
  intakeWorkspaceField: string;
  intakeDeliveryModeField: string;
  intakeStartLaneField: string;
  intakeSubmit: string;
  intakeSubmitting: string;
  intakeSuccess: string;
  intakeError: string;
  intakeTitlePlaceholder: string;
  intakeDetailsPlaceholder: string;
  intakeRepoPlaceholder: string;
  intakeProjectPlaceholder: string;
  intakeWorkspacePlaceholder: string;
  actionStart: string;
  actionSendToReview: string;
  actionAdvance: string;
  actionRelease: string;
  actionReady: string;
  actionBlock: string;
  actionUpdating: string;
  actionError: string;
};

type MissionControlPanelProps = {
  id?: string;
  missionControl: MissionControlSnapshot;
  locale: Locale;
  copy: MissionControlMessages;
  common: {
    na: string;
  };
  focus: "missions" | "queue" | "reviews" | "release";
};

const labelLane = (lane: MissionControlTaskLane, copy: MissionControlMessages) => {
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

const labelTaskStatus = (status: MissionControlTaskStatus, copy: MissionControlMessages) => {
  switch (status) {
    case "ready":
      return copy.statusReady;
    case "running":
      return copy.statusRunning;
    case "review":
      return copy.statusReview;
    case "done":
      return copy.statusDone;
    case "blocked":
      return copy.statusBlocked;
  }
};

const labelFeatureStatus = (status: MissionControlFeatureStatus, copy: MissionControlMessages) => {
  switch (status) {
    case "intake":
      return copy.featureIntake;
    case "researching":
      return copy.featureResearching;
    case "rfc-approved":
      return copy.featureRfcApproved;
    case "building":
      return copy.featureBuilding;
    case "qa":
      return copy.featureQa;
    case "ready-to-release":
      return copy.featureReadyToRelease;
    case "released":
      return copy.featureReleased;
    case "blocked":
      return copy.featureBlocked;
  }
};

const labelDeliveryMode = (mode: MissionControlDeliveryMode, copy: MissionControlMessages) => {
  switch (mode) {
    case "advisory-only":
      return copy.deliveryAdvisoryOnly;
    case "local-only":
      return copy.deliveryLocalOnly;
    case "commit-required":
      return copy.deliveryCommitRequired;
    case "push-required":
      return copy.deliveryPushRequired;
    case "pr-required":
      return copy.deliveryPrRequired;
  }
};

const TaskCard = ({
  task,
  copy,
  common,
  locale,
  mutationMode
}: {
  task: MissionControlTaskSnapshot;
  copy: MissionControlMessages;
  common: { na: string };
  locale: Locale;
  mutationMode: "local" | "remote";
}) => (
  <article className="missionTaskCard">
    <div className="missionTaskTop">
      <span className="missionTiny">{task.tqId}</span>
      <span className={`missionBadge missionBadgeStatus missionStatus-${task.status}`}>{labelTaskStatus(task.status, copy)}</span>
    </div>
    <strong className="missionTaskTitle">{task.title}</strong>
    <p className="missionTaskSummary">{task.summary || common.na}</p>
    <div className="missionMetaRow">
      <span>{task.featureTitle}</span>
      <span>{labelLane(task.lane, copy)}</span>
    </div>
    <div className="missionMetaRow missionMetaRowMuted">
      <span>{task.repo}</span>
      <span>{formatDateTimeLabel(Date.parse(task.updatedAt), locale, common.na)}</span>
    </div>
    <MissionTaskActions task={task} copy={copy} mode={mutationMode} />
  </article>
);

const QueueColumn = ({
  title,
  tasks,
  copy,
  common,
  locale,
  mutationMode
}: {
  title: string;
  tasks: MissionControlTaskSnapshot[];
  copy: MissionControlMessages;
  common: { na: string };
  locale: Locale;
  mutationMode: "local" | "remote";
}) => (
  <article className="missionLaneCard">
    <div className="missionLaneHead">
      <strong>{title}</strong>
      <span className="missionBadge missionBadgeNeutral">{tasks.length}</span>
    </div>
    {tasks.length ? (
      <div className="missionLaneList">
        {tasks.map((task) => (
          <TaskCard key={task.tqId} task={task} copy={copy} common={common} locale={locale} mutationMode={mutationMode} />
        ))}
      </div>
    ) : (
      <div className="emptyState">
        <p>{copy.queueEmpty}</p>
      </div>
    )}
  </article>
);

const FeatureCard = ({
  feature,
  copy,
  common,
  locale,
  compact = false
}: {
  feature: MissionControlFeatureSnapshot;
  copy: MissionControlMessages;
  common: { na: string };
  locale: Locale;
  compact?: boolean;
}) => {
  const openTaskCount = feature.tasks.filter((task) => task.status !== "done").length;
  const latestTask = feature.tasks[0];

  return (
    <article className={`missionFeatureCard ${compact ? "missionFeatureCardCompact" : ""}`}>
      <div className="missionFeatureHead">
        <div>
          <p className="missionTiny">{feature.featureId}</p>
          <h3>{feature.title}</h3>
        </div>
        <span className={`missionBadge missionBadgeFeature missionFeature-${feature.status}`}>
          {labelFeatureStatus(feature.status, copy)}
        </span>
      </div>

      <p className="missionFeatureSummary">{feature.summary || common.na}</p>

      <div className="missionBadgeRow">
        <span className="missionBadge missionBadgeNeutral">
          {copy.currentLane}: {labelLane(feature.currentLane, copy)}
        </span>
        <span className="missionBadge missionBadgeNeutral">
          {copy.deliveryMode}: {labelDeliveryMode(feature.deliveryMode, copy)}
        </span>
        <span className="missionBadge missionBadgeNeutral">
          {copy.repo}: {feature.repo}
        </span>
      </div>

      <div className="missionFeatureFacts">
        <div className="missionFact">
          <span>{copy.updated}</span>
          <strong>{formatDateTimeLabel(Date.parse(feature.updatedAt), locale, common.na)}</strong>
        </div>
        <div className="missionFact">
          <span>{copy.summaryTasks}</span>
          <strong>{openTaskCount}</strong>
        </div>
        <div className="missionFact">
          <span>{copy.reviewQueue}</span>
          <strong>{feature.tasks.filter((task) => task.status === "review").length}</strong>
        </div>
      </div>

      {latestTask ? (
        <div className="infoBox">
          <p>
            {copy.latestTask}: <strong>{latestTask.title}</strong> · {labelTaskStatus(latestTask.status, copy)} ·{" "}
            {labelLane(latestTask.lane, copy)}
          </p>
        </div>
      ) : null}

      {!compact ? (
        <div className="missionArtifacts">
          <span className="missionArtifactsLabel">{copy.artifactsLabel}</span>
          <div className="missionBadgeRow">
            {["brief", "rfc", "qa", "release"].map((artifactKey) => {
              const artifactPath = feature.artifacts[artifactKey as keyof MissionControlFeatureSnapshot["artifacts"]];
              return artifactPath ? (
                <span key={`${feature.featureId}:${artifactKey}`} className="missionBadge missionBadgeNeutral">
                  {artifactKey}: {artifactPath}
                </span>
              ) : null;
            })}
          </div>
        </div>
      ) : null}

      <div className="missionMetaRow missionMetaRowMuted">
        <span>
          {copy.branch}: {feature.delivery.branch || common.na}
        </span>
        <span>
          {copy.pr}: {feature.delivery.prUrl || common.na}
        </span>
        <span>
          {copy.merged}: {feature.delivery.prMerged ? copy.yes : copy.no}
        </span>
      </div>
    </article>
  );
};

export function MissionControlPanel({ id, missionControl, locale, copy, common, focus }: MissionControlPanelProps) {
  const workerLabel = missionControl.worker.connected ? copy.workerConnected : copy.workerDisconnected;
  const workerHint = missionControl.worker.lastHeartbeatAt
    ? copy.workerHint.replace("{value}", formatDateTimeLabel(Date.parse(missionControl.worker.lastHeartbeatAt), locale, common.na))
    : common.na;
  const latestTaskLabel = missionControl.worker.latestTask
    ? `${missionControl.worker.latestTask.tqId} · ${labelLane(missionControl.worker.latestTask.lane, copy)} · ${labelTaskStatus(
        missionControl.worker.latestTask.status,
        copy
      )}`
    : copy.latestTaskFallback;
  const defaultRepo = missionControl.features.find((feature) => feature.repo && feature.repo !== "unbound")?.repo || "openclaw-dashboard";
  const mutationMode = "local";

  if (!missionControl.available) {
    return (
      <SectionShell id={id} eyebrow={copy.section} title={copy.title} description={copy.copy}>
        <div className="emptyState">
          <p>{missionControl.error || copy.noMissionControl}</p>
          <p>{copy.noMissionControlHint}</p>
        </div>
      </SectionShell>
    );
  }

  const summaryCards = [
    { label: copy.summaryFeatures, value: String(missionControl.stats.activeFeatures) },
    { label: copy.summaryTasks, value: String(missionControl.stats.openTasks) },
    { label: copy.summaryReview, value: String(missionControl.stats.reviewTasks) },
    { label: copy.summaryBlocked, value: String(missionControl.stats.blockedTasks) },
    { label: copy.summaryReady, value: String(missionControl.stats.readyToRelease) },
    { label: copy.summaryIdeas, value: String(missionControl.stats.awaitingIdeas) },
    { label: copy.summaryRepos, value: String(missionControl.stats.repos) }
  ];

  if (focus === "queue") {
    return (
      <SectionShell id={id} eyebrow={copy.section} title={copy.queueTitle} description={copy.queueDescription}>
        <div className="miniSummaryGrid missionSummaryGrid">
          {summaryCards.slice(0, 4).map((item) => (
            <article key={item.label} className="miniSummaryCard">
              <span className="miniSummaryLabel">{item.label}</span>
              <strong className="miniSummaryValue">{item.value}</strong>
            </article>
          ))}
        </div>

        <div className="missionLaneGrid">
          <QueueColumn
            title={copy.queueReady}
            tasks={missionControl.queue.readyTasks}
            copy={copy}
            common={common}
            locale={locale}
            mutationMode={mutationMode}
          />
          <QueueColumn
            title={copy.queueRunning}
            tasks={missionControl.queue.runningTasks}
            copy={copy}
            common={common}
            locale={locale}
            mutationMode={mutationMode}
          />
          <QueueColumn
            title={copy.queueReview}
            tasks={missionControl.queue.reviewTasks}
            copy={copy}
            common={common}
            locale={locale}
            mutationMode={mutationMode}
          />
          <QueueColumn
            title={copy.queueBlocked}
            tasks={missionControl.queue.blockedTasks}
            copy={copy}
            common={common}
            locale={locale}
            mutationMode={mutationMode}
          />
        </div>
      </SectionShell>
    );
  }

  if (focus === "reviews") {
    return (
      <SectionShell id={id} eyebrow={copy.section} title={copy.reviewTitle} description={copy.reviewDescription}>
        <div className="missionReviewGrid">
          <article className="missionReviewCard">
            <div className="missionLaneHead">
              <strong>{copy.ideasAwaitingConfirmation}</strong>
              <span className="missionBadge missionBadgeNeutral">{missionControl.review.ideasAwaitingConfirmation.length}</span>
            </div>
            {missionControl.review.ideasAwaitingConfirmation.length ? (
              <ul className="plainList">
                {missionControl.review.ideasAwaitingConfirmation.map((idea) => (
                  <li key={idea.ideaId}>
                    <span>
                      <strong>{idea.title}</strong>
                      <div className="tableSubtle">{idea.ideaId} · {idea.repo}</div>
                    </span>
                    <span>{formatDateTimeLabel(Date.parse(idea.updatedAt), locale, common.na)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="infoBox">
                <p>{copy.noReview}</p>
              </div>
            )}
          </article>

          <article className="missionReviewCard">
            <div className="missionLaneHead">
              <strong>{copy.featuresAwaitingPr}</strong>
              <span className="missionBadge missionBadgeNeutral">{missionControl.review.featuresAwaitingPr.length}</span>
            </div>
            {missionControl.review.featuresAwaitingPr.length ? (
              <div className="missionReviewStack">
                {missionControl.review.featuresAwaitingPr.map((feature) => (
                  <FeatureCard key={feature.featureId} feature={feature} copy={copy} common={common} locale={locale} compact />
                ))}
              </div>
            ) : (
              <div className="infoBox">
                <p>{copy.noReview}</p>
              </div>
            )}
          </article>

          <article className="missionReviewCard">
            <div className="missionLaneHead">
              <strong>{copy.featuresAwaitingMerge}</strong>
              <span className="missionBadge missionBadgeNeutral">{missionControl.review.featuresAwaitingMerge.length}</span>
            </div>
            {missionControl.review.featuresAwaitingMerge.length ? (
              <div className="missionReviewStack">
                {missionControl.review.featuresAwaitingMerge.map((feature) => (
                  <FeatureCard key={feature.featureId} feature={feature} copy={copy} common={common} locale={locale} compact />
                ))}
              </div>
            ) : (
              <div className="infoBox">
                <p>{copy.noReview}</p>
              </div>
            )}
          </article>

          <article className="missionReviewCard">
            <div className="missionLaneHead">
              <strong>{copy.reviewTasks}</strong>
              <span className="missionBadge missionBadgeNeutral">{missionControl.review.reviewTasks.length}</span>
            </div>
            {missionControl.review.reviewTasks.length ? (
              <div className="missionLaneList">
                {missionControl.review.reviewTasks.map((task) => (
                  <TaskCard
                    key={task.tqId}
                    task={task}
                    copy={copy}
                    common={common}
                    locale={locale}
                    mutationMode={mutationMode}
                  />
                ))}
              </div>
            ) : (
              <div className="infoBox">
                <p>{copy.noReview}</p>
              </div>
            )}
          </article>
        </div>
      </SectionShell>
    );
  }

  if (focus === "release") {
    const releaseFeatures = missionControl.features.filter(
      (feature) =>
        feature.status === "ready-to-release" ||
        feature.currentLane === "release" ||
        feature.tasks.some((task) => task.lane === "release")
    );

    return (
      <SectionShell id={id} eyebrow={copy.section} title={copy.releaseTitle} description={copy.releaseDescription}>
        <div className="miniSummaryGrid missionSummaryGrid">
          {[
            { label: copy.summaryReady, value: String(missionControl.stats.readyToRelease) },
            { label: copy.summaryReview, value: String(missionControl.stats.reviewTasks) },
            { label: copy.workerStatus, value: workerLabel },
            { label: copy.latestTask, value: latestTaskLabel }
          ].map((item) => (
            <article key={item.label} className="miniSummaryCard">
              <span className="miniSummaryLabel">{item.label}</span>
              <strong className="miniSummaryValue miniSummaryValueCompact">{item.value}</strong>
            </article>
          ))}
        </div>

        {releaseFeatures.length ? (
          <div className="missionFeatureStack">
            {releaseFeatures.map((feature) => (
              <FeatureCard key={feature.featureId} feature={feature} copy={copy} common={common} locale={locale} />
            ))}
          </div>
        ) : (
          <div className="emptyState">
            <p>{copy.noRelease}</p>
          </div>
        )}
      </SectionShell>
    );
  }

  return (
    <SectionShell id={id} eyebrow={copy.section} title={copy.overviewTitle} description={copy.overviewDescription}>
      <div className="miniSummaryGrid missionSummaryGrid">
        {summaryCards.map((item) => (
          <article key={item.label} className="miniSummaryCard">
            <span className="miniSummaryLabel">{item.label}</span>
            <strong className="miniSummaryValue">{item.value}</strong>
          </article>
        ))}
      </div>

      <div className="missionOverviewGrid">
        <div className="missionFeatureStack">
          {missionControl.features.map((feature) => (
            <FeatureCard key={feature.featureId} feature={feature} copy={copy} common={common} locale={locale} />
          ))}
        </div>

        <aside className="missionSidebar">
          <article className="missionSidebarCard missionSidebarCardForm">
            <MissionIntakeForm copy={copy} defaultRepo={defaultRepo} />
          </article>

          <article className="missionSidebarCard">
            <span className="miniSummaryLabel">{copy.workerStatus}</span>
            <strong className="missionSidebarValue">{workerLabel}</strong>
            <p className="missionSidebarCopy">{workerHint}</p>

            <div className="missionSidebarFacts">
              <div className="missionFact">
                <span>{copy.summaryFeatures}</span>
                <strong>{missionControl.worker.activeFeatures || missionControl.stats.activeFeatures}</strong>
              </div>
              <div className="missionFact">
                <span>{copy.summaryReview}</span>
                <strong>{missionControl.worker.reviewTasks}</strong>
              </div>
              <div className="missionFact">
                <span>{copy.summaryBlocked}</span>
                <strong>{missionControl.worker.blockedTasks}</strong>
              </div>
            </div>
          </article>

          <article className="missionSidebarCard">
            <span className="miniSummaryLabel">{copy.latestTask}</span>
            <strong className="missionSidebarValue missionSidebarValueCompact">{latestTaskLabel}</strong>
            <div className="missionSidebarFacts missionSidebarFactsTight">
              <div className="missionFact">
                <span>{copy.sourceLabel}</span>
                <strong>{missionControl.sourceLabel}</strong>
              </div>
              <div className="missionFact">
                <span>{copy.statePath}</span>
                <strong>{missionControl.path}</strong>
              </div>
              <div className="missionFact">
                <span>{copy.heartbeat}</span>
                <strong>{missionControl.heartbeatPath}</strong>
              </div>
            </div>
          </article>
        </aside>
      </div>
    </SectionShell>
  );
}
