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
export type MissionControlDeliveryMode =
  | "advisory-only"
  | "local-only"
  | "commit-required"
  | "push-required"
  | "pr-required";

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
  summary: string;
  featureId: string;
  featureTitle: string;
  featureStatus: MissionControlFeatureStatus;
  linkedIdeaId: string | null;
  project: string;
  workspace: string;
  repo: string;
  deliveryMode: MissionControlDeliveryMode;
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

type LaunchpadStateRecord = {
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

const DEFAULT_LAUNCHPAD_HOME = path.join(os.homedir(), ".agent-launchpad");
const DEFAULT_STATE_FILE = path.join(DEFAULT_LAUNCHPAD_HOME, "data", "launchpad-state.json");
const DEFAULT_HEARTBEAT_FILE = path.join(DEFAULT_LAUNCHPAD_HOME, "runtime", "worker-heartbeat.json");
const HEARTBEAT_FRESHNESS_MS = 5 * 60 * 1000;

const SAMPLE_STATE: Required<LaunchpadStateRecord> = {
  ideas: [
    {
      ideaId: "IDEA-001",
      title: "OpenClaw Dashboard",
      status: "clarifying",
      project: "openclaw-dashboard",
      workspace: "openclaw-dashboard",
      repo: "openclaw-dashboard",
      featureId: "F-0001-openclaw-dashboard",
      updatedAt: "2026-03-10T11:15:00.000Z"
    },
    {
      ideaId: "IDEA-002",
      title: "Family Claw concierge",
      status: "awaiting-confirmation",
      project: "family-claw",
      workspace: "family-claw",
      repo: "family-claw",
      featureId: "F-0002-family-claw-concierge",
      updatedAt: "2026-03-10T09:42:00.000Z"
    }
  ],
  features: [
    {
      featureId: "F-0001-openclaw-dashboard",
      title: "OpenClaw Dashboard",
      status: "ready-to-release",
      project: "openclaw-dashboard",
      workspace: "openclaw-dashboard",
      repo: "openclaw-dashboard",
      deliveryMode: "pr-required",
      linkedIdeaId: "IDEA-001",
      currentLane: "release",
      artifactRoot: "/Users/clawlyx/Documents/GitHub/openclaw-dashboard/docs",
      artifacts: {
        brief: "docs/briefs/F-0001-openclaw-dashboard.md",
        rfc: "docs/rfc/F-0001-openclaw-dashboard.md",
        qa: "docs/qa/F-0001-openclaw-dashboard.md",
        release: "docs/release/F-0001-openclaw-dashboard.md"
      },
      summary: "The release PR is open and waiting for human review plus merge confirmation.",
      delivery: {
        branch: "feat/F-0001-openclaw-dashboard",
        prUrl: "https://github.com/clawlyx/openclaw-dashboard/pull/1",
        prMerged: false,
        repoRoot: "/Users/clawlyx/Documents/GitHub/openclaw-dashboard"
      },
      tasks: [
        {
          tqId: "TQ-091",
          title: "Research dashboard scope",
          lane: "research",
          status: "done",
          updatedAt: "2026-03-09T12:15:00.000Z",
          summary: "Finalized first-release scope and observability priorities."
        },
        {
          tqId: "TQ-092",
          title: "Implement dashboard shell",
          lane: "build",
          status: "done",
          updatedAt: "2026-03-09T18:05:00.000Z",
          summary: "Built the first dashboard layout and system panels."
        },
        {
          tqId: "TQ-093",
          title: "Validate dashboard release candidate",
          lane: "qa",
          status: "done",
          updatedAt: "2026-03-10T08:10:00.000Z",
          summary: "Completed manual UI checks and smoke validation."
        },
        {
          tqId: "TQ-097",
          title: "Open release PR",
          lane: "release",
          status: "review",
          updatedAt: "2026-03-10T10:44:00.000Z",
          summary: "PR is open and waiting for a merge decision."
        }
      ],
      history: [{ at: "2026-03-10T10:44:00.000Z" }]
    },
    {
      featureId: "F-0002-family-claw-concierge",
      title: "Family Claw concierge",
      status: "researching",
      project: "family-claw",
      workspace: "family-claw",
      repo: "family-claw",
      deliveryMode: "push-required",
      linkedIdeaId: "IDEA-002",
      currentLane: "research",
      artifactRoot: "/Users/clawlyx/Documents/GitHub/family-claw/docs",
      artifacts: {
        brief: "docs/briefs/F-0002-family-claw-concierge.md",
        rfc: "docs/rfc/F-0002-family-claw-concierge.md",
        qa: "docs/qa/F-0002-family-claw-concierge.md",
        release: "docs/release/F-0002-family-claw-concierge.md"
      },
      summary: "Research is still clarifying the first concierge delivery slice.",
      delivery: {
        branch: "feat/F-0002-family-claw-concierge",
        prUrl: null,
        prMerged: false,
        repoRoot: "/Users/clawlyx/Documents/GitHub/family-claw"
      },
      tasks: [
        {
          tqId: "TQ-101",
          title: "Research concierge experience",
          lane: "research",
          status: "running",
          updatedAt: "2026-03-10T10:12:00.000Z",
          summary: "Gathering first-release interaction patterns and concierge flows."
        }
      ],
      history: [{ at: "2026-03-10T10:12:00.000Z" }]
    }
  ]
};

const SAMPLE_HEARTBEAT: WorkerHeartbeatRecord = {
  at: "2026-03-10T07:11:00.021Z",
  pollMs: 15000,
  activeFeatures: 2,
  readyTasks: 0,
  reviewTasks: 1,
  blockedTasks: 0,
  latestTask: {
    tqId: "TQ-097",
    featureId: "F-0001-openclaw-dashboard",
    lane: "release",
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
  const history = Array.isArray(entry?.history) ? entry?.history : [];
  const rawTasks = Array.isArray(entry?.tasks) ? entry?.tasks : [];

  const tasks = rawTasks
    .map((taskValue) => {
      const task = asObject(taskValue);
      const tqId = asString(task?.tqId);
      const taskTitle = asString(task?.title);
      const updatedAt = asString(task?.updatedAt);
      if (!tqId || !taskTitle || !updatedAt) return null;

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
        deliveryMode
      } satisfies MissionControlTaskSnapshot;
    })
    .filter((task): task is MissionControlTaskSnapshot => Boolean(task));

  const latestTaskAt = sortNewest(tasks)[0]?.updatedAt;
  const latestHistoryAt = history
    .map((item) => asString(asObject(item)?.at))
    .filter((item): item is string => Boolean(item))
    .sort((left, right) => (parseTimestampMs(right) || 0) - (parseTimestampMs(left) || 0))[0];

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
  state: LaunchpadStateRecord;
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
  const configuredHome = process.env.AGENT_LAUNCHPAD_HOME?.trim();
  const configuredStateFile = process.env.AGENT_LAUNCHPAD_STATE_FILE?.trim();
  const launchpadHome = configuredHome || DEFAULT_LAUNCHPAD_HOME;
  const stateFile = configuredStateFile || path.join(launchpadHome, "data", "launchpad-state.json");
  const heartbeatFile = path.join(launchpadHome, "runtime", "worker-heartbeat.json");

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
        sourceLabel: "bundled launchpad sample",
        pathLabel,
        heartbeatLabel,
        notes: ["Showing bundled mission control data because no local Agent Launchpad state file was found."]
      });
    }

    const state = JSON.parse(await fs.readFile(stateFile, "utf8")) as LaunchpadStateRecord;

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
