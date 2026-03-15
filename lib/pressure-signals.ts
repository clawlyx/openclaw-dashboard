import type { AgentsSnapshot } from "@/lib/agents";
import type {
  MissionControlHistoryEntry,
  MissionControlHistorySource,
  MissionControlSnapshot,
  MissionControlTaskStatus,
  MissionControlTaskSnapshot
} from "@/lib/mission-control";

export type PressureSignalKind =
  | "stale-review"
  | "blocked-too-long"
  | "waiting-human"
  | "no-owner"
  | "room-overload";

export type PressureSignalSeverity = "critical" | "high" | "medium" | "low";

export type PressureLifecycleState = "new" | "sustained" | "slipping" | "recovering";
export type PressureLifecycleTrend = "worsening" | "improving" | "steady" | "unknown";
export type PressureLifecycleReasonKey =
  | "entered-pressure"
  | "pressure-worsened"
  | "pressure-held"
  | "left-pressure"
  | "recent-progress"
  | "partial-history"
  | "current-only";

export type PressureLifecycle = {
  state: PressureLifecycleState;
  trend: PressureLifecycleTrend;
  reasonKey: PressureLifecycleReasonKey;
  reasonText: string;
  previousStatus?: MissionControlTaskStatus;
  changedAt?: string;
};

export type PressureSignal = {
  id: string;
  kind: PressureSignalKind;
  severity: PressureSignalSeverity;
  roomId: string;
  agentId?: string;
  taskId?: string;
  featureId?: string;
  featureTitle?: string;
  taskTitle?: string;
  ageHours?: number;
  queueCount?: number;
  signalCount?: number;
  waitingOn?: string;
};

export type TaskHistoricalSignalMetrics = {
  taskId: string;
  roomId: string;
  source: MissionControlHistorySource;
  historyEntryCount: number;
  activeAgeHours: number;
  activityGapHours: number;
  currentWaitHours: number;
  reviewWaitHours?: number;
  blockedDurationHours?: number;
  startedAt?: string;
  statusEnteredAt?: string;
  lastActivityAt?: string;
  lifecycle: PressureLifecycle;
};

export type RoomHistoricalSignalMetrics = {
  roomId: string;
  source: MissionControlHistorySource;
  taskCount: number;
  longestActiveAgeHours: number;
  longestReviewWaitHours: number;
  longestBlockedDurationHours: number;
  longestActivityGapHours: number;
  lifecycle?: PressureLifecycle;
  lifecycleTaskCounts: Record<PressureLifecycleState, number>;
  lifecyclePrimaryTaskId?: string;
  lifecyclePrimaryTaskTitle?: string;
};

export type PressureSignalsModel = {
  signals: PressureSignal[];
  roomSignalCountByRoomId: Record<string, number>;
  roomPriorityByRoomId: Record<string, number>;
  roomTopSeverityByRoomId: Record<string, PressureSignalSeverity | undefined>;
  taskSignalCountByTaskId: Record<string, number>;
  taskTopSeverityByTaskId: Record<string, PressureSignalSeverity | undefined>;
  taskMetricsByTaskId: Record<string, TaskHistoricalSignalMetrics>;
  roomMetricsByRoomId: Record<string, RoomHistoricalSignalMetrics>;
};

const severityWeight: Record<PressureSignalSeverity, number> = {
  critical: 400,
  high: 300,
  medium: 200,
  low: 100
};

const lifecycleWeight: Record<PressureLifecycleState, number> = {
  slipping: 400,
  sustained: 300,
  new: 200,
  recovering: 100
};

const taskStatusWeight: Record<MissionControlTaskStatus, number> = {
  ready: 0,
  running: 1,
  review: 2,
  blocked: 3,
  done: -1
};

const asHours = (valueMs: number | undefined) => {
  if (typeof valueMs !== "number" || Number.isNaN(valueMs) || valueMs <= 0) return 0;
  return Math.max(0, valueMs / 3_600_000);
};

