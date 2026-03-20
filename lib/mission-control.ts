import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

export type MissionControlSourceKind = "live" | "demo";
export type MissionControlIdeaStatus =
  | "captured"
  | "clarifying"
  | "awaiting-confirmation"
  | "promoted"
  | "dropped";
export type MissionControlFeatureStatus =
  | "intake"
  | "researching"
  | "rfc-approved"
  | "building"
  | "qa"
  | "ready-to-release"
  | "released"
  | "blocked";
export type MissionControlTaskStatus = "ready" | "running" | "review" | "done" | "blocked";
export type MissionControlTaskLane = "research" | "build" | "qa" | "release";
export type MissionControlHistorySource = "full-history" | "partial-history" | "current-only";
export type MissionControlDeliveryMode =
  | "advisory-only"
  | "local-only"
  | "commit-required"
  | "push-required"
  | "pr-required";

export type MissionControlHistoryEntry = {
  at: string;
  action: string;
  detail?: string;
  taskId?: string;
  taskTitle?: string;
  lane?: MissionControlTaskLane;
  status?: MissionControlTaskStatus;
  source: "feature-history" | "task-history" | "derived-timestamp";
};

export type MissionControlIdeaSnapshot = {
  ideaId: string;
  title: string;
  status: MissionControlIdeaStatus;
  project: string;
  workspace: string;
  repo: string;
  featureId: string | null;
  updatedAt: string;
};

export type MissionControlTaskSnapshot = {
  tqId: string;
  title: string;
  lane: MissionControlTaskLane;
  status: MissionControlTaskStatus;
  updatedAt: string;
  startedAt?: string;
  lastWorkedAt?: string;
  summary: string;
  nextPlannedStep?: string;
  blockedReason?: string;
  waitingOn?: string;
  ownerAgentId?: string;
  ownerRoomId?: string;
  featureId: string;
  featureTitle: string;
  featureStatus: MissionControlFeatureStatus;
  linkedIdeaId: string | null;
  project: string;
  workspace: string;
  repo: string;
  deliveryMode: MissionControlDeliveryMode;
  history: MissionControlHistoryEntry[];
  historySource: MissionControlHistorySource;
};

export type MissionControlFeatureSnapshot = {
  featureId: string;
  title: string;
  status: MissionControlFeatureStatus;
  project: string;
  workspace: string;
  repo: string;
  deliveryMode: MissionControlDeliveryMode;
  linkedIdeaId: string | null;
  currentLane: MissionControlTaskLane;
  artifactRoot: string;
  artifacts: {
    brief: string;
    rfc: string;
    qa: string;
    release: string;
  };
  summary: string;
  delivery: {
    branch: string;
    prUrl: string | null;
    prMerged: boolean;
    repoRoot: string;
  };
  tasks: MissionControlTaskSnapshot[];
  history: MissionControlHistoryEntry[];
  historySource: MissionControlHistorySource;
  updatedAt: string;
};

export type MissionControlWorkerSnapshot = {
  connected: boolean;
  lastHeartbeatAt?: string;
  pollMs?: number;
  activeFeatures: number;
  readyTasks: number;
  reviewTasks: number;
  blockedTasks: number;
  latestTask?: {
    tqId: string;
    featureId: string;
    lane: MissionControlTaskLane;
    status: MissionControlTaskStatus;
  };
};

export type MissionControlSnapshot = {
  available: boolean;
  sourceKind: MissionControlSourceKind;
  sourceLabel: string;
  updatedAt?: string;
  path: string;
  heartbeatPath: string;
  worker: MissionControlWorkerSnapshot;
  stats: {
    ideas: number;
    awaitingIdeas: number;
    features: number;
    activeFeatures: number;
    releasedFeatures: number;
    readyToRelease: number;
    tasks: number;
    openTasks: number;
    readyTasks: number;
    runningTasks: number;
    reviewTasks: number;
    blockedTasks: number;
    repos: number;
  };
  queue: {
    readyTasks: MissionControlTaskSnapshot[];
    runningTasks: MissionControlTaskSnapshot[];
    reviewTasks: MissionControlTaskSnapshot[];
    blockedTasks: MissionControlTaskSnapshot[];
  };
  review: {
    ideasAwaitingConfirmation: MissionControlIdeaSnapshot[];
    featuresAwaitingPr: MissionControlFeatureSnapshot[];
    featuresAwaitingMerge: MissionControlFeatureSnapshot[];
    reviewTasks: MissionControlTaskSnapshot[];
  };
  features: MissionControlFeatureSnapshot[];
  notes?: string[];
  error?: string;
};

