"use client";

import { useMemo, useState, type KeyboardEvent } from "react";

import { SectionShell } from "@/components/section-shell";
import { formatDateTimeLabel } from "@/lib/dashboard-presenters";
import { formatMessage, type Locale } from "@/lib/i18n";
import type {
  AgentsSnapshot,
  AgentActivitySnapshot,
  AgentRoomSnapshot,
  AgentSnapshot,
  AgentWorkStatus
} from "@/lib/agents";

type AgentsVirtualOfficeMessages = {
  section: string;
  title: string;
  copy: string;
  virtualTitle: string;
  virtualDescription: string;
  virtualBoardTitle: string;
  virtualBoardCopy: string;
  summaryAgents: string;
  summaryAttention: string;
  summaryQueues: string;
  summaryRooms: string;
  statusActive: string;
  statusBlocked: string;
  statusWaiting: string;
  statusIdle: string;
  statusOffline: string;
  allRooms: string;
  roomFocus: string;
  roomFocusHint: string;
  roomLead: string;
  roomCapacity: string;
  roomQueue: string;
  roomEmpty: string;
  queueCount: string;
  utilization: string;
  sessionCount: string;
  focus: string;
  task: string;
  nextHandoff: string;
  lastEvent: string;
  updated: string;
  latest: string;
  noAgents: string;
  noAgentsHint: string;
  floorStatus: string;
  floorHealthy: string;
  floorAttention: string;
  floorHint: string;
  fallbackOffice: string;
  deskFeedTitle: string;
  deskFeedCopy: string;
  attentionTitle: string;
  attentionCopy: string;
  roomOccupancy: string;
  timelineTitle: string;
  timelineCopy: string;
  eventAssistant: string;
  eventUser: string;
  eventTool: string;
  eventToolWithName: string;
  eventSystem: string;
  liveTaskAssistant: string;
  liveTaskUser: string;
  liveTaskTool: string;
  liveTaskSystem: string;
  liveTaskIdle: string;
  liveTaskOffline: string;
};

type SceneSpot = {
  x: number;
  y: number;
};

type SceneSpotMode = "active" | "blocked" | "idle" | "waiting";

type ScenePlacement = {
  agent: AgentSnapshot;
  mode: SceneSpotMode;
  spot: SceneSpot;
};

type SceneArea = {
  x: number;
  y: number;
  w: number;
  h: number;
  labelX: number;
  labelY: number;
  overflowX: number;
  overflowY: number;
  seatSpots: SceneSpot[];
  focusSpots?: SceneSpot[];
};

const VIEWBOX_WIDTH = 160;
const VIEWBOX_HEIGHT = 96;
type SceneDensity = "overview" | "focus";

const SEAT_SCALE: Record<SceneDensity, number> = {
  overview: 0.82,
  focus: 1
};

const SPRITE_SCALE: Record<SceneDensity, number> = {
  overview: 0.88,
  focus: 1.02
};

const SCENE_AREAS: Record<string, SceneArea> = {
  dispatch: {
    x: 8,
    y: 14,
    w: 32,
    h: 30,
    labelX: 11,
    labelY: 20,
    overflowX: 31,
    overflowY: 20,
    seatSpots: [
      { x: 11, y: 27 },
      { x: 23, y: 21 },
      { x: 23, y: 30 },
      { x: 11, y: 33 }
    ],
    focusSpots: [
      { x: 11, y: 26 },
      { x: 23, y: 19 },
      { x: 23, y: 31 },
      { x: 11, y: 33 }
    ]
  },
  research: {
    x: 46,
    y: 8,
    w: 46,
    h: 32,
    labelX: 50,
    labelY: 14,
    overflowX: 83,
    overflowY: 14,
    seatSpots: [
      { x: 52, y: 18 },
      { x: 69, y: 18 },
      { x: 52, y: 28 },
      { x: 69, y: 28 },
      { x: 80, y: 20 }
    ],
    focusSpots: [
      { x: 51, y: 18 },
      { x: 70, y: 18 },
      { x: 51, y: 28 },
      { x: 70, y: 28 },
      { x: 80, y: 20 }
    ]
  },
  build: {
    x: 102,
    y: 8,
    w: 42,
    h: 32,
    labelX: 106,
    labelY: 14,
    overflowX: 134,
    overflowY: 14,
    seatSpots: [
      { x: 107, y: 18 },
      { x: 123, y: 18 },
      { x: 107, y: 28 },
      { x: 123, y: 28 }
    ],
    focusSpots: [
      { x: 107, y: 18 },
      { x: 123, y: 18 },
      { x: 107, y: 29 },
      { x: 123, y: 29 }
    ]
  },
  review: {
    x: 52,
    y: 56,
    w: 34,
    h: 24,
    labelX: 56,
    labelY: 62,
    overflowX: 77,
    overflowY: 62,
    seatSpots: [
      { x: 56, y: 63 },
      { x: 69, y: 60 },
      { x: 56, y: 69 },
      { x: 69, y: 69 }
    ],
    focusSpots: [
      { x: 56, y: 62 },
      { x: 69, y: 60 },
      { x: 56, y: 69 },
      { x: 69, y: 69 }
    ]
  },
  release: {
    x: 94,
    y: 54,
    w: 42,
    h: 26,
    labelX: 98,
    labelY: 60,
    overflowX: 126,
    overflowY: 60,
    seatSpots: [
      { x: 99, y: 60 },
      { x: 114, y: 58 },
      { x: 99, y: 68 },
      { x: 114, y: 68 }
    ],
    focusSpots: [
      { x: 99, y: 59 },
      { x: 114, y: 58 },
      { x: 99, y: 68 },
      { x: 114, y: 68 }
    ]
  },
  concierge: {
    x: 10,
    y: 56,
    w: 32,
    h: 24,
    labelX: 14,
    labelY: 62,
    overflowX: 31,
    overflowY: 62,
    seatSpots: [
      { x: 13, y: 60 },
      { x: 25, y: 58 },
      { x: 13, y: 68 },
      { x: 25, y: 68 }
    ],
    focusSpots: [
      { x: 13, y: 60 },
      { x: 25, y: 58 },
      { x: 13, y: 68 },
      { x: 25, y: 68 }
    ]
  }
};