const parseTimestampMs = (value?: string) => {
  if (!value) return undefined;
  const timestampMs = Date.parse(value);
  return Number.isFinite(timestampMs) ? timestampMs : undefined;
};

const inferMissionRoomId = (task: MissionControlTaskSnapshot) => {
  if (task.status === "review" || task.lane === "qa") return "review";
  if (task.lane === "research") return "research";
  if (task.lane === "build") return "build";
  if (task.lane === "release") return "release";
  return "dispatch";
};

const resolveTaskRoomId = (task: MissionControlTaskSnapshot, agentRoomById: Map<string, string>) =>
  task.ownerRoomId || (task.ownerAgentId ? agentRoomById.get(task.ownerAgentId) : undefined) || inferMissionRoomId(task);

const isWaitingOnHuman = (value?: string) => Boolean(value && /(human|merge|approval|review)/i.test(value));
const sortHistoryEntries = (entries: MissionControlHistoryEntry[]) =>
  [...entries].sort((left, right) => (parseTimestampMs(left.at) || 0) - (parseTimestampMs(right.at) || 0));

const latestMatchingHistoryAt = ({
  task,
  match
}: {
  task: MissionControlTaskSnapshot;
  match: (entry: MissionControlHistoryEntry) => boolean;
}) => {
  const entries = sortHistoryEntries(task.history).filter(match);
  return entries.at(-1)?.at;
};

const pickHistorySource = (sources: MissionControlHistorySource[]): MissionControlHistorySource => {
  if (!sources.length) return "current-only";
  if (sources.includes("current-only")) return "current-only";
  if (sources.includes("partial-history")) return "partial-history";
  return "full-history";
};

const getPreviousDistinctStatus = (
  sortedHistory: MissionControlHistoryEntry[],
  currentStatus: MissionControlTaskStatus
): MissionControlTaskStatus | undefined => {
  const trail = sortedHistory
    .map((entry) => entry.status)
    .filter((status): status is MissionControlTaskStatus => Boolean(status));

  for (let index = trail.length - 1; index >= 0; index -= 1) {
    const status = trail[index];
    if (status !== currentStatus) return status;
  }

  return undefined;
};

const isPressureStatus = (status?: MissionControlTaskStatus) => status === "review" || status === "blocked";

const getLifecycleTrend = ({
  currentStatus,
  previousStatus
}: {
  currentStatus: MissionControlTaskStatus;
  previousStatus?: MissionControlTaskStatus;
}): PressureLifecycleTrend => {
  if (!previousStatus) return "unknown";

  const currentWeight = taskStatusWeight[currentStatus];
  const previousWeight = taskStatusWeight[previousStatus];

  if (currentWeight > previousWeight) return "worsening";
  if (currentWeight < previousWeight) return "improving";
  return "steady";
};

const formatLifecycleHours = (value?: number) => `${Math.max(1, Math.round(value || 0))}h`;
const getStatusLabel = (status: MissionControlTaskStatus) =>
  ({
    ready: "ready",
    running: "running",
    review: "review",
    blocked: "blocked",
    done: "done"
  })[status];