type MissionControlStateRecord = {
  ideas?: Array<Record<string, unknown>>;
  features?: Array<Record<string, unknown>>;
};

type WorkerHeartbeatRecord = {
  at?: string;
  pollMs?: number;
  activeFeatures?: number;
  readyTasks?: number;
  reviewTasks?: number;
  blockedTasks?: number;
  latestTask?: {
    tqId?: string;
    featureId?: string;
    lane?: string;
    status?: string;
  };
};

const DEFAULT_MISSION_CONTROL_HOME = path.join(os.homedir(), ".openclaw", "mission-control");
const DEFAULT_STATE_FILE = path.join(DEFAULT_MISSION_CONTROL_HOME, "archive-state.json");
const DEFAULT_HEARTBEAT_FILE = path.join(DEFAULT_MISSION_CONTROL_HOME, "worker-heartbeat.json");
const HEARTBEAT_FRESHNESS_MS = 5 * 60 * 1000;

const SAMPLE_STATE: Required<MissionControlStateRecord> = {
  ideas: [
    {
      ideaId: "IDEA-001",
      title: "Operator research digest",
      status: "clarifying",
      project: "personal-research",
      workspace: "operator-research",
      repo: "personal-research",
      featureId: "F-0001-operator-research-digest",
      updatedAt: "2026-03-10T11:15:00.000Z"
    },
    {
      ideaId: "IDEA-004",
      title: "Concierge research notebook",
      status: "awaiting-confirmation",
      project: "personal-research",
      workspace: "operator-research",
      repo: "personal-research",
      featureId: "F-0004-concierge-research-notebook",
      updatedAt: "2026-03-10T09:42:00.000Z"
    }
  ],
  features: [
    {
      featureId: "F-0001-operator-research-digest",
      title: "Operator research digest",
      status: "researching",
      project: "personal-research",
      workspace: "operator-research",
      repo: "personal-research",
      deliveryMode: "advisory-only",
      linkedIdeaId: "IDEA-001",
      currentLane: "research",
      artifactRoot: "/Users/clawlyx/.openclaw/mission-control/artifacts/advisory/F-0001-operator-research-digest/docs",
      artifacts: {
        brief: "artifacts/advisory/F-0001-operator-research-digest/docs/briefs/F-0001-operator-research-digest.md",
        rfc: "artifacts/advisory/F-0001-operator-research-digest/docs/rfc/F-0001-operator-research-digest.md",
        qa: "artifacts/advisory/F-0001-operator-research-digest/docs/qa/F-0001-operator-research-digest.md",
        release: "artifacts/advisory/F-0001-operator-research-digest/docs/release/F-0001-operator-research-digest.md"
      },
      summary: "Personal research stays visible after the archive cleanup, while repo-bound task systems remain retired.",
      delivery: {
        branch: "advisory/F-0001-operator-research-digest",
        prUrl: null,
        prMerged: false,
        repoRoot: "/Users/clawlyx/.openclaw/mission-control/artifacts/advisory/F-0001-operator-research-digest"
      },
      tasks: [
        {
          tqId: "TQ-091",
          title: "Research operator digest outline",
          lane: "research",
          status: "running",
          startedAt: "2026-03-09T12:15:00.000Z",
          lastWorkedAt: "2026-03-10T11:15:00.000Z",
          updatedAt: "2026-03-10T11:15:00.000Z",
          summary: "Consolidating the post-archive operator notes into one research digest.",
          nextPlannedStep: "Package the research notes into a short decision memo for review.",
          ownerAgentId: "research-agent",
          ownerRoomId: "research",
          history: [
            {
              at: "2026-03-09T12:15:00.000Z",
              action: "start",
              detail: "TQ-091 started in the research lane.",
              taskId: "TQ-091",
              lane: "research",
              status: "running"
            },
            {
              at: "2026-03-10T11:15:00.000Z",
              action: "worked",
              detail: "Research notes were updated for TQ-091 after the legacy repo-task archive.",
              taskId: "TQ-091",
              lane: "research",
              status: "running"
            }
          ]
        }
      ],
      history: [
        {
          at: "2026-03-09T12:15:00.000Z",
          action: "task",
          detail: "TQ-091 started from Mission Control."
        },
        {
          at: "2026-03-10T11:15:00.000Z",
          action: "archive",
          detail: "Repo-bound tasks were archived; the personal research queue remained active."
        }
      ]
    },
    {
      featureId: "F-0004-concierge-research-notebook",
      title: "Concierge research notebook",
      status: "researching",
      project: "personal-research",
      workspace: "operator-research",
      repo: "personal-research",
      deliveryMode: "advisory-only",
      linkedIdeaId: "IDEA-004",
      currentLane: "research",
      artifactRoot: "/Users/clawlyx/.openclaw/mission-control/artifacts/advisory/F-0004-concierge-research-notebook/docs",
      artifacts: {
        brief: "artifacts/advisory/F-0004-concierge-research-notebook/docs/briefs/F-0004-concierge-research-notebook.md",
        rfc: "artifacts/advisory/F-0004-concierge-research-notebook/docs/rfc/F-0004-concierge-research-notebook.md",
        qa: "artifacts/advisory/F-0004-concierge-research-notebook/docs/qa/F-0004-concierge-research-notebook.md",
        release: "artifacts/advisory/F-0004-concierge-research-notebook/docs/release/F-0004-concierge-research-notebook.md"
      },
      summary: "The remaining `TQ-XXX` queue is limited to personal research work with no repo-bound execution path.",
      delivery: {
        branch: "advisory/F-0004-concierge-research-notebook",
        prUrl: null,
        prMerged: false,
        repoRoot: "/Users/clawlyx/.openclaw/mission-control/artifacts/advisory/F-0004-concierge-research-notebook"
      },
      tasks: [
        {
          tqId: "TQ-101",
          title: "Research concierge archive notes",
          lane: "research",
          status: "review",
          startedAt: "2026-03-14T18:20:00.000Z",
          lastWorkedAt: "2026-03-19T20:18:00.000Z",
          updatedAt: "2026-03-19T20:18:00.000Z",
          summary: "Reviewing whether the surviving notes cleanly separate personal research from archived repo work.",
          nextPlannedStep: "Hand the notebook to qa-agent for review while keeping Mission Control as the task owner of record.",
          waitingOn: "qa-agent review sign-off",
          ownerAgentId: "research-agent",
          ownerRoomId: "research",
          history: [
            {
              at: "2026-03-14T18:20:00.000Z",
              action: "start",
              detail: "TQ-101 started in the research lane.",
              taskId: "TQ-101",
              lane: "research",
              status: "running"
            },
            {
              at: "2026-03-15T08:15:00.000Z",
              action: "review",
              detail: "TQ-101 paused in review while the archive note was checked.",
              taskId: "TQ-101",
              lane: "research",
              status: "review"
            },
            {
              at: "2026-03-19T20:18:00.000Z",
              action: "worked",
              detail: "Research Agent updated TQ-101 and prepared the notebook for qa-agent review in the review booth.",
              taskId: "TQ-101",
              lane: "research",
              status: "review"
            }
          ]
        }
      ],
      history: [
        { at: "2026-03-14T18:20:00.000Z", action: "task", detail: "TQ-101 started from Mission Control." },
        { at: "2026-03-15T08:15:00.000Z", action: "task", detail: "TQ-101 paused for review." },
        {
          at: "2026-03-19T20:18:00.000Z",
          action: "handoff",
          detail: "Research Agent prepared TQ-101 for qa-agent review while Mission Control retained ownership truth."
        }
      ]
    }
  ]
};

