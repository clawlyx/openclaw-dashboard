import type { AgentsSnapshot } from "@/lib/agents";
import type { MissionControlSnapshot, MissionControlTaskSnapshot } from "@/lib/mission-control";

export type PressureSignalKind =
  | "stale-review"
  | "blocked-too-long"
  | "waiting-human"
  | "no-owner"
  | "room-overload";

export type PressureSignalSeverity = "critical" | "high" | "medium" | "low";

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

export type PressureSignalsModel = {
  signals: PressureSignal[];
  roomSignalCountByRoomId: Record<string, number>;
  roomPriorityByRoomId: Record<string, number>;
  roomTopSeverityByRoomId: Record<string, PressureSignalSeverity | undefined>;
  taskSignalCountByTaskId: Record<string, number>;
  taskTopSeverityByTaskId: Record<string, PressureSignalSeverity | undefined>;
};

const severityWeight: Record<PressureSignalSeverity, number> = {
  critical: 400,
  high: 300,
  medium: 200,
  low: 100
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

  const openTasks = [
    ...missionControl.queue.blockedTasks,
    ...missionControl.queue.reviewTasks,
    ...missionControl.queue.runningTasks,
    ...missionControl.queue.readyTasks
  ];

  openTasks.forEach((task) => {
    const roomId = resolveTaskRoomId(task, agentRoomById);
    const ageHours = asHours(nowMs - (parseTimestampMs(task.lastWorkedAt) || parseTimestampMs(task.updatedAt) || nowMs));
    const base = {
      roomId,
      agentId: task.ownerAgentId,
      taskId: task.tqId,
      featureId: task.featureId,
      featureTitle: task.featureTitle,
      taskTitle: task.title,
      ageHours
    };

    if (task.status === "review" && ageHours >= 12) {
      signals.push({
        id: `${task.tqId}:stale-review`,
        kind: "stale-review",
        severity: ageHours >= 48 ? "critical" : ageHours >= 24 ? "high" : "medium",
        ...base
      });
    }

    if (task.status === "blocked" && ageHours >= 6) {
      signals.push({
        id: `${task.tqId}:blocked-too-long`,
        kind: "blocked-too-long",
        severity: ageHours >= 24 ? "critical" : ageHours >= 12 ? "high" : "medium",
        ...base
      });
    }

    if (isWaitingOnHuman(task.waitingOn) && ageHours >= 3) {
      signals.push({
        id: `${task.tqId}:waiting-human`,
        kind: "waiting-human",
        severity: ageHours >= 24 ? "high" : "medium",
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
    taskTopSeverityByTaskId
  };
};