const buildTaskLifecycle = ({
  task,
  metrics,
  previousStatus
}: {
  task: MissionControlTaskSnapshot;
  metrics: Pick<
    TaskHistoricalSignalMetrics,
    "source" | "currentWaitHours" | "activityGapHours" | "historyEntryCount" | "statusEnteredAt"
  >;
  previousStatus?: MissionControlTaskStatus;
}): PressureLifecycle => {
  const trend = getLifecycleTrend({ currentStatus: task.status, previousStatus });
  const currentPressure = isPressureStatus(task.status) || isWaitingOnHuman(task.waitingOn);
  const hadPressureBefore = isPressureStatus(previousStatus);
  const recentWaitLabel = formatLifecycleHours(currentPressure ? metrics.currentWaitHours : metrics.activityGapHours);
  const changedAt = metrics.statusEnteredAt;

  if (task.status !== "done" && trend === "improving" && hadPressureBefore) {
    return {
      state: "recovering",
      trend,
      reasonKey: "left-pressure",
      reasonText: `Back to ${getStatusLabel(task.status)} after ${getStatusLabel(previousStatus)} with fresh activity in the last ${recentWaitLabel}.`,
      previousStatus,
      changedAt
    };
  }

  if (currentPressure) {
    if (metrics.currentWaitHours > 6) {
      return {
        state: "sustained",
        trend,
        reasonKey: "pressure-held",
        reasonText: `${getStatusLabel(task.status)} has held for ${formatLifecycleHours(metrics.currentWaitHours)} without clearing.`,
        previousStatus,
        changedAt
      };
    }

    if (trend === "worsening") {
      return {
        state: "slipping",
        trend,
        reasonKey: "pressure-worsened",
        reasonText: `${getStatusLabel(task.status)} followed ${getStatusLabel(previousStatus || task.status)} and is trending worse over the last ${recentWaitLabel}.`,
        previousStatus,
        changedAt
      };
    }

    if (metrics.currentWaitHours <= 6) {
      return {
        state: "new",
        trend,
        reasonKey: "entered-pressure",
        reasonText: `${getStatusLabel(task.status)} is fresh and entered within the last ${formatLifecycleHours(metrics.currentWaitHours)}.`,
        previousStatus,
        changedAt
      };
    }

    return {
      state: "new",
      trend,
      reasonKey: "entered-pressure",
      reasonText: `${getStatusLabel(task.status)} is fresh and entered within the last ${formatLifecycleHours(metrics.currentWaitHours)}.`,
      previousStatus,
      changedAt
    };
  }

  if (metrics.source === "current-only") {
    return {
      state: "new",
      trend,
      reasonKey: "current-only",
      reasonText: `Current-state-only history shows ${getStatusLabel(task.status)} with no deeper timeline yet.`,
      previousStatus,
      changedAt
    };
  }

  if (metrics.source === "partial-history" && metrics.historyEntryCount <= 2) {
    return {
      state: "recovering",
      trend,
      reasonKey: "partial-history",
      reasonText: `Partial history suggests ${getStatusLabel(task.status)} is stabilizing, but older transitions are missing.`,
      previousStatus,
      changedAt
    };
  }

  return {
    state: "recovering",
    trend,
    reasonKey: "recent-progress",
    reasonText: `Recent work shows ${getStatusLabel(task.status)} holding with no active pressure signal.`,
    previousStatus,
    changedAt
  };
};

export const buildTaskHistoricalSignalMetrics = ({
  task,
  roomId,
  nowMs
}: {
  task: MissionControlTaskSnapshot;
  roomId: string;
  nowMs: number;
}): TaskHistoricalSignalMetrics => {
  const sortedHistory = sortHistoryEntries(task.history);
  const firstHistoryAt = sortedHistory[0]?.at;
  const startedAt = task.startedAt || latestMatchingHistoryAt({ task, match: (entry) => entry.action === "started" || entry.status === "running" }) || firstHistoryAt;
  const lastActivityAt = task.lastWorkedAt || sortedHistory.at(-1)?.at || task.updatedAt;
  const statusEnteredAt =
    latestMatchingHistoryAt({
      task,
      match: (entry) => entry.status === task.status
    }) ||
    (task.status === "review"
      ? latestMatchingHistoryAt({ task, match: (entry) => entry.action.includes("review") })
      : task.status === "blocked"
        ? latestMatchingHistoryAt({ task, match: (entry) => entry.action.includes("block") || entry.status === "blocked" })
        : undefined) ||
    task.lastWorkedAt ||
    task.updatedAt;

  const startedAtMs = parseTimestampMs(startedAt) || parseTimestampMs(firstHistoryAt) || parseTimestampMs(task.updatedAt) || nowMs;
  const lastActivityMs = parseTimestampMs(lastActivityAt) || parseTimestampMs(task.updatedAt) || nowMs;
  const statusEnteredAtMs = parseTimestampMs(statusEnteredAt) || lastActivityMs;
  const activeAgeHours = asHours(nowMs - startedAtMs);
  const activityGapHours = asHours(nowMs - lastActivityMs);
  const currentWaitHours = asHours(nowMs - statusEnteredAtMs);
  const previousStatus = getPreviousDistinctStatus(sortedHistory, task.status);
  const lifecycle = buildTaskLifecycle({
    task,
    metrics: {
      source: task.historySource,
      currentWaitHours,
      activityGapHours,
      historyEntryCount: sortedHistory.length,
      statusEnteredAt
    },
    previousStatus
  });

  return {
    taskId: task.tqId,
    roomId,
    source: task.historySource,
    historyEntryCount: sortedHistory.length,
    activeAgeHours,
    activityGapHours,
    currentWaitHours,
    ...(task.status === "review" ? { reviewWaitHours: currentWaitHours } : {}),
    ...(task.status === "blocked" ? { blockedDurationHours: currentWaitHours } : {}),
    ...(startedAt ? { startedAt } : {}),
    ...(statusEnteredAt ? { statusEnteredAt } : {}),
    ...(lastActivityAt ? { lastActivityAt } : {})
    ,
    lifecycle
  };
};