const SAMPLE_HEARTBEAT: WorkerHeartbeatRecord = {
  at: "2026-03-19T20:18:00.000Z",
  pollMs: 15000,
  activeFeatures: 2,
  readyTasks: 0,
  reviewTasks: 1,
  blockedTasks: 0,
  latestTask: {
    tqId: "TQ-101",
    featureId: "F-0004-concierge-research-notebook",
    lane: "research",
    status: "review"
  }
};

const asObject = (value: unknown) =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : undefined;

const asString = (value: unknown) => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

const asNumber = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : undefined;
  }
  return undefined;
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

const pathExists = async (target: string) => {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
};

const parseTimestampMs = (value?: string) => {
  if (!value) return undefined;
  const timestampMs = Date.parse(value);
  return Number.isFinite(timestampMs) ? timestampMs : undefined;
};

const normalizeHistorySource = (value: unknown): MissionControlHistorySource | undefined => {
  switch (value) {
    case "full-history":
    case "partial-history":
    case "current-only":
      return value;
    default:
      return undefined;
  }
};

const extractTaskId = (value?: string) => {
  if (!value) return undefined;
  const match = value.match(/\bTQ-\d+\b/);
  return match ? match[0] : undefined;
};

const extractLane = (value?: string): MissionControlTaskLane | undefined => {
  if (!value) return undefined;
  if (/\bresearch\b/i.test(value)) return "research";
  if (/\bbuild\b/i.test(value)) return "build";
  if (/\bqa\b/i.test(value)) return "qa";
  if (/\brelease\b/i.test(value)) return "release";
  return undefined;
};

