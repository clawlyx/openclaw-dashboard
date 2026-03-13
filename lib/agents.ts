import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

export type AgentWorkStatus = "active" | "blocked" | "waiting" | "idle" | "offline";
export type AgentRoomTone = "sage" | "clay" | "ocean" | "gold" | "berry" | "slate";
export type AgentActivityKind = "assistant" | "user" | "tool" | "system";
export type AgentQueueTone = "default" | "active" | "warning";
export type AgentActivityTone = "default" | "warning" | "success";

export type AgentRoomSnapshot = {
  id: string;
  label: string;
  description: string;
  tone: AgentRoomTone;
  lead?: string;
  capacity?: number;
};

export type AgentQueueSnapshot = {
  id: string;
  label: string;
  owner?: string;
  target?: string;
  count: number;
  tone?: AgentQueueTone;
};

export type AgentActivitySnapshot = {
  id: string;
  agentId: string;
  at: string;
  kind: AgentActivityKind;
  toolName?: string;
  summary?: string;
  detail?: string;
  tone?: AgentActivityTone;
};

export type AgentSnapshot = {
  id: string;
  name: string;
  role: string;
  roomId: string;
  status: AgentWorkStatus;
  currentTask?: string;
  focus?: string;
  model?: string;
  queueCount?: number;
  sessionCount: number;
  utilization?: number;
  nextHandoff?: string;
  lastEventAt?: string;
  latestActivityKind?: AgentActivityKind;
  latestToolName?: string;
};

export type AgentsSnapshot = {
  available: boolean;
  officeName?: string;
  updatedAt?: string;
  path?: string;
  rooms: AgentRoomSnapshot[];
  agents: AgentSnapshot[];
  queues: AgentQueueSnapshot[];
  recentEvents: AgentActivitySnapshot[];
  notes?: string[];
  error?: string;
};

type OpenClawHomeLike = {
  home: string;
  sourceKind: "default" | "custom" | "demo";
};

type ParsedSessionSignal = {
  lastEventAt?: string;
  lastEventAtMs?: number;
  latestActivityKind?: AgentActivityKind;
  latestToolName?: string;
  model?: string;
};

const ACTIVE_WINDOW_MS = 6 * 60 * 60 * 1000;
const WAITING_WINDOW_MS = 24 * 60 * 60 * 1000;
const IDLE_WINDOW_MS = 5 * 24 * 60 * 60 * 1000;
const MAX_ACTIVITY_ITEMS = 12;
const AGENT_DASHBOARD_CONFIG = "dashboard.json";

const DEFAULT_AGENT_ROOMS: AgentRoomSnapshot[] = [
  {
    id: "dispatch",
    label: "Dispatch Desk",
    description: "Routes fresh requests and cross-room handoffs.",
    tone: "sage",
    capacity: 2
  },
  {
    id: "research",
    label: "Research Bay",
    description: "Reference sweeps, product framing, and context gathering.",
    tone: "ocean",
    capacity: 3
  },
  {
    id: "build",
    label: "Build Bay",
    description: "Implementation work, coding loops, and automation tasks.",
    tone: "clay",
    capacity: 3
  },
  {
    id: "review",
    label: "Review Booth",
    description: "QA passes, report checks, and release sign-off.",
    tone: "berry",
    capacity: 2
  },
  {
    id: "release",
    label: "Release Dock",
    description: "Publishing, delivery, and outbound follow-through.",
    tone: "gold",
    capacity: 2
  },
  {
    id: "concierge",
    label: "Concierge Corner",
    description: "Personal and long-tail assistants waiting on the next ask.",
    tone: "slate",
    capacity: 2
  }
];

const AGENT_NAME_OVERRIDES: Record<string, string> = {
  main: "Main Console",
  "qa-agent": "QA Agent",
  "ops-agent": "Ops Agent",
  "local-agent": "Local Agent",
  "research-agent": "Research Agent",
  "product-agent": "Product Agent",
  "report-agent": "Report Agent",
  "coding-agent": "Coding Agent",
  "build-agent": "Build Agent",
  "release-agent": "Release Agent",
  "intake-agent": "Intake Agent",
  "family-agent": "Family Agent",
  "personal-assistant-agent": "Personal Assistant"
};