const buildRoomHistoricalSignalMetrics = ({
  roomId,
  metrics,
  taskMetricsByTaskId,
  tasksByTaskId
}: {
  roomId: string;
  metrics: TaskHistoricalSignalMetrics[];
  taskMetricsByTaskId: Record<string, TaskHistoricalSignalMetrics>;
  tasksByTaskId: Record<string, MissionControlTaskSnapshot>;
}): RoomHistoricalSignalMetrics => {
  const lifecycleTaskCounts = metrics.reduce<Record<PressureLifecycleState, number>>(
    (accumulator, metric) => ({
      ...accumulator,
      [metric.lifecycle.state]: accumulator[metric.lifecycle.state] + 1
    }),
    { new: 0, sustained: 0, slipping: 0, recovering: 0 }
  );

  const primaryMetric =
    [...metrics].sort((left, right) => {
      const stateDelta = lifecycleWeight[right.lifecycle.state] - lifecycleWeight[left.lifecycle.state];
      if (stateDelta !== 0) return stateDelta;

      const waitDelta = (right.blockedDurationHours || right.reviewWaitHours || right.currentWaitHours || 0) -
        (left.blockedDurationHours || left.reviewWaitHours || left.currentWaitHours || 0);
      if (waitDelta !== 0) return waitDelta;

      return (right.activeAgeHours || 0) - (left.activeAgeHours || 0);
    })[0] || null;

  const primaryTask = primaryMetric ? tasksByTaskId[primaryMetric.taskId] : undefined;

  return {
    roomId,
    source: pickHistorySource(metrics.map((metric) => metric.source)),
    taskCount: metrics.length,
    longestActiveAgeHours: Math.max(0, ...metrics.map((metric) => metric.activeAgeHours || 0)),
    longestReviewWaitHours: Math.max(0, ...metrics.map((metric) => metric.reviewWaitHours || 0)),
    longestBlockedDurationHours: Math.max(0, ...metrics.map((metric) => metric.blockedDurationHours || 0)),
    longestActivityGapHours: Math.max(0, ...metrics.map((metric) => metric.activityGapHours || 0)),
    lifecycle: primaryMetric
      ? {
          ...taskMetricsByTaskId[primaryMetric.taskId].lifecycle,
          reasonText: primaryTask
            ? `${primaryTask.title}: ${taskMetricsByTaskId[primaryMetric.taskId].lifecycle.reasonText}`
            : taskMetricsByTaskId[primaryMetric.taskId].lifecycle.reasonText
        }
      : undefined,
    lifecycleTaskCounts,
    lifecyclePrimaryTaskId: primaryTask?.tqId,
    lifecyclePrimaryTaskTitle: primaryTask?.title
  };
};