const ROOM_SHORT_LABELS: Record<string, string> = {
  dispatch: "Dispatch",
  research: "Research",
  build: "Build",
  review: "Review",
  release: "Release",
  concierge: "Concierge"
};

const ROOM_PALETTES: Record<NonNullable<AgentRoomSnapshot["tone"]>, { floor: string; edge: string; label: string; detail: string }> =
  {
    sage: { floor: "#dce9df", edge: "#87a08f", label: "#446051", detail: "#b8d3bf" },
    clay: { floor: "#f2e1d8", edge: "#be9179", label: "#775243", detail: "#e4c3b2" },
    ocean: { floor: "#dce7f2", edge: "#7f97ba", label: "#3d5676", detail: "#b8cce4" },
    gold: { floor: "#f5ead0", edge: "#c1a26a", label: "#7a6432", detail: "#e7d19d" },
    berry: { floor: "#f1dfe6", edge: "#bb869a", label: "#73475b", detail: "#ddbdc9" },
    slate: { floor: "#e2e5ea", edge: "#96a0ad", label: "#4d5767", detail: "#c7ced8" }
  };

const STATUS_PALETTES: Record<AgentWorkStatus, { tone: string; glow: string; ink: string }> = {
  active: { tone: "#2f7f69", glow: "#9ce2ba", ink: "#17473b" },
  blocked: { tone: "#c55242", glow: "#f3b2a8", ink: "#6a2118" },
  waiting: { tone: "#c08a2c", glow: "#f5dea0", ink: "#69470c" },
  idle: { tone: "#8192a8", glow: "#d4dce8", ink: "#425065" },
  offline: { tone: "#9aa3af", glow: "#e2e6ec", ink: "#505965" }
};

const LOBSTER_PALETTE = {
  shell: "#dc5f4e",
  shellShade: "#a83d31",
  shellHighlight: "#f08b67",
  claw: "#c64a3d",
  leg: "#6c261f",
  face: "#f2d0b8",
  faceShade: "#ddb396",
  hair: "#5f3b2b",
  eye: "#2f1b14",
  blush: "#efab98",
  mouth: "#cf7c6d",
  mouthDark: "#8a3c3e"
};

const STATUS_PRIORITY: Record<AgentWorkStatus, number> = {
  blocked: 4,
  active: 3,
  waiting: 2,
  idle: 1,
  offline: 0
};

type LobsterAccessory = "beanie" | "beret" | "cap" | "glasses" | "headband" | "headset" | "visor";

type LobsterDeskProp = "badge" | "checklist" | "clipboard" | "flag" | "laptop" | "mug" | "notes";

type LobsterMotion = "paperwork" | "review" | "scan" | "signal" | "sip" | "typing" | "wave";

type LobsterPersona = {
  accessory: LobsterAccessory;
  deskProp: LobsterDeskProp;
  motion: LobsterMotion;
  trim: string;
  trimShadow: string;
};

const PERSONA_PRESETS: Record<string, LobsterPersona> = {
  main: { accessory: "headset", deskProp: "badge", motion: "signal", trim: "#2f7f69", trimShadow: "#17473b" },
  "intake-agent": { accessory: "cap", deskProp: "clipboard", motion: "paperwork", trim: "#c08a2c", trimShadow: "#7a5a17" },
  "research-agent": { accessory: "glasses", deskProp: "notes", motion: "scan", trim: "#5f8db0", trimShadow: "#38516f" },
  "product-agent": { accessory: "beret", deskProp: "mug", motion: "sip", trim: "#bb869a", trimShadow: "#73475b" },
  "coding-agent": { accessory: "visor", deskProp: "laptop", motion: "typing", trim: "#5b9bd5", trimShadow: "#31506f" },
  "qa-agent": { accessory: "headband", deskProp: "checklist", motion: "review", trim: "#c1a26a", trimShadow: "#7a6432" },
  "release-agent": { accessory: "cap", deskProp: "flag", motion: "wave", trim: "#c55242", trimShadow: "#6a2118" },
  "local-agent": { accessory: "beanie", deskProp: "mug", motion: "sip", trim: "#96a0ad", trimShadow: "#4d5767" }
};

const AGENT_MARKERS: Record<string, string> = {
  main: "MC",
  "intake-agent": "IN",
  "research-agent": "RS",
  "product-agent": "PD",
  "coding-agent": "CD",
  "qa-agent": "QA",
  "release-agent": "RL",
  "local-agent": "LC"
};

const parseTimestampMs = (value?: string) => {
  if (!value) return undefined;
  const valueMs = Date.parse(value);
  return Number.isFinite(valueMs) ? valueMs : undefined;
};

const getFallbackPersona = (roomId: string): LobsterPersona => {
  switch (roomId) {
    case "dispatch":
      return { accessory: "headset", deskProp: "badge", motion: "signal", trim: "#2f7f69", trimShadow: "#17473b" };
    case "research":
      return { accessory: "glasses", deskProp: "notes", motion: "scan", trim: "#5f8db0", trimShadow: "#38516f" };
    case "build":
      return { accessory: "visor", deskProp: "laptop", motion: "typing", trim: "#5b9bd5", trimShadow: "#31506f" };
    case "review":
      return { accessory: "headband", deskProp: "checklist", motion: "review", trim: "#c1a26a", trimShadow: "#7a6432" };
    case "release":
      return { accessory: "cap", deskProp: "flag", motion: "wave", trim: "#c55242", trimShadow: "#6a2118" };
    default:
      return { accessory: "beanie", deskProp: "mug", motion: "sip", trim: "#96a0ad", trimShadow: "#4d5767" };
  }
};

const getAgentPersona = (agent: AgentSnapshot): LobsterPersona => PERSONA_PRESETS[agent.id] || getFallbackPersona(agent.roomId);