const AGENT_ROLE_OVERRIDES: Record<string, string> = {
  main: "Dispatcher",
  "intake-agent": "Triage Lead",
  "ops-agent": "Ops Support",
  "research-agent": "Research Lead",
  "product-agent": "Product Strategist",
  "report-agent": "Reporting Analyst",
  "coding-agent": "Builder",
  "build-agent": "Automation Builder",
  "qa-agent": "Quality Review",
  "release-agent": "Release Captain",
  "local-agent": "Local Helper",
  "family-agent": "Personal Assistant",
  "personal-assistant-agent": "Concierge"
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

const pathExists = async (target: string) => {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
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

const parseTimestampMs = (value?: string) => {
  if (!value) return undefined;
  const timestampMs = Date.parse(value);
  return Number.isFinite(timestampMs) ? timestampMs : undefined;
};

const normalizeAgentStatus = (value?: string): AgentWorkStatus | undefined => {
  switch (value) {
    case "active":
    case "blocked":
    case "waiting":
    case "idle":
    case "offline":
      return value;
    default:
      return undefined;
  }
};

const normalizeRoomTone = (value?: string): AgentRoomTone | undefined => {
  switch (value) {
    case "sage":
    case "clay":
    case "ocean":
    case "gold":
    case "berry":
    case "slate":
      return value;
    default:
      return undefined;
  }
};

const normalizeActivityKind = (value?: string): AgentActivityKind | undefined => {
  switch (value) {
    case "assistant":
    case "user":
    case "tool":
    case "system":
      return value;
    default:
      return undefined;
  }
};

const normalizeQueueTone = (value?: string): AgentQueueTone | undefined => {
  switch (value) {
    case "default":
    case "active":
    case "warning":
      return value;
    default:
      return undefined;
  }
};

const normalizeActivityTone = (value?: string): AgentActivityTone | undefined => {
  switch (value) {
    case "default":
    case "warning":
    case "success":
      return value;
    default:
      return undefined;
  }
};

const createDefaultRooms = () => DEFAULT_AGENT_ROOMS.map((room) => ({ ...room }));

const formatAgentName = (agentId: string) => {
  if (AGENT_NAME_OVERRIDES[agentId]) return AGENT_NAME_OVERRIDES[agentId];

  return agentId
    .replace(/-agent$/i, "")
    .split(/[-_]/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
};

const formatAgentRole = (agentId: string) => AGENT_ROLE_OVERRIDES[agentId] || "Agent Desk";

const resolveRoomId = (agentId: string) => {
  if (agentId === "main" || /intake|ops/.test(agentId)) return "dispatch";
  if (/research|product|report/.test(agentId)) return "research";
  if (/coding|build|local/.test(agentId)) return "build";
  if (/qa/.test(agentId)) return "review";
  if (/release/.test(agentId)) return "release";
  if (/family|personal/.test(agentId)) return "concierge";
  return "dispatch";
};

const getAgentLoadRank = (agent: AgentSnapshot) => {
  const statusScore =
    agent.status === "blocked"
      ? 40
      : agent.status === "active"
        ? 30
        : agent.status === "waiting"
          ? 20
          : agent.status === "idle"
            ? 10
            : 0;

  return statusScore + (agent.queueCount || 0) * 4 + Math.round((agent.utilization || 0) / 8);
};

const deriveStatus = ({
  sessionCount,
  lastEventAtMs
}: {
  sessionCount: number;
  lastEventAtMs?: number;
}): AgentWorkStatus => {
  if (sessionCount <= 0) return "offline";
  if (typeof lastEventAtMs !== "number") return "idle";

  const ageMs = Date.now() - lastEventAtMs;
  if (ageMs <= ACTIVE_WINDOW_MS) return "active";
  if (ageMs <= WAITING_WINDOW_MS) return "waiting";
  if (ageMs <= IDLE_WINDOW_MS) return "idle";
  return "offline";
};

const deriveQueueCount = (status: AgentWorkStatus, sessionCount: number) => {
  if (status === "blocked") return Math.max(2, Math.min(6, Math.ceil(sessionCount / 4) || 2));
  if (status === "active") return Math.max(1, Math.min(6, Math.ceil(sessionCount / 8) || 1));
  if (status === "waiting") return 1;
  return 0;
};

const deriveUtilization = (status: AgentWorkStatus, sessionCount: number) => {
  const base =
    status === "blocked"
      ? 82
      : status === "active"
        ? 72
        : status === "waiting"
          ? 48
          : status === "idle"
            ? 28
            : 8;

  return Math.max(6, Math.min(97, base + Math.min(18, sessionCount)));
};

const normalizeSessionEvent = (record: unknown) => {
  const entry = asObject(record);
  const timestamp = asString(entry?.timestamp);
  if (!timestamp) return null;

  if (entry?.type === "message") {
    const message = asObject(entry?.message);
    const role = asString(message?.role);

    if (role === "assistant") {
      return { at: timestamp, kind: "assistant" as const };
    }

    if (role === "user") {
      return { at: timestamp, kind: "user" as const };
    }

    if (role === "toolResult") {
      return {
        at: timestamp,
        kind: "tool" as const,
        toolName: asString(message?.toolName)
      };
    }
  }

  return {
    at: timestamp,
    kind: "system" as const
  };
};

const parseSessionSignal = async (sessionPath: string): Promise<ParsedSessionSignal> => {
  const lines = (await fs.readFile(sessionPath, "utf8")).split(/\r?\n/).filter(Boolean);
  let model: string | undefined;

  for (let index = 0; index < Math.min(20, lines.length); index += 1) {
    try {
      const record = JSON.parse(lines[index]) as unknown;
      const entry = asObject(record);
      if (entry?.type !== "model_change") continue;

      const modelId = asString(entry.modelId);
      const provider = asString(entry.provider);
      model = modelId && provider ? `${provider}/${modelId}` : modelId;
      break;
    } catch {
      continue;
    }
  }

  for (let index = lines.length - 1; index >= 0; index -= 1) {
    try {
      const event = normalizeSessionEvent(JSON.parse(lines[index]) as unknown);
      if (!event) continue;

      return {
        lastEventAt: event.at,
        lastEventAtMs: parseTimestampMs(event.at),
        latestActivityKind: event.kind,
        latestToolName: event.toolName,
        model
      };
    } catch {
      continue;
    }
  }

  return { model };
};

const withDerivedRoomLeads = (rooms: AgentRoomSnapshot[], agents: AgentSnapshot[]) =>
  rooms.map((room) => {
    const roomAgents = agents.filter((agent) => agent.roomId === room.id);
    const lead = room.lead || roomAgents.sort((left, right) => getAgentLoadRank(right) - getAgentLoadRank(left))[0]?.name;

    return {
      ...room,
      lead,
      capacity: room.capacity || Math.max(2, roomAgents.length)
    };
  });

const buildDerivedQueues = (rooms: AgentRoomSnapshot[], agents: AgentSnapshot[]): AgentQueueSnapshot[] => {
  const queues: AgentQueueSnapshot[] = [];

  for (const room of rooms) {
    const roomAgents = agents.filter((agent) => agent.roomId === room.id);
    const count = roomAgents.reduce((sum, agent) => sum + (agent.queueCount || 0), 0);

    if (count <= 0) continue;

    const owner = [...roomAgents].sort((left, right) => getAgentLoadRank(right) - getAgentLoadRank(left))[0]?.name;
    const tone = roomAgents.some((agent) => agent.status === "blocked")
      ? "warning"
      : roomAgents.some((agent) => agent.status === "active")
        ? "active"
        : "default";

    queues.push({
      id: `${room.id}-lane`,
      label: room.label,
      owner,
      target: room.label,
      count,
      tone
    });
  }

  return queues.sort((left, right) => right.count - left.count);
};

const buildDerivedEvents = (agents: AgentSnapshot[]): AgentActivitySnapshot[] =>
  agents
    .filter((agent) => agent.lastEventAt)
    .map((agent) => ({
      id: `${agent.id}:${agent.lastEventAt}`,
      agentId: agent.id,
      at: agent.lastEventAt as string,
      kind: agent.latestActivityKind || "system",
      toolName: agent.latestToolName
    }))
    .sort((left, right) => Date.parse(right.at) - Date.parse(left.at))
    .slice(0, MAX_ACTIVITY_ITEMS);

const resolveUpdatedAt = ({
  explicit,
  recentEvents,
  agents
}: {
  explicit?: string;
  recentEvents: AgentActivitySnapshot[];
  agents: AgentSnapshot[];
}) => {
  if (explicit) return explicit;
  if (recentEvents[0]?.at) return recentEvents[0].at;

  const latest = agents
    .map((agent) => agent.lastEventAt)
    .filter((value): value is string => Boolean(value))
    .sort((left, right) => Date.parse(right) - Date.parse(left))[0];

  return latest;
};

const readConfiguredAgentsSnapshot = async (openclawHome: OpenClawHomeLike): Promise<AgentsSnapshot | null> => {
  const configPath = path.join(openclawHome.home, "agents", AGENT_DASHBOARD_CONFIG);
  if (!(await pathExists(configPath))) return null;

  try {
    const raw = JSON.parse(await fs.readFile(configPath, "utf8")) as unknown;
    const data = asObject(raw);
    if (!data) return null;

    const fallbackRoomMap = Object.fromEntries(createDefaultRooms().map((room) => [room.id, room]));
    const configuredRooms: AgentRoomSnapshot[] = [];
    if (Array.isArray(data.rooms)) {
      for (const room of data.rooms) {
        const entry = asObject(room);
        const roomId = asString(entry?.id);
        if (!roomId) continue;

        const fallback = fallbackRoomMap[roomId];
        configuredRooms.push({
          id: roomId,
          label: asString(entry?.label) || fallback?.label || formatAgentName(roomId),
          description: asString(entry?.description) || fallback?.description || "",
          tone: normalizeRoomTone(asString(entry?.tone)) || fallback?.tone || "sage",
          lead: asString(entry?.lead),
          capacity: asNumber(entry?.capacity) || fallback?.capacity
        });
      }
    }

    const rooms = configuredRooms.length ? configuredRooms : createDefaultRooms();
    const validRoomIds = new Set(rooms.map((room) => room.id));

    const agentsList: AgentSnapshot[] = [];
    if (Array.isArray(data.agents)) {
      for (const agent of data.agents) {
        const entry = asObject(agent);
        const agentId = asString(entry?.id);
        if (!agentId) continue;

        const roomId = asString(entry?.roomId) || resolveRoomId(agentId);
        if (!validRoomIds.has(roomId)) continue;

        agentsList.push({
          id: agentId,
          name: asString(entry?.name) || formatAgentName(agentId),
          role: asString(entry?.role) || formatAgentRole(agentId),
          roomId,
          status: normalizeAgentStatus(asString(entry?.status)) || "idle",
          currentTask: asString(entry?.currentTask),
          focus: asString(entry?.focus),
          model: asString(entry?.model),
          queueCount: asNumber(entry?.queueCount),
          sessionCount: asNumber(entry?.sessionCount) || 0,
          utilization: asNumber(entry?.utilization),
          nextHandoff: asString(entry?.nextHandoff),
          lastEventAt: asString(entry?.lastEventAt),
          latestActivityKind: normalizeActivityKind(asString(entry?.latestActivityKind)),
          latestToolName: asString(entry?.latestToolName)
        });
      }
    }

    const agents = agentsList;

    if (!agents.length) return null;

    const recentEventsList: AgentActivitySnapshot[] = [];
    if (Array.isArray(data.recentEvents)) {
      for (const event of data.recentEvents) {
        const entry = asObject(event);
        const agentId = asString(entry?.agentId);
        const at = asString(entry?.at);
        if (!agentId || !at) continue;

        recentEventsList.push({
          id: asString(entry?.id) || `${agentId}:${at}`,
          agentId,
          at,
          kind: normalizeActivityKind(asString(entry?.kind)) || "system",
          toolName: asString(entry?.toolName),
          summary: asString(entry?.summary),
          detail: asString(entry?.detail),
          tone: normalizeActivityTone(asString(entry?.tone))
        });
      }
    }

    const recentEvents = recentEventsList
      .sort((left, right) => Date.parse(right.at) - Date.parse(left.at))
      .slice(0, MAX_ACTIVITY_ITEMS);

    const queueList: AgentQueueSnapshot[] = [];
    if (Array.isArray(data.queues)) {
      for (const queue of data.queues) {
        const entry = asObject(queue);
        const queueId = asString(entry?.id);
        const label = asString(entry?.label);
        const count = asNumber(entry?.count);
        if (!queueId || !label || typeof count !== "number") continue;

        queueList.push({
          id: queueId,
          label,
          owner: asString(entry?.owner),
          target: asString(entry?.target),
          count,
          tone: normalizeQueueTone(asString(entry?.tone))
        });
      }
    }

    const queues = queueList.sort((left, right) => right.count - left.count);

    const notes = Array.isArray(data.notes)
      ? data.notes.map((note) => asString(note)).filter((note): note is string => Boolean(note))
      : undefined;

    return {
      available: true,
      officeName: asString(data.officeName) || "OpenClaw Office",
      updatedAt: resolveUpdatedAt({
        explicit: asString(data.updatedAt),
        recentEvents,
        agents
      }),
      path: formatDisplayPath(configPath),
      rooms: withDerivedRoomLeads(rooms, agents),
      agents,
      queues,
      recentEvents,
      notes
    };
  } catch (error) {
    return {
      available: false,
      officeName: "OpenClaw Office",
      updatedAt: undefined,
      path: formatDisplayPath(configPath),
      rooms: [],
      agents: [],
      queues: [],
      recentEvents: [],
      error: error instanceof Error ? error.message : "Unable to read agents dashboard."
    };
  }
};

const readDerivedAgentsSnapshot = async (openclawHome: OpenClawHomeLike): Promise<AgentsSnapshot> => {
  const agentsRoot = path.join(openclawHome.home, "agents");
  const rooms = createDefaultRooms();
  const roomsWithAgents = new Set<string>();

  try {
    const entries = await fs.readdir(agentsRoot, { withFileTypes: true });
    const agents = await Promise.all(
      entries
        .filter((entry) => entry.isDirectory())
        .map(async (entry) => {
          const agentId = entry.name;
          const sessionsDirectory = path.join(agentsRoot, agentId, "sessions");

          let sessionFiles: string[] = [];
          try {
            const sessionEntries = await fs.readdir(sessionsDirectory, { withFileTypes: true });
            sessionFiles = sessionEntries
              .filter((sessionEntry) => sessionEntry.isFile() && sessionEntry.name.endsWith(".jsonl"))
              .map((sessionEntry) => path.join(sessionsDirectory, sessionEntry.name));
          } catch {
            sessionFiles = [];
          }

          const latestSessionFile = (
            await Promise.all(
              sessionFiles.map(async (filePath) => {
                const stats = await fs.stat(filePath);
                return {
                  filePath,
                  mtimeMs: stats.mtimeMs
                };
              })
            )
          ).sort((left, right) => right.mtimeMs - left.mtimeMs)[0];

          const parsedSignal = latestSessionFile ? await parseSessionSignal(latestSessionFile.filePath) : undefined;
          const lastEventAtMs = parsedSignal?.lastEventAtMs || latestSessionFile?.mtimeMs;
          const lastEventAt =
            parsedSignal?.lastEventAt ||
            (typeof latestSessionFile?.mtimeMs === "number" ? new Date(latestSessionFile.mtimeMs).toISOString() : undefined);
          const sessionCount = sessionFiles.length;
          const status = deriveStatus({
            sessionCount,
            lastEventAtMs
          });
          const roomId = resolveRoomId(agentId);

          roomsWithAgents.add(roomId);

          return {
            id: agentId,
            name: formatAgentName(agentId),
            role: formatAgentRole(agentId),
            roomId,
            status,
            focus: parsedSignal?.model,
            model: parsedSignal?.model,
            queueCount: deriveQueueCount(status, sessionCount),
            sessionCount,
            utilization: deriveUtilization(status, sessionCount),
            lastEventAt,
            latestActivityKind: parsedSignal?.latestActivityKind,
            latestToolName: parsedSignal?.latestToolName
          } satisfies AgentSnapshot;
        })
    );

    if (!agents.length) {
      return {
        available: false,
        officeName: "OpenClaw Office",
        updatedAt: undefined,
        path: formatDisplayPath(agentsRoot),
        rooms: [],
        agents: [],
        queues: [],
        recentEvents: [],
        error: "No agents were detected yet."
      };
    }

    const visibleRooms = rooms.filter((room) => roomsWithAgents.has(room.id));
    const hydratedRooms = withDerivedRoomLeads(visibleRooms.length ? visibleRooms : rooms, agents);
    const recentEvents = buildDerivedEvents(agents);

    return {
      available: true,
      officeName: "OpenClaw Office",
      updatedAt: resolveUpdatedAt({ recentEvents, agents }),
      path: formatDisplayPath(agentsRoot),
      rooms: hydratedRooms,
      agents: agents.sort((left, right) => getAgentLoadRank(right) - getAgentLoadRank(left)),
      queues: buildDerivedQueues(hydratedRooms, agents),
      recentEvents,
      notes:
        openclawHome.sourceKind === "demo"
          ? ["Showing bundled demo data because no local agent dashboard snapshot was found."]
          : undefined
    };
  } catch (error) {
    return {
      available: false,
      officeName: "OpenClaw Office",
      updatedAt: undefined,
      path: formatDisplayPath(agentsRoot),
      rooms: [],
      agents: [],
      queues: [],
      recentEvents: [],
      error: error instanceof Error ? error.message : "Unable to read agents."
    };
  }
};

export const readAgentsSnapshot = async (openclawHome: OpenClawHomeLike): Promise<AgentsSnapshot> => {
  const configuredSnapshot = await readConfiguredAgentsSnapshot(openclawHome);
  if (configuredSnapshot?.available) return configuredSnapshot;
  if (configuredSnapshot && !configuredSnapshot.available && configuredSnapshot.error) {
    return configuredSnapshot;
  }

  return readDerivedAgentsSnapshot(openclawHome);
};