const scoreSignal = (signal: PressureSignal) => severityWeight[signal.severity] + Math.round(signal.ageHours || 0);

const scoreRoom = ({
  queueCount,
  utilization,
  signalCount,
  blockedAgents
}: {
  queueCount: number;
  utilization: number;
  signalCount: number;
  blockedAgents: number;
}) => queueCount * 12 + utilization + signalCount * 35 + blockedAgents * 60;

const sortSignals = (left: PressureSignal, right: PressureSignal) => {
  const scoreDelta = scoreSignal(right) - scoreSignal(left);
  if (scoreDelta !== 0) return scoreDelta;

  const ageDelta = (right.ageHours || 0) - (left.ageHours || 0);
  if (ageDelta !== 0) return ageDelta;

  return (left.taskTitle || left.featureTitle || left.id).localeCompare(right.taskTitle || right.featureTitle || right.id);
};

export const buildPressureSignalsModel = ({
  agents,
  missionControl,
  generatedAt
}: {
  agents: AgentsSnapshot;
  missionControl: MissionControlSnapshot;
  generatedAt: string;
}): PressureSignalsModel => {
  const nowMs =
    parseTimestampMs(generatedAt) || parseTimestampMs(agents.updatedAt) || parseTimestampMs(missionControl.updatedAt) || Date.now();
  const agentRoomById = new Map(agents.agents.map((agent) => [agent.id, agent.roomId]));
  const signals: PressureSignal[] = [];
  const taskMetricsByTaskId: Record<string, TaskHistoricalSignalMetrics> = {};

  const openTasks = [
    ...missionControl.queue.blockedTasks,
    ...missionControl.queue.reviewTasks,
    ...missionControl.queue.runningTasks,
    ...missionControl.queue.readyTasks
  ];
  const tasksByTaskId = openTasks.reduce<Record<string, MissionControlTaskSnapshot>>((accumulator, task) => {
    accumulator[task.tqId] = task;
    return accumulator;
  }, {});

  openTasks.forEach((task) => {
    const roomId = resolveTaskRoomId(task, agentRoomById);
    const metrics = buildTaskHistoricalSignalMetrics({ task, roomId, nowMs });
    taskMetricsByTaskId[task.tqId] = metrics;
    const ageHours = metrics.activityGapHours;
    const base = {
      roomId,
      agentId: task.ownerAgentId,
      taskId: task.tqId,
      featureId: task.featureId,
      featureTitle: task.featureTitle,
      taskTitle: task.title,
      ageHours
    };

    if (task.status === "review" && (metrics.reviewWaitHours || 0) >= 12) {
      signals.push({
        id: `${task.tqId}:stale-review`,
        kind: "stale-review",
        severity:
          (metrics.reviewWaitHours || 0) >= 48 ? "critical" : (metrics.reviewWaitHours || 0) >= 24 ? "high" : "medium",
        ...base
      });
    }

    if (task.status === "blocked" && (metrics.blockedDurationHours || 0) >= 6) {
      signals.push({
        id: `${task.tqId}:blocked-too-long`,
        kind: "blocked-too-long",
        severity:
          (metrics.blockedDurationHours || 0) >= 24 ? "critical" : (metrics.blockedDurationHours || 0) >= 12 ? "high" : "medium",
        ...base
      });
    }

    if (isWaitingOnHuman(task.waitingOn) && metrics.currentWaitHours >= 3) {
      signals.push({
        id: `${task.tqId}:waiting-human`,
        kind: "waiting-human",
        severity: metrics.currentWaitHours >= 24 ? "high" : "medium",
        waitingOn: task.waitingOn,
        ...base
      });
    }

    if (!task.ownerAgentId && !task.ownerRoomId) {
      signals.push({
        id: `${task.tqId}:no-owner`,
        kind: "no-owner",
        severity: task.status === "review" || task.status === "blocked" ? "medium" : "low",
        ...base
      });
    }
  });

  const roomSignalsMap = new Map<string, PressureSignal[]>();
  signals.forEach((signal) => {
    const current = roomSignalsMap.get(signal.roomId) || [];
    roomSignalsMap.set(signal.roomId, [...current, signal]);
  });
  const roomMetricsByRoomId = agents.rooms.reduce<Record<string, RoomHistoricalSignalMetrics>>((accumulator, room) => {
    const roomMetrics = Object.values(taskMetricsByTaskId).filter((metric) => metric.roomId === room.id);
    accumulator[room.id] = buildRoomHistoricalSignalMetrics({
      roomId: room.id,
      metrics: roomMetrics,
      taskMetricsByTaskId,
      tasksByTaskId
    });
    return accumulator;
  }, {});

  agents.rooms.forEach((room) => {
    const roomAgents = agents.agents.filter((agent) => agent.roomId === room.id);
    const queueCount = roomAgents.reduce((sum, agent) => sum + (agent.queueCount || 0), 0);
    const utilization = Math.max(0, ...roomAgents.map((agent) => agent.utilization || 0));
    const blockedAgents = roomAgents.filter((agent) => agent.status === "blocked").length;
    const signalCount = roomSignalsMap.get(room.id)?.length || 0;

    if (queueCount >= 6 || utilization >= 75 || blockedAgents > 0 || signalCount >= 2) {
      const severity: PressureSignalSeverity =
        blockedAgents > 0 || queueCount >= 9 || signalCount >= 3 ? "high" : "medium";

      signals.push({
        id: `${room.id}:room-overload`,
        kind: "room-overload",
        severity,
        roomId: room.id,
        queueCount,
        signalCount
      });
    }
  });

  const sortedSignals = [...signals].sort(sortSignals);
  const roomSignalCountByRoomId = agents.rooms.reduce<Record<string, number>>((accumulator, room) => {
    accumulator[room.id] = sortedSignals.filter((signal) => signal.roomId === room.id).length;
    return accumulator;
  }, {});

  const taskSignalCountByTaskId = sortedSignals.reduce<Record<string, number>>((accumulator, signal) => {
    if (!signal.taskId) return accumulator;
    accumulator[signal.taskId] = (accumulator[signal.taskId] || 0) + 1;
    return accumulator;
  }, {});

  const taskTopSeverityByTaskId = sortedSignals.reduce<Record<string, PressureSignalSeverity | undefined>>(
    (accumulator, signal) => {
      if (!signal.taskId) return accumulator;

      const currentSeverity = accumulator[signal.taskId];
      if (!currentSeverity || severityWeight[signal.severity] > severityWeight[currentSeverity]) {
        accumulator[signal.taskId] = signal.severity;
      }

      return accumulator;
    },
    {}
  );

  const roomTopSeverityByRoomId = agents.rooms.reduce<Record<string, PressureSignalSeverity | undefined>>((accumulator, room) => {
    const roomSignals = sortedSignals.filter((signal) => signal.roomId === room.id);
    accumulator[room.id] = roomSignals[0]?.severity;
    return accumulator;
  }, {});

  const roomPriorityByRoomId = agents.rooms.reduce<Record<string, number>>((accumulator, room) => {
    const roomAgents = agents.agents.filter((agent) => agent.roomId === room.id);
    const queueCount = roomAgents.reduce((sum, agent) => sum + (agent.queueCount || 0), 0);
    const utilization = Math.max(0, ...roomAgents.map((agent) => agent.utilization || 0));
    const blockedAgents = roomAgents.filter((agent) => agent.status === "blocked").length;
    const signalCount = roomSignalCountByRoomId[room.id] || 0;

    accumulator[room.id] = scoreRoom({
      queueCount,
      utilization,
      signalCount,
      blockedAgents
    });
    return accumulator;
  }, {});

  return {
    signals: sortedSignals,
    roomSignalCountByRoomId,
    roomPriorityByRoomId,
    roomTopSeverityByRoomId,
    taskSignalCountByTaskId,
    taskTopSeverityByTaskId,
    taskMetricsByTaskId,
    roomMetricsByRoomId
  };
};