const getAgentMarker = (agent: AgentSnapshot) =>
  AGENT_MARKERS[agent.id] ||
  agent.name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const getStatusLabel = (status: AgentWorkStatus, copy: AgentsVirtualOfficeMessages) => {
  switch (status) {
    case "active":
      return copy.statusActive;
    case "blocked":
      return copy.statusBlocked;
    case "waiting":
      return copy.statusWaiting;
    case "idle":
      return copy.statusIdle;
    case "offline":
      return copy.statusOffline;
  }
};

const getDeskTask = (agent: AgentSnapshot, copy: AgentsVirtualOfficeMessages, na: string) => {
  if (agent.currentTask) return agent.currentTask;

  if (agent.status === "offline") return copy.liveTaskOffline;
  if (agent.status === "idle") return copy.liveTaskIdle;

  if (agent.latestActivityKind === "tool") {
    return formatMessage(copy.liveTaskTool, { value: agent.latestToolName || copy.eventTool });
  }

  if (agent.latestActivityKind === "assistant") return copy.liveTaskAssistant;
  if (agent.latestActivityKind === "user") return copy.liveTaskUser;
  if (agent.latestActivityKind === "system") return copy.liveTaskSystem;

  return na;
};

const getEventSummary = (event: AgentActivitySnapshot, copy: AgentsVirtualOfficeMessages) => {
  if (event.summary) return event.summary;
  if (event.kind === "tool") {
    return event.toolName
      ? formatMessage(copy.eventToolWithName, { value: event.toolName })
      : copy.eventTool;
  }
  if (event.kind === "assistant") return copy.eventAssistant;
  if (event.kind === "user") return copy.eventUser;
  return copy.eventSystem;
};

const sortByLoad = (left: AgentSnapshot, right: AgentSnapshot) => {
  const leftScore = STATUS_PRIORITY[left.status] * 100 + (left.queueCount || 0) * 12 + (left.utilization || 0);
  const rightScore = STATUS_PRIORITY[right.status] * 100 + (right.queueCount || 0) * 12 + (right.utilization || 0);

  return rightScore - leftScore;
};

const getRoomStatus = (roomAgents: AgentSnapshot[]): AgentWorkStatus => {
  if (!roomAgents.length) return "offline";

  return [...roomAgents].sort((left, right) => STATUS_PRIORITY[right.status] - STATUS_PRIORITY[left.status])[0]?.status || "idle";
};

const getCompactRoomLabel = (roomId: string, roomLabel: string) => ROOM_SHORT_LABELS[roomId] || roomLabel.split(" ")[0] || roomLabel;