const inferHistoryStatus = (action?: string, detail?: string): MissionControlTaskStatus | undefined => {
  const combined = `${action || ""} ${detail || ""}`.trim();
  if (!combined) return undefined;
  if (/\bblocked\b/i.test(combined)) return "blocked";
  if (/\breturned to ready\b/i.test(combined) || /\bqueued\b/i.test(combined) || /\bentered\b/i.test(combined)) return "ready";
  if (/\bstarted\b/i.test(combined) || /\brunning\b/i.test(combined)) return "running";
  if (/\breview\b/i.test(combined)) return "review";
  if (/\bcompleted\b/i.test(combined) || /\breleased\b/i.test(combined) || /\bdone\b/i.test(combined)) return "done";
  return undefined;
};

const sortHistoryEntries = <T extends { at: string }>(entries: T[]) =>
  [...entries].sort((left, right) => (parseTimestampMs(left.at) || 0) - (parseTimestampMs(right.at) || 0));

const dedupeHistoryEntries = (entries: MissionControlHistoryEntry[]) => {
  const seen = new Set<string>();
  return sortHistoryEntries(entries).filter((entry) => {
    const key = [
      entry.at,
      entry.action,
      entry.detail || "",
      entry.taskId || "",
      entry.lane || "",
      entry.status || "",
      entry.source
    ].join("::");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const normalizeHistoryEntries = ({
  value,
  source,
  taskId,
  taskTitle,
  defaultLane,
  defaultStatus
}: {
  value: unknown;
  source: MissionControlHistoryEntry["source"];
  taskId?: string;
  taskTitle?: string;
  defaultLane?: MissionControlTaskLane;
  defaultStatus?: MissionControlTaskStatus;
}) => {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      const entry = asObject(item);
      const at = asString(entry?.at);
      if (!at) return null;

      const action = asString(entry?.action) || (source === "derived-timestamp" ? "timestamp" : "update");
      const detail = asString(entry?.detail);
      const status =
        normalizeTaskStatus(entry?.status) ||
        inferHistoryStatus(action, detail) ||
        defaultStatus;
      const lane = normalizeLane(entry?.lane) || extractLane(detail) || defaultLane;
      const resolvedTaskId = asString(entry?.taskId) || extractTaskId(detail) || taskId;

      return {
        at,
        action,
        ...(detail ? { detail } : {}),
        ...(resolvedTaskId ? { taskId: resolvedTaskId } : {}),
        ...(taskTitle ? { taskTitle } : {}),
        ...(lane ? { lane } : {}),
        ...(status ? { status } : {}),
        source
      } satisfies MissionControlHistoryEntry;
    })
    .filter((entry): entry is MissionControlHistoryEntry => Boolean(entry));
};

const createDerivedTaskHistory = ({
  startedAt,
  lastWorkedAt,
  updatedAt,
  taskId,
  taskTitle,
  lane,
  status
}: {
  startedAt?: string;
  lastWorkedAt?: string;
  updatedAt: string;
  taskId: string;
  taskTitle: string;
  lane: MissionControlTaskLane;
  status: MissionControlTaskStatus;
}) => {
  const entries: MissionControlHistoryEntry[] = [];

  if (startedAt) {
    entries.push({
      at: startedAt,
      action: "started",
      detail: "Derived from task startedAt timestamp.",
      taskId,
      taskTitle,
      lane,
      status: "running",
      source: "derived-timestamp"
    });
  }

  if (lastWorkedAt && lastWorkedAt !== startedAt) {
    entries.push({
      at: lastWorkedAt,
      action: "worked",
      detail: "Derived from task lastWorkedAt timestamp.",
      taskId,
      taskTitle,
      lane,
      status,
      source: "derived-timestamp"
    });
  }

  if (updatedAt && updatedAt !== lastWorkedAt && updatedAt !== startedAt) {
    entries.push({
      at: updatedAt,
      action: "updated",
      detail: "Derived from task updatedAt timestamp.",
      taskId,
      taskTitle,
      lane,
      status,
      source: "derived-timestamp"
    });
  }

  return entries;
};

const resolveHistorySource = ({
  explicitCount,
  derivedCount,
  declared
}: {
  explicitCount: number;
  derivedCount: number;
  declared?: MissionControlHistorySource;
}) => {
  if (declared) return declared;
  if (explicitCount > 0) return "full-history";
  if (derivedCount > 1) return "partial-history";
  return "current-only";
};

const sortNewest = <T extends { updatedAt?: string }>(items: T[]) =>
  [...items].sort((left, right) => {
    const leftAt = parseTimestampMs(left.updatedAt) || 0;
    const rightAt = parseTimestampMs(right.updatedAt) || 0;
    return rightAt - leftAt;
  });

const normalizeIdeaStatus = (value: unknown): MissionControlIdeaStatus => {
  switch (value) {
    case "captured":
    case "clarifying":
    case "awaiting-confirmation":
    case "promoted":
    case "dropped":
      return value;
    default:
      return "captured";
  }
};

const normalizeFeatureStatus = (value: unknown): MissionControlFeatureStatus => {
  switch (value) {
    case "intake":
    case "researching":
    case "rfc-approved":
    case "building":
    case "qa":
    case "ready-to-release":
    case "released":
    case "blocked":
      return value;
    default:
      return "intake";
  }
};

const normalizeTaskStatus = (value: unknown): MissionControlTaskStatus => {
  switch (value) {
    case "ready":
    case "running":
    case "review":
    case "done":
    case "blocked":
      return value;
    default:
      return "ready";
  }
};

const normalizeLane = (value: unknown): MissionControlTaskLane => {
  switch (value) {
    case "research":
    case "build":
    case "qa":
    case "release":
      return value;
    default:
      return "research";
  }
};

const normalizeDeliveryMode = (value: unknown): MissionControlDeliveryMode => {
  switch (value) {
    case "advisory-only":
    case "local-only":
    case "commit-required":
    case "push-required":
    case "pr-required":
      return value;
    default:
      return "advisory-only";
  }
};

const normalizeIdea = (value: unknown): MissionControlIdeaSnapshot | null => {
  const entry = asObject(value);
  const ideaId = asString(entry?.ideaId);
  const title = asString(entry?.title);
  const updatedAt = asString(entry?.updatedAt);
  if (!ideaId || !title || !updatedAt) return null;

  return {
    ideaId,
    title,
    status: normalizeIdeaStatus(entry?.status),
    project: asString(entry?.project) || "default",
    workspace: asString(entry?.workspace) || "default",
    repo: asString(entry?.repo) || "unbound",
    featureId: asString(entry?.featureId) || null,
    updatedAt
  };
};

const normalizeFeature = (value: unknown): MissionControlFeatureSnapshot | null => {
  const entry = asObject(value);
  const featureId = asString(entry?.featureId);
  const title = asString(entry?.title);
  if (!featureId || !title) return null;

  const project = asString(entry?.project) || "default";
  const workspace = asString(entry?.workspace) || "default";
  const repo = asString(entry?.repo) || "unbound";
  const status = normalizeFeatureStatus(entry?.status);
  const deliveryMode = normalizeDeliveryMode(entry?.deliveryMode);
  const currentLane = normalizeLane(entry?.currentLane);
  const summary = asString(entry?.summary) || "";
  const artifactRoot = asString(entry?.artifactRoot) || "";
  const artifacts = asObject(entry?.artifacts);
  const delivery = asObject(entry?.delivery);
  const featureHistory = normalizeHistoryEntries({
    value: entry?.history,
    source: "feature-history"
  });
  const rawTasks = Array.isArray(entry?.tasks) ? entry?.tasks : [];

  const tasks = rawTasks
    .map((taskValue) => {
      const task = asObject(taskValue);
      const tqId = asString(task?.tqId);
      const taskTitle = asString(task?.title);
      const updatedAt = asString(task?.updatedAt);
      if (!tqId || !taskTitle || !updatedAt) return null;

      const startedAt = asString(task?.startedAt);
      const lastWorkedAt = asString(task?.lastWorkedAt);
      const nextPlannedStep = asString(task?.nextPlannedStep);
      const blockedReason = asString(task?.blockedReason);
      const waitingOn = asString(task?.waitingOn);
      const ownerAgentId = asString(task?.ownerAgentId);
      const ownerRoomId = asString(task?.ownerRoomId);
      const explicitTaskHistory = normalizeHistoryEntries({
        value: task?.history,
        source: "task-history",
        taskId: tqId,
        taskTitle,
        defaultLane: normalizeLane(task?.lane),
        defaultStatus: normalizeTaskStatus(task?.status)
      });
      const linkedFeatureHistory = featureHistory.filter((entry) => entry.taskId === tqId);
      const derivedTaskHistory = createDerivedTaskHistory({
        startedAt,
        lastWorkedAt,
        updatedAt,
        taskId: tqId,
        taskTitle,
        lane: normalizeLane(task?.lane),
        status: normalizeTaskStatus(task?.status)
      });
      const combinedHistory = dedupeHistoryEntries([
        ...explicitTaskHistory,
        ...linkedFeatureHistory,
        ...derivedTaskHistory
      ]);
      const historySource = resolveHistorySource({
        explicitCount: explicitTaskHistory.length + linkedFeatureHistory.length,
        derivedCount: derivedTaskHistory.length,
        declared: normalizeHistorySource(task?.historySource)
      });

      return {
        tqId,
        title: taskTitle,
        lane: normalizeLane(task?.lane),
        status: normalizeTaskStatus(task?.status),
        updatedAt,
        summary: asString(task?.summary) || "",
        featureId,
        featureTitle: title,
        featureStatus: status,
        linkedIdeaId: asString(entry?.linkedIdeaId) || null,
        project,
        workspace,
        repo,
        deliveryMode,
        history: combinedHistory,
        historySource,
        ...(startedAt ? { startedAt } : {}),
        ...(lastWorkedAt ? { lastWorkedAt } : {}),
        ...(nextPlannedStep ? { nextPlannedStep } : {}),
        ...(blockedReason ? { blockedReason } : {}),
        ...(waitingOn ? { waitingOn } : {}),
        ...(ownerAgentId ? { ownerAgentId } : {}),
        ...(ownerRoomId ? { ownerRoomId } : {})
      } satisfies MissionControlTaskSnapshot;
    })
    .filter((task): task is MissionControlTaskSnapshot => Boolean(task));

  const latestTaskAt = sortNewest(tasks)[0]?.updatedAt;
  const latestHistoryAt = [...featureHistory]
    .sort((left, right) => (parseTimestampMs(right.at) || 0) - (parseTimestampMs(left.at) || 0))[0]?.at;
  const featureHistorySource = resolveHistorySource({
    explicitCount: featureHistory.length,
    derivedCount: tasks.reduce((count, task) => count + task.history.filter((entry) => entry.source === "derived-timestamp").length, 0),
    declared: normalizeHistorySource(entry?.historySource)
  });

  return {
    featureId,
    title,
    status,
    project,
    workspace,
    repo,
    deliveryMode,
    linkedIdeaId: asString(entry?.linkedIdeaId) || null,
    currentLane,
    artifactRoot,
    artifacts: {
      brief: asString(artifacts?.brief) || "",
      rfc: asString(artifacts?.rfc) || "",
      qa: asString(artifacts?.qa) || "",
      release: asString(artifacts?.release) || ""
    },
    summary,
    delivery: {
      branch: asString(delivery?.branch) || "",
      prUrl: asString(delivery?.prUrl) || null,
      prMerged: Boolean(delivery?.prMerged),
      repoRoot: asString(delivery?.repoRoot) || ""
    },
    tasks: sortNewest(tasks),
    history: featureHistory,
    historySource: featureHistorySource,
    updatedAt: latestTaskAt || latestHistoryAt || new Date().toISOString()
  };
};

const flattenTasks = (features: MissionControlFeatureSnapshot[]) =>
  sortNewest(
    features.flatMap((feature) =>
      feature.tasks.map((task) => ({
        ...task,
        featureStatus: feature.status
      }))
    )
  );

const buildQueue = (tasks: MissionControlTaskSnapshot[]) => ({
  readyTasks: tasks.filter((task) => task.status === "ready"),
  runningTasks: tasks.filter((task) => task.status === "running"),
  reviewTasks: tasks.filter((task) => task.status === "review"),
  blockedTasks: tasks.filter((task) => task.status === "blocked")
});

const buildReview = (ideas: MissionControlIdeaSnapshot[], features: MissionControlFeatureSnapshot[]) => {
  const tasks = flattenTasks(features);
  return {
    ideasAwaitingConfirmation: sortNewest(
      ideas.filter(
        (idea) =>
          idea.status === "captured" || idea.status === "clarifying" || idea.status === "awaiting-confirmation"
      )
    ),
    featuresAwaitingPr: sortNewest(
      features.filter(
        (feature) =>
          feature.deliveryMode === "pr-required" &&
          !feature.delivery.prUrl &&
          feature.status === "ready-to-release"
      )
    ),
    featuresAwaitingMerge: sortNewest(
      features.filter(
        (feature) =>
          feature.deliveryMode === "pr-required" &&
          Boolean(feature.delivery.prUrl) &&
          !feature.delivery.prMerged
      )
    ),
    reviewTasks: sortNewest(tasks.filter((task) => task.status === "review"))
  };
};

const resolveWorkerSnapshot = (
  value: WorkerHeartbeatRecord | undefined,
  queue: ReturnType<typeof buildQueue>
): MissionControlWorkerSnapshot => {
  const lastHeartbeatAt = asString(value?.at);
  const lastHeartbeatMs = parseTimestampMs(lastHeartbeatAt);
  const pollMs = asNumber(value?.pollMs);
  const freshnessWindow = typeof pollMs === "number" ? Math.max(HEARTBEAT_FRESHNESS_MS, pollMs * 6) : HEARTBEAT_FRESHNESS_MS;
  const connected = typeof lastHeartbeatMs === "number" ? Date.now() - lastHeartbeatMs <= freshnessWindow : false;

  return {
    connected,
    lastHeartbeatAt,
    pollMs,
    activeFeatures: asNumber(value?.activeFeatures) || 0,
    readyTasks: asNumber(value?.readyTasks) || queue.readyTasks.length,
    reviewTasks: asNumber(value?.reviewTasks) || queue.reviewTasks.length,
    blockedTasks: asNumber(value?.blockedTasks) || queue.blockedTasks.length,
    latestTask: value?.latestTask
      ? {
          tqId: asString(value.latestTask.tqId) || "",
          featureId: asString(value.latestTask.featureId) || "",
          lane: normalizeLane(value.latestTask.lane),
          status: normalizeTaskStatus(value.latestTask.status)
        }
      : undefined
  };
};

const buildSnapshot = ({
  state,
  heartbeat,
  sourceKind,
  pathLabel,
  heartbeatLabel,
  sourceLabel,
  notes
}: {
  state: MissionControlStateRecord;
  heartbeat?: WorkerHeartbeatRecord;
  sourceKind: MissionControlSourceKind;
  pathLabel: string;
  heartbeatLabel: string;
  sourceLabel: string;
  notes?: string[];
}): MissionControlSnapshot => {
  const ideas = (state.ideas || [])
    .map((value) => normalizeIdea(value))
    .filter((value): value is MissionControlIdeaSnapshot => Boolean(value));
  const features = (state.features || [])
    .map((value) => normalizeFeature(value))
    .filter((value): value is MissionControlFeatureSnapshot => Boolean(value));
  const tasks = flattenTasks(features);
  const queue = buildQueue(tasks);
  const review = buildReview(ideas, features);
  const worker = resolveWorkerSnapshot(heartbeat, queue);
  const featureCountByRepo = new Set(features.map((feature) => feature.repo || feature.delivery.repoRoot).filter(Boolean));
  const updatedAt =
    sortNewest(features)[0]?.updatedAt ||
    sortNewest(ideas)[0]?.updatedAt ||
    worker.lastHeartbeatAt ||
    undefined;

  return {
    available: true,
    sourceKind,
    sourceLabel,
    updatedAt,
    path: pathLabel,
    heartbeatPath: heartbeatLabel,
    worker,
    stats: {
      ideas: ideas.length,
      awaitingIdeas: review.ideasAwaitingConfirmation.length,
      features: features.length,
      activeFeatures: features.filter((feature) => feature.status !== "released").length,
      releasedFeatures: features.filter((feature) => feature.status === "released").length,
      readyToRelease: features.filter((feature) => feature.status === "ready-to-release").length,
      tasks: tasks.length,
      openTasks: tasks.filter((task) => task.status !== "done").length,
      readyTasks: queue.readyTasks.length,
      runningTasks: queue.runningTasks.length,
      reviewTasks: queue.reviewTasks.length,
      blockedTasks: queue.blockedTasks.length,
      repos: featureCountByRepo.size
    },
    queue,
    review,
    features: sortNewest(features),
    notes
  };
};

export const readMissionControlSnapshot = async (): Promise<MissionControlSnapshot> => {
  const configuredHome = process.env.MISSION_CONTROL_HOME?.trim() || process.env.AGENT_LAUNCHPAD_HOME?.trim();
  const configuredStateFile =
    process.env.MISSION_CONTROL_STATE_FILE?.trim() || process.env.AGENT_LAUNCHPAD_STATE_FILE?.trim();
  const missionControlHome = configuredHome || DEFAULT_MISSION_CONTROL_HOME;
  const stateFile = configuredStateFile || path.join(missionControlHome, "archive-state.json");
  const heartbeatFile = path.join(missionControlHome, "worker-heartbeat.json");

  const pathLabel = formatDisplayPath(stateFile);
  const heartbeatLabel = formatDisplayPath(heartbeatFile);

  try {
    const heartbeat = (await pathExists(heartbeatFile))
      ? (JSON.parse(await fs.readFile(heartbeatFile, "utf8")) as WorkerHeartbeatRecord)
      : undefined;

    if (!(await pathExists(stateFile))) {
      return buildSnapshot({
        state: SAMPLE_STATE,
        heartbeat: heartbeat || SAMPLE_HEARTBEAT,
        sourceKind: "demo",
        sourceLabel: "bundled mission archive sample",
        pathLabel,
        heartbeatLabel,
        notes: [
          "Showing bundled mission control data because no local mission archive state file was found.",
          "Archived repo-bound task systems stay retired here; only personal research TQ records remain visible."
        ]
      });
    }

    const state = JSON.parse(await fs.readFile(stateFile, "utf8")) as MissionControlStateRecord;

    return buildSnapshot({
      state,
      heartbeat,
      sourceKind: "live",
      sourceLabel: pathLabel,
      pathLabel,
      heartbeatLabel
    });
  } catch (error) {
    return {
      available: false,
      sourceKind: "live",
      sourceLabel: pathLabel,
      path: pathLabel,
      heartbeatPath: heartbeatLabel,
      worker: {
        connected: false,
        activeFeatures: 0,
        readyTasks: 0,
        reviewTasks: 0,
        blockedTasks: 0
      },
      stats: {
        ideas: 0,
        awaitingIdeas: 0,
        features: 0,
        activeFeatures: 0,
        releasedFeatures: 0,
        readyToRelease: 0,
        tasks: 0,
        openTasks: 0,
        readyTasks: 0,
        runningTasks: 0,
        reviewTasks: 0,
        blockedTasks: 0,
        repos: 0
      },
      queue: {
        readyTasks: [],
        runningTasks: [],
        reviewTasks: [],
        blockedTasks: []
      },
      review: {
        ideasAwaitingConfirmation: [],
        featuresAwaitingPr: [],
        featuresAwaitingMerge: [],
        reviewTasks: []
      },
      features: [],
      error: error instanceof Error ? error.message : "Unable to read mission control state."
    };
  }
};