const getSceneViewBox = (area?: SceneArea, density: SceneDensity = "overview") => {
  if (!area) return `0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`;

  const padding = density === "focus" ? 4 : 6;
  const minX = Math.max(0, area.x - padding);
  const minY = Math.max(0, area.y - padding);
  const maxX = Math.min(VIEWBOX_WIDTH, area.x + area.w + padding);
  const maxY = Math.min(VIEWBOX_HEIGHT, area.y + area.h + padding);

  return `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;
};

const renderLobsterAccessory = (persona: LobsterPersona) => {
  const className = `pixelLobsterAccessory pixelLobsterAccessory${persona.accessory} pixelDeskMotion pixelDeskMotion${persona.motion}`;

  switch (persona.accessory) {
    case "headset":
      return (
        <g className={className}>
          <rect x={1} y={3} width={1} height={2} fill={persona.trimShadow} />
          <rect x={8} y={3} width={1} height={2} fill={persona.trimShadow} />
          <rect x={8} y={4} width={1} height={1} fill={persona.trim} />
          <rect x={7} y={4} width={1} height={1} fill={persona.trim} />
        </g>
      );
    case "glasses":
      return (
        <g className={className}>
          <rect x={3} y={3} width={1} height={1} fill={persona.trimShadow} />
          <rect x={7} y={3} width={1} height={1} fill={persona.trimShadow} />
          <rect x={4} y={3} width={3} height={1} fill={persona.trim} opacity={0.38} />
        </g>
      );
    case "headband":
      return (
        <g className={className}>
          <rect x={3} y={1} width={4} height={1} fill={persona.trim} />
          <rect x={5} y={0} width={1} height={1} fill={persona.trimShadow} />
        </g>
      );
    case "cap":
      return (
        <g className={className}>
          <rect x={2} y={1} width={4} height={1} fill={persona.trim} />
          <rect x={5} y={2} width={2} height={1} fill={persona.trimShadow} />
          <rect x={6} y={1} width={1} height={1} fill={persona.trimShadow} />
        </g>
      );
    case "beret":
      return (
        <g className={className}>
          <rect x={2} y={1} width={4} height={1} fill={persona.trim} />
          <rect x={2} y={2} width={2} height={1} fill={persona.trimShadow} />
          <rect x={3} y={0} width={1} height={1} fill={persona.trim} />
        </g>
      );
    case "visor":
      return (
        <g className={className}>
          <rect x={2} y={1} width={5} height={1} fill={persona.trim} />
          <rect className="pixelLobsterAccessoryLens" x={3} y={2} width={4} height={1} fill="#dff7ff" opacity={0.8} />
        </g>
      );
    case "beanie":
      return (
        <g className={className}>
          <rect x={2} y={1} width={4} height={1} fill={persona.trim} />
          <rect x={4} y={0} width={1} height={1} fill={persona.trim} />
        </g>
      );
  }
};

const renderLobsterFace = (status: AgentWorkStatus, persona: LobsterPersona) => {
  const eyesClosed = status === "offline";
  const warmExpression = status === "idle" || status === "waiting";
  const tenseExpression = status === "blocked";

  return (
    <>
      <rect x={3} y={2} width={5} height={4} fill={LOBSTER_PALETTE.face} />
      <rect x={4} y={2} width={3} height={1} fill={LOBSTER_PALETTE.hair} />
      <rect x={3} y={3} width={1} height={1} fill={LOBSTER_PALETTE.faceShade} />
      <rect x={7} y={3} width={1} height={1} fill={LOBSTER_PALETTE.faceShade} />

      {eyesClosed ? (
        <>
          <rect x={4} y={3} width={1} height={1} fill={LOBSTER_PALETTE.hair} />
          <rect x={6} y={3} width={1} height={1} fill={LOBSTER_PALETTE.hair} />
        </>
      ) : (
        <>
          <rect x={4} y={3} width={1} height={1} fill={LOBSTER_PALETTE.eye} />
          <rect x={6} y={3} width={1} height={1} fill={LOBSTER_PALETTE.eye} />
        </>
      )}

      {warmExpression ? (
        <>
          <rect x={3} y={4} width={1} height={1} fill={LOBSTER_PALETTE.blush} />
          <rect x={7} y={4} width={1} height={1} fill={LOBSTER_PALETTE.blush} />
        </>
      ) : null}

      <rect x={5} y={4} width={1} height={1} fill={LOBSTER_PALETTE.faceShade} />
      <rect
        x={tenseExpression ? 4 : 5}
        y={5}
        width={tenseExpression ? 3 : 1}
        height={1}
        fill={tenseExpression ? LOBSTER_PALETTE.mouthDark : LOBSTER_PALETTE.mouth}
      />
      {renderLobsterAccessory(persona)}
    </>
  );
};

const getSeatMode = (agent: AgentSnapshot): SceneSpotMode => {
  if (agent.status === "blocked") return "blocked";
  if (agent.status === "active") return "active";
  if (agent.status === "waiting") return "waiting";
  return "idle";
};

const renderLobsterSprite = ({
  agent,
  density,
  showMarker
}: {
  agent: AgentSnapshot;
  density: SceneDensity;
  showMarker: boolean;
}) => {
  const persona = getAgentPersona(agent);
  const marker = getAgentMarker(agent);
  const tone = STATUS_PALETTES[agent.status];
  const animated = agent.status === "active" || agent.status === "waiting";

  return (
    <g transform={`scale(${SPRITE_SCALE[density]})`}>
      {showMarker ? (
        <g className={`pixelLobsterMarker pixelLobsterMarker${agent.status}`}>
          <rect x={1.5} y={-4.8} width={7} height={2.4} fill={persona.trimShadow} />
          <rect x={1.5} y={-4.1} width={7} height={1.7} fill="#fff9f1" />
          <text
            x={5}
            y={-2.7}
            fill={persona.trimShadow}
            fontFamily="monospace"
            fontSize="1.75"
            fontWeight="700"
            letterSpacing="0.08em"
            textAnchor="middle"
          >
            {marker}
          </text>
        </g>
      ) : null}

      <g className={`pixelLobster ${animated ? "pixelLobsterBusy" : "pixelLobsterIdle"} pixelLobster${agent.status}`}>
        <rect className="pixelLobsterGlow" x={0} y={0} width={10} height={8} fill={tone.glow} />
        <rect x={3} y={0} width={1} height={1} fill={LOBSTER_PALETTE.shellShade} />
        <rect x={6} y={0} width={1} height={1} fill={LOBSTER_PALETTE.shellShade} />
        <rect x={2} y={1} width={1} height={1} fill={LOBSTER_PALETTE.shellHighlight} />
        <rect x={8} y={1} width={1} height={1} fill={LOBSTER_PALETTE.shellHighlight} />
        <rect x={3} y={1} width={5} height={1} fill={LOBSTER_PALETTE.shellHighlight} />
        <rect x={2} y={2} width={1} height={4} fill={LOBSTER_PALETTE.shell} />
        <rect x={8} y={2} width={1} height={4} fill={LOBSTER_PALETTE.shell} />
        <rect x={2} y={6} width={1} height={1} fill={LOBSTER_PALETTE.shellShade} />
        <rect x={8} y={6} width={1} height={1} fill={LOBSTER_PALETTE.shellShade} />
        {renderLobsterFace(agent.status, persona)}
        <rect x={3} y={5} width={1} height={1} fill={persona.trim} />
        <rect x={7} y={5} width={1} height={1} fill={persona.trim} />
        <rect x={2} y={6} width={7} height={1} fill={LOBSTER_PALETTE.shell} />
        <rect x={3} y={6} width={1} height={1} fill={LOBSTER_PALETTE.shellShade} />
        <rect x={7} y={6} width={1} height={1} fill={LOBSTER_PALETTE.shellShade} />
        <rect x={4} y={6} width={2} height={1} fill="#fff9f1" />
        <rect x={5} y={6} width={1} height={1} fill={persona.trimShadow} />
        <rect x={1} y={4} width={1} height={2} fill={LOBSTER_PALETTE.claw} />
        <rect x={9} y={4} width={1} height={2} fill={LOBSTER_PALETTE.claw} />
        <rect x={4} y={7} width={1} height={1} fill={LOBSTER_PALETTE.leg} />
        <rect x={6} y={7} width={1} height={1} fill={LOBSTER_PALETTE.leg} />
      </g>

      <g className={`pixelLobsterBadge pixelLobsterBadge${agent.status}`}>
        <rect x={4} y={-1} width={2} height={1} fill={tone.glow} />
        {agent.status === "blocked" ? (
          <>
            <rect x={5} y={-2} width={1} height={1} fill={tone.tone} />
            <rect x={5} y={0} width={1} height={1} fill={tone.tone} />
          </>
        ) : agent.status === "waiting" ? (
          <rect x={5} y={-2} width={1} height={2} fill={tone.tone} />
        ) : agent.status === "active" ? (
          <>
            <rect x={3} y={-2} width={1} height={1} fill={tone.tone} />
            <rect x={6} y={-2} width={1} height={1} fill={tone.tone} />
          </>
        ) : null}
      </g>
    </g>
  );
};

const renderSceneSeat = ({
  agent,
  density,
  mode,
  spot,
  showMarker
}: {
  agent: AgentSnapshot;
  density: SceneDensity;
  mode: SceneSpotMode;
  spot: SceneSpot;
  showMarker: boolean;
}) => {
  const persona = getAgentPersona(agent);
  const tone = STATUS_PALETTES[agent.status];
  const seatScale = SEAT_SCALE[density];

  switch (mode) {
    case "active":
      return (
        <g key={`${agent.id}:${spot.x}:${spot.y}`} transform={`translate(${spot.x} ${spot.y}) scale(${seatScale})`}>
          <rect x={0} y={11} width={16} height={3} fill="#795c49" />
          <rect x={2} y={8} width={5} height={3} fill="#fffaf3" />
          <rect x={10} y={7} width={4} height={3} fill="#2b3641" />
          <rect x={11} y={8} width={2} height={1} fill={tone.glow} />
          <rect x={6} y={13} width={3} height={1} fill="#624432" />
          <rect x={1} y={7} width={1} height={2} fill={persona.trim} />
          <g transform="translate(3 0)">{renderLobsterSprite({ agent, density, showMarker })}</g>
        </g>
      );
    case "waiting":
      return (
        <g key={`${agent.id}:${spot.x}:${spot.y}`} transform={`translate(${spot.x} ${spot.y}) scale(${seatScale})`}>
          <rect x={1} y={11} width={11} height={2} fill="#a67c5e" />
          <rect x={13} y={7} width={2} height={4} fill="#d0b087" />
          <rect x={13} y={6} width={2} height={1} fill="#fff3b0" />
          <rect x={0} y={8} width={2} height={3} fill="#876958" />
          <g transform="translate(2 0)">{renderLobsterSprite({ agent, density, showMarker })}</g>
        </g>
      );
    case "blocked":
      return (
        <g key={`${agent.id}:${spot.x}:${spot.y}`} transform={`translate(${spot.x} ${spot.y}) scale(${seatScale})`}>
          <rect x={0} y={10} width={12} height={4} fill="#9a6c59" />
          <rect x={4} y={11} width={4} height={1} fill="#6c4638" />
          <rect x={13} y={7} width={2} height={5} fill={tone.tone} />
          <rect x={12} y={6} width={4} height={2} fill={tone.glow} />
          <rect x={2} y={8} width={1} height={2} fill="#f8fafc" />
          <g transform="translate(2 0)">{renderLobsterSprite({ agent, density, showMarker })}</g>
        </g>
      );
    case "idle":
      return (
        <g key={`${agent.id}:${spot.x}:${spot.y}`} transform={`translate(${spot.x} ${spot.y}) scale(${seatScale})`}>
          <rect x={0} y={10} width={12} height={4} fill="#d8c5ae" />
          <rect x={1} y={8} width={10} height={2} fill="#eee3d3" />
          <rect x={13} y={11} width={2} height={2} fill={persona.trim} />
          <rect x={14} y={10} width={1} height={1} fill="#fff8f2" />
          <g transform="translate(2 0)">{renderLobsterSprite({ agent, density, showMarker })}</g>
        </g>
      );
  }
};

const renderRoomDecoration = (
  roomId: string,
  area: SceneArea,
  palette: { detail: string; edge: string },
  roomStatus: AgentWorkStatus
) => {
  const statusTone = STATUS_PALETTES[roomStatus];

  switch (roomId) {
    case "dispatch":
      return (
        <>
          <rect x={area.x + 3} y={area.y + 5} width={10} height={3} fill={palette.detail} />
          <rect x={area.x + 17} y={area.y + 5} width={7} height={2} fill={palette.edge} />
          <rect x={area.x + 24} y={area.y + 8} width={4} height={7} fill="#b48a69" />
          <rect x={area.x + 24} y={area.y + 10} width={4} height={1} fill="#7a5e46" />
        </>
      );
    case "research":
      return (
        <>
          <rect x={area.x + 3} y={area.y + 5} width={9} height={7} fill="#8a6d5c" />
          <rect x={area.x + 5} y={area.y + 7} width={5} height={1} fill="#d9c8b3" />
          <rect x={area.x + 30} y={area.y + 5} width={10} height={5} fill="#f2f6fb" />
          <rect x={area.x + 31} y={area.y + 6} width={8} height={1} fill={palette.edge} />
          <rect x={area.x + 17} y={area.y + 23} width={11} height={4} fill="#cab39c" />
        </>
      );
    case "build":
      return (
        <>
          <rect x={area.x + 27} y={area.y + 5} width={8} height={12} fill="#5c6674" />
          <rect x={area.x + 29} y={area.y + 7} width={4} height={1} fill="#a2f3c1" />
          <rect x={area.x + 29} y={area.y + 10} width={4} height={1} fill="#a2f3c1" />
          <rect x={area.x + 6} y={area.y + 21} width={12} height={4} fill="#8f735d" />
          <rect x={area.x + 8} y={area.y + 20} width={2} height={1} fill="#2b3641" />
        </>
      );
    case "review":
      return (
        <>
          <rect x={area.x + 3} y={area.y + 6} width={8} height={5} fill="#f7eee2" />
          <rect x={area.x + 12} y={area.y + 5} width={10} height={2} fill="#b48a69" />
          <rect x={area.x + 22} y={area.y + 8} width={5} height={7} fill="#d9c8b3" />
        </>
      );
    case "release":
      return (
        <>
          <rect x={area.x + 26} y={area.y + 6} width={8} height={7} fill="#8f735d" />
          <rect x={area.x + 28} y={area.y + 8} width={4} height={1} fill="#624432" />
          <rect x={area.x + 28} y={area.y + 11} width={4} height={1} fill="#624432" />
          <rect x={area.x + 30} y={area.y + 4} width={2} height={2} fill={statusTone.tone} />
        </>
      );
    case "concierge":
      return (
        <>
          <rect x={area.x + 3} y={area.y + 7} width={9} height={5} fill="#d8c5ae" />
          <rect x={area.x + 13} y={area.y + 9} width={6} height={3} fill="#b48a69" />
          <rect x={area.x + 21} y={area.y + 6} width={5} height={9} fill="#7f97ba" />
          <rect x={area.x + 22} y={area.y + 8} width={3} height={1} fill="#dff7ff" />
        </>
      );
    default:
      return null;
  }
};

const getScenePlacements = (roomAgents: AgentSnapshot[], area: SceneArea, density: SceneDensity) => {
  const spots = density === "focus" && area.focusSpots?.length ? area.focusSpots : area.seatSpots;

  return roomAgents.slice(0, spots.length).map((agent, index) => ({
    agent,
    mode: getSeatMode(agent),
    spot: spots[index]
  }));
};

export function AgentsVirtualOfficePanel({
  id,
  agents,
  locale,
  copy,
  common
}: {
  id?: string;
  agents: AgentsSnapshot;
  locale: Locale;
  copy: AgentsVirtualOfficeMessages;
  common: { na: string; unavailable: string };
}) {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const officeName = agents.officeName || copy.fallbackOffice;
  const onlineAgents = agents.agents.filter((agent) => agent.status !== "offline");
  const blockedAgents = agents.agents.filter((agent) => agent.status === "blocked");
  const queueTotal = agents.agents.reduce((sum, agent) => sum + (agent.queueCount || 0), 0);
  const updatedLabel = formatDateTimeLabel(parseTimestampMs(agents.updatedAt), locale, common.na);
  const latestEventLabel = formatDateTimeLabel(parseTimestampMs(agents.recentEvents[0]?.at), locale, common.na);
  const agentNameById = useMemo(() => new Map(agents.agents.map((agent) => [agent.id, agent.name])), [agents.agents]);

  const summaryCards = [
    { label: copy.summaryAgents, value: String(onlineAgents.length) },
    { label: copy.summaryAttention, value: String(blockedAgents.length), warning: blockedAgents.length > 0 },
    { label: copy.summaryQueues, value: String(queueTotal) },
    { label: copy.summaryRooms, value: String(agents.rooms.length) }
  ];

  const roomEntries = useMemo(
    () =>
      agents.rooms.map((room) => {
        const roomAgents = agents.agents.filter((agent) => agent.roomId === room.id).sort(sortByLoad);
        const roomQueue = roomAgents.reduce((sum, agent) => sum + (agent.queueCount || 0), 0);
        const roomCapacity = room.capacity || Math.max(2, roomAgents.length);
        const roomLead = room.lead || roomAgents[0]?.name || common.na;
        const roomStatus = getRoomStatus(roomAgents);
        const area = SCENE_AREAS[room.id];

        return {
          room,
          roomAgents,
          roomQueue,
          roomCapacity,
          roomLead,
          roomStatus,
          area,
          occupancy: `${roomAgents.length}/${roomCapacity}`
        };
      }),
    [agents.agents, agents.rooms, common.na]
  );

  const selectedRoomEntry = roomEntries.find(({ room }) => room.id === selectedRoomId) || null;
  const selectedAgentIds = new Set(selectedRoomEntry?.roomAgents.map((agent) => agent.id) || []);
  const deskFeedAgents = [...(selectedRoomEntry ? selectedRoomEntry.roomAgents : onlineAgents)]
    .filter((agent) => agent.status !== "offline")
    .sort(sortByLoad)
    .slice(0, 4);
  const attentionAgents = [...(selectedRoomEntry ? selectedRoomEntry.roomAgents : agents.agents)]
    .filter((agent) => agent.status === "blocked" || (agent.status === "waiting" && (agent.queueCount || 0) >= 2))
    .sort(sortByLoad)
    .slice(0, 4);
  const timelineEvents = (selectedRoomEntry
    ? agents.recentEvents.filter((event) => selectedAgentIds.has(event.agentId))
    : agents.recentEvents
  ).slice(0, 5);
  const activeViewBox = getSceneViewBox(selectedRoomEntry?.area, selectedRoomEntry ? "focus" : "overview");
  const activeRoomLabel = selectedRoomEntry?.room.label || copy.allRooms;
  const activeRoomToneClass = `virtualOfficeSceneTone${selectedRoomEntry?.room.id || "all"}`;

  const toggleRoomFocus = (roomId: string | null) => {
    setSelectedRoomId((current) => (current === roomId ? null : roomId));
  };

  const handleRoomSpriteKeyDown = (event: KeyboardEvent<SVGGElement>, roomId: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleRoomFocus(roomId);
    }
  };

  if (!agents.available || agents.agents.length === 0) {
    return (
      <SectionShell id={id} eyebrow={copy.section} title={copy.title} description={copy.copy}>
        <div className="emptyState">
          <p>{agents.error || copy.noAgents}</p>
          <p>{copy.noAgentsHint}</p>
          {agents.path ? (
            <p>
              <code>{agents.path}</code>
            </p>
          ) : null}
        </div>
      </SectionShell>
    );
  }

  return (
    <section id={id} className="sectionAnchor virtualOfficeShell" aria-labelledby={`${id || "agents"}-virtual-office-title`}>
      <h2 id={`${id || "agents"}-virtual-office-title`} className="visuallyHidden">
        {copy.virtualTitle}
      </h2>
      <p className="visuallyHidden">{copy.virtualDescription}</p>

      <div className="virtualOfficePanel">
        <article className="virtualOfficeBoard virtualOfficeHero">
          <div className={`virtualOfficeScene virtualOfficeHeroScene ${selectedRoomEntry ? "virtualOfficeSceneFocused" : ""} ${activeRoomToneClass}`}>
            <div className="virtualOfficeSceneHud">
              <div className="virtualOfficeSceneBadge">
                <p className="eyebrow">{officeName}</p>
                <strong>{copy.virtualBoardTitle}</strong>
              </div>
              <div className="virtualOfficeLegend">
                {(["active", "waiting", "blocked", "idle", "offline"] as const).map((status) => (
                  <span key={status} className={`virtualOfficeLegendChip virtualOfficeLegendChip${status}`}>
                    {getStatusLabel(status, copy)}
                  </span>
                ))}
              </div>
            </div>

            <svg aria-label={copy.virtualTitle} className="virtualOfficeCanvas" viewBox={activeViewBox} role="img" shapeRendering="crispEdges">
              <defs>
                <pattern id="panorama-floor" width="8" height="8" patternUnits="userSpaceOnUse">
                  <rect width="8" height="8" fill="#d6c6b3" />
                  <rect width="4" height="4" fill="#deceba" />
                  <rect x="4" y="4" width="4" height="4" fill="#cdbba7" />
                </pattern>
                {roomEntries.map(({ room, area }) =>
                  area ? (
                    <clipPath key={`clip:${room.id}`} id={`scene-room-clip-${room.id}`} clipPathUnits="userSpaceOnUse">
                      <rect x={area.x + 1} y={area.y + 1} width={area.w - 2} height={area.h - 2} />
                    </clipPath>
                  ) : null
                )}
              </defs>

              <rect width={VIEWBOX_WIDTH} height={VIEWBOX_HEIGHT} fill="#b9a894" />
              <rect x={3} y={3} width={VIEWBOX_WIDTH - 6} height={VIEWBOX_HEIGHT - 6} fill="url(#panorama-floor)" stroke="#8e7b67" />
              <rect x={10} y={8} width={20} height={3} fill="#f4ecde" />
              <rect x={40} y={8} width={22} height={3} fill="#f4ecde" />
              <rect x={74} y={8} width={22} height={3} fill="#f4ecde" />
              <rect x={108} y={8} width={22} height={3} fill="#f4ecde" />
              <rect x={142} y={8} width={8} height={3} fill="#f4ecde" />

              <rect x={42} y={42} width={62} height={2} fill="#e4d2bc" />
              <rect x={80} y={24} width={2} height={34} fill="#e4d2bc" />
              <rect x={24} y={54} width={118} height={2} fill="#e4d2bc" />

              <rect x={67} y={37} width={26} height={16} fill="#d7cab5" />
              <rect x={70} y={40} width={20} height={10} fill="#efe3d0" />
              <rect x={76} y={32} width={8} height={5} fill="#8e735d" />
              <rect x={78} y={34} width={4} height={1} fill="#fff7eb" />
              <rect x={60} y={44} width={5} height={8} fill="#89a46c" />
              <rect x={95} y={44} width={5} height={8} fill="#89a46c" />
              <rect x={72} y={53} width={4} height={4} fill="#8f735d" />
              <rect x={84} y={53} width={4} height={4} fill="#8f735d" />

              {roomEntries.map(({ room, roomAgents, roomLead, roomStatus, area }) => {
                if (!area) return null;

                const density: SceneDensity = selectedRoomId === room.id ? "focus" : "overview";
                const placements = getScenePlacements(roomAgents, area, density);
                const overflowCount = Math.max(0, roomAgents.length - placements.length);
                const showRoomLead = selectedRoomId === room.id && roomAgents.length === 1;
                const palette = ROOM_PALETTES[room.tone];
                const statusTone = STATUS_PALETTES[roomStatus];

                return (
                  <g
                    key={room.id}
                    className={`virtualRoomSprite ${selectedRoomId === room.id ? "virtualRoomSpriteActive" : ""} ${
                      selectedRoomEntry && selectedRoomId !== room.id ? "virtualRoomSpriteMuted" : ""
                    }`}
                    aria-label={`${room.label} · ${getStatusLabel(roomStatus, copy)}`}
                    onClick={() => toggleRoomFocus(room.id)}
                    onKeyDown={(event) => handleRoomSpriteKeyDown(event, room.id)}
                    role="button"
                    tabIndex={0}
                  >
                    <rect x={area.x} y={area.y} width={area.w} height={area.h} fill={palette.floor} opacity={0.4} />
                    <rect x={area.x + 2} y={area.y + 2} width={area.w - 4} height={area.h - 4} fill={palette.detail} opacity={0.62} />
                    <rect
                      x={area.x + 1}
                      y={area.y + 1}
                      width={area.w - 2}
                      height={area.h - 2}
                      fill="none"
                      stroke={selectedRoomId === room.id ? statusTone.tone : palette.edge}
                      opacity={selectedRoomId === room.id ? 0.95 : 0.45}
                    />
                    <rect x={area.x + area.w - 5} y={area.y + 3} width={2} height={2} fill={statusTone.tone} />

                    <g clipPath={`url(#scene-room-clip-${room.id})`}>
                      {renderRoomDecoration(room.id, area, palette, roomStatus)}

                      <text x={area.labelX} y={area.labelY} fill={palette.label} fontFamily="monospace" fontSize="3">
                        {getCompactRoomLabel(room.id, room.label)}
                      </text>
                      {showRoomLead ? (
                        <text x={area.labelX} y={area.labelY + 4} fill={palette.edge} fontFamily="monospace" fontSize="2.2">
                          {roomLead}
                        </text>
                      ) : null}

                      {placements.map((placement) =>
                        renderSceneSeat({
                          agent: placement.agent,
                          density,
                          mode: placement.mode,
                          spot: placement.spot,
                          showMarker: selectedRoomEntry?.room.id === room.id
                        })
                      )}

                      {overflowCount > 0 ? (
                        <text x={area.overflowX} y={area.overflowY} fill={statusTone.ink} fontFamily="monospace" fontSize="3">
                          +{overflowCount}
                        </text>
                      ) : null}
                    </g>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="virtualOfficeHeroTop">
            <div>
              <p className="eyebrow">{copy.section}</p>
              <h3>{copy.virtualTitle}</h3>
              <p className="virtualOfficeBoardCopy">{copy.virtualBoardCopy}</p>
            </div>
          </div>

          <div className="virtualOfficeHeroMeta">
            <span className="metaChip">
              {copy.updated}: {updatedLabel}
            </span>
            <span className="metaChip">
              {copy.latest}: {latestEventLabel}
            </span>
            <span className="metaChip">
              {copy.floorStatus}: {blockedAgents.length > 0 ? copy.floorAttention : copy.floorHealthy}
            </span>
            <span className="metaChip">
              {copy.roomFocus}: {activeRoomLabel}
            </span>
          </div>

          <div className="virtualOfficeToolbar">
            <div className="virtualOfficeFilterBar" aria-label={copy.roomFocus}>
              <button
                type="button"
                className={`virtualOfficeFilter ${selectedRoomEntry ? "" : "virtualOfficeFilterActive"}`}
                onClick={() => setSelectedRoomId(null)}
              >
                {copy.allRooms}
              </button>
              {roomEntries.map(({ room, roomStatus }) => (
                <button
                  key={room.id}
                  type="button"
                  className={`virtualOfficeFilter ${selectedRoomId === room.id ? "virtualOfficeFilterActive" : ""} virtualOfficeFilter${roomStatus}`}
                  onClick={() => toggleRoomFocus(room.id)}
                >
                  {room.label}
                </button>
              ))}
            </div>
            <p className="virtualOfficeFocusHint">{copy.roomFocusHint}</p>
          </div>

          <div className="miniSummaryGrid virtualOfficeStatsGrid">
            {summaryCards.map((item) => (
              <article key={item.label} className={`miniSummaryCard ${item.warning ? "miniSummaryCardWarning" : ""}`}>
                <span className="miniSummaryLabel">{item.label}</span>
                <strong className="miniSummaryValue">{item.value}</strong>
              </article>
            ))}
          </div>
        </article>

        <div className="virtualOfficeLower">
          <div className="virtualRoomPulseGrid">
            {roomEntries.map(({ room, roomLead, roomQueue, occupancy, roomStatus }) => (
              <button
                key={room.id}
                type="button"
                className={`virtualRoomPulse virtualRoomPulseButton ${selectedRoomId === room.id ? "virtualRoomPulseActive" : ""} ${
                  selectedRoomEntry && selectedRoomId !== room.id ? "virtualRoomPulseMuted" : ""
                }`}
                onClick={() => toggleRoomFocus(room.id)}
              >
                <div className="virtualRoomPulseHead">
                  <strong>{room.label}</strong>
                  <span className={`virtualRoomStatus virtualRoomStatus${roomStatus}`}>{getStatusLabel(roomStatus, copy)}</span>
                </div>
                <p className="virtualRoomPulseCopy">
                  {copy.roomLead}: {roomLead}
                </p>
                <div className="virtualRoomPulseMeta">
                  <span>
                    {copy.roomOccupancy}: {occupancy}
                  </span>
                  <span>
                    {copy.roomQueue}: {roomQueue}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="virtualOfficeDigestGrid">
            <article className="virtualOfficeRail">
              <div className="virtualOfficeRailHeader">
                <div>
                  <p className="eyebrow">{activeRoomLabel}</p>
                  <h3>{copy.deskFeedTitle}</h3>
                </div>
                <p className="virtualOfficeRailCopy">{copy.deskFeedCopy}</p>
              </div>

              <div className="virtualDeskList">
                {deskFeedAgents.length ? (
                  deskFeedAgents.map((agent) => (
                    <article key={agent.id} className={`virtualDeskCard virtualDeskCard${agent.status}`}>
                      <div className="virtualDeskCardHead">
                        <strong>{agent.name}</strong>
                        <span>{getStatusLabel(agent.status, copy)}</span>
                      </div>
                      <p>{getDeskTask(agent, copy, common.unavailable)}</p>
                      <div className="virtualDeskCardMeta">
                        <span>
                          {copy.focus}: {agent.focus || common.na}
                        </span>
                        <span>
                          {copy.nextHandoff}: {agent.nextHandoff || common.na}
                        </span>
                        <span>
                          {copy.lastEvent}: {formatDateTimeLabel(parseTimestampMs(agent.lastEventAt), locale, common.na)}
                        </span>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="virtualOfficeEmpty">{copy.roomEmpty}</div>
                )}
              </div>
            </article>

            <article className="virtualOfficeRail">
              <div className="virtualOfficeRailHeader">
                <div>
                  <p className="eyebrow">{activeRoomLabel}</p>
                  <h3>{copy.attentionTitle}</h3>
                </div>
                <p className="virtualOfficeRailCopy">{copy.attentionCopy}</p>
              </div>

              <div className="virtualAlertList">
                {attentionAgents.length ? (
                  attentionAgents.map((agent) => (
                    <article key={agent.id} className={`virtualAlertItem virtualAlertItem${agent.status}`}>
                      <div className="virtualAlertItemHead">
                        <strong>{agent.name}</strong>
                        <span>{getStatusLabel(agent.status, copy)}</span>
                      </div>
                      <p>{getDeskTask(agent, copy, common.unavailable)}</p>
                      <div className="virtualDeskCardMeta">
                        <span>
                          {copy.queueCount}: {agent.queueCount || 0}
                        </span>
                        <span>
                          {copy.utilization}: {agent.utilization || 0}%
                        </span>
                        <span>
                          {copy.sessionCount}: {agent.sessionCount}
                        </span>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="virtualOfficeEmpty">{copy.floorHealthy}</div>
                )}
              </div>
            </article>

            <article className="virtualOfficeRail">
              <div className="virtualOfficeRailHeader">
                <div>
                  <p className="eyebrow">{activeRoomLabel}</p>
                  <h3>{copy.timelineTitle}</h3>
                </div>
                <p className="virtualOfficeRailCopy">{copy.timelineCopy}</p>
              </div>

              <div className="timelineList">
                {timelineEvents.length ? (
                  timelineEvents.map((event) => (
                    <article key={event.id} className={`timelineItem ${event.tone === "warning" ? "timelineItemWarning" : ""}`}>
                      <span className="timelineDot" />
                      <div className="timelineBody">
                        <div className="timelineHead">
                          <strong>{agentNameById.get(event.agentId) || common.na}</strong>
                          <span>{formatDateTimeLabel(parseTimestampMs(event.at), locale, common.na)}</span>
                        </div>
                        <p>{getEventSummary(event, copy)}</p>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="virtualOfficeEmpty">{copy.floorHealthy}</div>
                )}
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
