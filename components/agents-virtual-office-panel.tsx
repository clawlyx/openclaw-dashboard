"use client";

import { useMemo, useState, type KeyboardEvent } from "react";

import { SectionShell } from "@/components/section-shell";
import { formatDateTimeLabel } from "@/lib/dashboard-presenters";
import { formatMessage, type Locale } from "@/lib/i18n";
import type { AgentsSnapshot, AgentRoomSnapshot, AgentSnapshot, AgentWorkStatus } from "@/lib/agents";

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
};

type RoomLayout = {
  x: number;
  y: number;
  w: number;
  h: number;
  slots: Array<{ x: number; y: number }>;
};

type LobsterAccessory = "beanie" | "cap" | "glasses" | "headband" | "headset" | "beret" | "visor";
type LobsterDeskProp = "badge" | "checklist" | "clipboard" | "flag" | "laptop" | "mug" | "notes";
type LobsterMotion = "paperwork" | "review" | "scan" | "signal" | "sip" | "typing" | "wave";

type LobsterPersona = {
  accessory: LobsterAccessory;
  deskProp: LobsterDeskProp;
  motion: LobsterMotion;
  trim: string;
  trimShadow: string;
};

const VIEWBOX_WIDTH = 112;
const VIEWBOX_HEIGHT = 76;
const DESK_WIDTH = 10;
const DESK_HEIGHT = 9;

const ROOM_LAYOUTS: Record<string, RoomLayout> = {
  dispatch: {
    x: 6,
    y: 8,
    w: 22,
    h: 35,
    slots: [
      { x: 9, y: 18 },
      { x: 9, y: 29 },
      { x: 9, y: 40 }
    ]
  },
  research: {
    x: 31,
    y: 8,
    w: 34,
    h: 22,
    slots: [
      { x: 35, y: 16 },
      { x: 48, y: 16 },
      { x: 35, y: 26 },
      { x: 48, y: 26 }
    ]
  },
  build: {
    x: 68,
    y: 8,
    w: 22,
    h: 22,
    slots: [
      { x: 72, y: 16 },
      { x: 72, y: 26 },
      { x: 72, y: 36 }
    ]
  },
  review: {
    x: 31,
    y: 34,
    w: 18,
    h: 18,
    slots: [
      { x: 34, y: 41 },
      { x: 34, y: 49 }
    ]
  },
  release: {
    x: 52,
    y: 34,
    w: 18,
    h: 18,
    slots: [
      { x: 55, y: 41 },
      { x: 55, y: 49 }
    ]
  },
  concierge: {
    x: 73,
    y: 34,
    w: 23,
    h: 18,
    slots: [
      { x: 77, y: 41 },
      { x: 89, y: 41 }
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
  eyeWhite: "#fff9f1",
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

const sortByLoad = (left: AgentSnapshot, right: AgentSnapshot) => {
  const leftScore = STATUS_PRIORITY[left.status] * 100 + (left.queueCount || 0) * 12 + (left.utilization || 0);
  const rightScore = STATUS_PRIORITY[right.status] * 100 + (right.queueCount || 0) * 12 + (right.utilization || 0);

  return rightScore - leftScore;
};

const getDeskTask = (agent: AgentSnapshot, fallback: string) => agent.currentTask || agent.focus || fallback;

const getRoomStatus = (roomAgents: AgentSnapshot[]): AgentWorkStatus => {
  if (!roomAgents.length) return "offline";

  return [...roomAgents].sort((left, right) => STATUS_PRIORITY[right.status] - STATUS_PRIORITY[left.status])[0]?.status || "idle";
};

const getCompactRoomLabel = (roomId: string, roomLabel: string) => ROOM_SHORT_LABELS[roomId] || roomLabel.split(" ")[0] || roomLabel;

const getRoomViewBox = (layout: RoomLayout, focused = false) => {
  if (focused) {
    const padding = 2;
    const minX = Math.max(0, layout.x - padding);
    const minY = Math.max(0, layout.y - padding);
    const maxX = Math.min(VIEWBOX_WIDTH, layout.x + layout.w + padding);
    const maxY = Math.min(VIEWBOX_HEIGHT, layout.y + layout.h + padding);

    return `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;
  }

  const slotXs = layout.slots.map((slot) => slot.x);
  const slotYs = layout.slots.map((slot) => slot.y);
  const horizontalPadding = 4;
  const topPadding = 4;
  const bottomPadding = 4;
  const minX = Math.max(0, Math.min(layout.x, Math.min(...slotXs)) - horizontalPadding);
  const minY = Math.max(0, Math.min(layout.y, Math.min(...slotYs) - 2) - topPadding);
  const maxX = Math.min(
    VIEWBOX_WIDTH,
    Math.max(layout.x + layout.w, Math.max(...slotXs) + DESK_WIDTH) + horizontalPadding
  );
  const maxY = Math.min(
    VIEWBOX_HEIGHT,
    Math.max(layout.y + layout.h, Math.max(...slotYs) + DESK_HEIGHT) + bottomPadding
  );

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

const renderDeskProp = (persona: LobsterPersona) => {
  const className = `pixelDeskProp pixelDeskProp${persona.deskProp} pixelDeskMotion pixelDeskMotion${persona.motion}`;

  switch (persona.deskProp) {
    case "badge":
      return (
        <g className={className}>
          <rect x={0} y={5} width={1} height={1} fill={persona.trim} />
        </g>
      );
    case "clipboard":
      return (
        <g className={className}>
          <rect x={0} y={4} width={1} height={2} fill="#ead7aa" />
          <rect x={0} y={4} width={1} height={1} fill={persona.trim} />
        </g>
      );
    case "notes":
      return (
        <g className={className}>
          <rect x={8} y={4} width={1} height={1} fill={persona.trim} />
          <rect x={9} y={4} width={1} height={1} fill="#fff3b0" />
        </g>
      );
    case "laptop":
      return (
        <g className={className}>
          <rect x={0} y={5} width={2} height={1} fill={persona.trimShadow} />
          <rect className="pixelDeskPropScreen" x={0} y={4} width={2} height={1} fill={persona.trim} />
        </g>
      );
    case "checklist":
      return (
        <g className={className}>
          <rect x={0} y={4} width={1} height={2} fill="#fff9f1" />
          <rect x={1} y={4} width={1} height={1} fill={persona.trim} />
        </g>
      );
    case "flag":
      return (
        <g className={className}>
          <rect x={9} y={2} width={1} height={3} fill={persona.trimShadow} />
          <rect className="pixelDeskPropBanner" x={8} y={2} width={2} height={1} fill={persona.trim} />
        </g>
      );
    case "mug":
      return (
        <g className={className}>
          <rect x={0} y={5} width={1} height={1} fill={persona.trim} />
          <rect x={1} y={5} width={1} height={1} fill="#fff9f1" />
          <rect className="pixelDeskPropSteam" x={1} y={3} width={1} height={1} fill="#efe7df" />
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

const renderRoomDecoration = (roomId: string, layout: RoomLayout, palette: { detail: string; edge: string }) => {
  switch (roomId) {
    case "dispatch":
      return (
        <>
          <rect x={layout.x + 3} y={layout.y + 5} width={10} height={2} fill={palette.detail} />
          <rect x={layout.x + 14} y={layout.y + 5} width={5} height={2} fill={palette.edge} />
        </>
      );
    case "research":
      return (
        <>
          <rect x={layout.x + 23} y={layout.y + 5} width={8} height={2} fill={palette.detail} />
          <rect x={layout.x + 23} y={layout.y + 8} width={8} height={1} fill={palette.edge} />
        </>
      );
    case "build":
      return (
        <>
          <rect x={layout.x + 13} y={layout.y + 5} width={5} height={9} fill={palette.detail} />
          <rect x={layout.x + 14} y={layout.y + 7} width={3} height={1} fill={palette.edge} />
          <rect x={layout.x + 14} y={layout.y + 10} width={3} height={1} fill={palette.edge} />
        </>
      );
    case "review":
      return <rect x={layout.x + 10} y={layout.y + 4} width={5} height={3} fill={palette.detail} />;
    case "release":
      return (
        <>
          <rect x={layout.x + 12} y={layout.y + 5} width={3} height={3} fill={palette.detail} />
          <rect x={layout.x + 9} y={layout.y + 8} width={4} height={3} fill={palette.edge} />
        </>
      );
    case "concierge":
      return (
        <>
          <rect x={layout.x + 11} y={layout.y + 5} width={7} height={3} fill={palette.detail} />
          <rect x={layout.x + 13} y={layout.y + 8} width={3} height={1} fill={palette.edge} />
        </>
      );
    default:
      return null;
  }
};

const renderDesk = ({
  slot,
  agent,
  label
}: {
  slot: { x: number; y: number };
  agent?: AgentSnapshot;
  label: string;
}) => {
  const tone = STATUS_PALETTES[agent?.status || "offline"];
  const busy = agent ? agent.status !== "idle" && agent.status !== "offline" : false;
  const persona = agent ? getAgentPersona(agent) : null;
  const marker = agent ? getAgentMarker(agent) : null;

  return (
    <g key={`${slot.x}:${slot.y}:${agent?.id || "empty"}`} transform={`translate(${slot.x} ${slot.y})`}>
      <rect x={0} y={7} width={DESK_WIDTH} height={2} fill="#8f735d" />
      <rect x={1} y={6} width={3} height={2} fill={agent ? "#f8fafc" : "#d8d9dd"} />
      <rect x={7} y={6} width={2} height={1} fill={agent ? tone.glow : "#c9cbd1"} />
      <rect x={4} y={8} width={2} height={1} fill="#6e5a4a" />
      {persona ? renderDeskProp(persona) : null}

      {agent && persona ? (
        <>
          {marker ? (
            <g className={`pixelLobsterMarker pixelLobsterMarker${agent.status}`}>
              <rect x={1} y={-6} width={8} height={3} fill={persona.trimShadow} />
              <rect x={1} y={-5} width={8} height={2} fill="#fff9f1" />
              <text
                x={5}
                y={-3.45}
                fill={persona.trimShadow}
                fontFamily="monospace"
                fontSize="2.1"
                fontWeight="700"
                letterSpacing="0.08em"
                textAnchor="middle"
              >
                {marker}
              </text>
            </g>
          ) : null}

          <g className={`pixelLobster ${busy ? "pixelLobsterBusy" : "pixelLobsterIdle"} pixelLobster${agent.status}`}>
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

          <title>{label}</title>
        </>
      ) : (
        <g className="pixelDeskEmpty">
          <rect x={3} y={2} width={4} height={3} fill="#b7bdc8" />
          <rect x={2} y={3} width={1} height={1} fill="#a8afb8" />
          <rect x={7} y={3} width={1} height={1} fill="#a8afb8" />
        </g>
      )}
    </g>
  );
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
        const roomLayout = ROOM_LAYOUTS[room.id];
        const occupancy = `${roomAgents.length}/${roomCapacity}`;

        return {
          room,
          roomAgents,
          roomQueue,
          roomCapacity,
          roomLead,
          roomStatus,
          roomLayout,
          occupancy
        };
      }),
    [agents.agents, agents.rooms, common.na]
  );

  const selectedRoomEntry = roomEntries.find(({ room }) => room.id === selectedRoomId) || null;
  const deskFeedAgents = [...(selectedRoomEntry ? selectedRoomEntry.roomAgents : onlineAgents)]
    .filter((agent) => agent.status !== "offline")
    .sort(sortByLoad)
    .slice(0, 6);
  const attentionAgents = [...(selectedRoomEntry ? selectedRoomEntry.roomAgents : agents.agents)]
    .filter((agent) => agent.status === "blocked" || (agent.status === "waiting" && (agent.queueCount || 0) >= 2))
    .sort(sortByLoad)
    .slice(0, 5);
  const activeViewBox = selectedRoomEntry?.roomLayout
    ? getRoomViewBox(selectedRoomEntry.roomLayout, true)
    : `0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`;
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
    <SectionShell id={id} eyebrow={copy.section} title={copy.virtualTitle} description={copy.virtualDescription}>
      <div className="miniSummaryGrid">
        {summaryCards.map((item) => (
          <article key={item.label} className={`miniSummaryCard ${item.warning ? "miniSummaryCardWarning" : ""}`}>
            <span className="miniSummaryLabel">{item.label}</span>
            <strong className="miniSummaryValue">{item.value}</strong>
          </article>
        ))}
      </div>

      <div className="agentMetaRow">
        <span className="metaChip">
          {copy.updated}: {updatedLabel}
        </span>
        <span className="metaChip">
          {copy.latest}: {latestEventLabel}
        </span>
        <span className="metaChip">
          {copy.floorStatus}: {blockedAgents.length > 0 ? copy.floorAttention : copy.floorHealthy}
        </span>
        <span className="metaChip">{formatMessage(copy.floorHint, { count: onlineAgents.length })}</span>
      </div>

      <div className="virtualOfficeLayout">
        <div className="virtualOfficeStage">
          <article className="virtualOfficeBoard">
            <div className="virtualOfficeBoardHeader">
              <div>
                <p className="eyebrow">{officeName}</p>
                <h3>{copy.virtualBoardTitle}</h3>
                <p className="virtualOfficeBoardCopy">{copy.virtualBoardCopy}</p>
                <div className="virtualOfficeToolbar">
                  <span className="metaChip">
                    {copy.roomFocus}: {activeRoomLabel}
                  </span>
                  <p className="virtualOfficeFocusHint">{copy.roomFocusHint}</p>
                </div>
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
              </div>

              <div className="virtualOfficeLegend">
                {(["active", "waiting", "blocked", "idle", "offline"] as const).map((status) => (
                  <span key={status} className={`virtualOfficeLegendChip virtualOfficeLegendChip${status}`}>
                    {getStatusLabel(status, copy)}
                  </span>
                ))}
              </div>
            </div>

            <div className={`virtualOfficeScene ${selectedRoomEntry ? "virtualOfficeSceneFocused" : ""} ${activeRoomToneClass}`}>
              <svg
                aria-label={copy.virtualTitle}
                className="virtualOfficeCanvas"
                viewBox={activeViewBox}
                role="img"
                shapeRendering="crispEdges"
              >
                <defs>
                  <pattern id="pixel-grid" width="4" height="4" patternUnits="userSpaceOnUse">
                    <rect width="4" height="4" fill="#ece7dc" />
                    <rect width="1" height="1" fill="#f5f2eb" />
                  </pattern>
                  {roomEntries.map(({ room, roomLayout }) => {
                    const layout = roomLayout || ROOM_LAYOUTS.concierge;

                    return (
                      <clipPath key={`clip:${room.id}`} id={`virtual-room-clip-${room.id}`} clipPathUnits="userSpaceOnUse">
                        <rect x={layout.x + 1} y={layout.y + 1} width={layout.w - 2} height={layout.h - 2} />
                      </clipPath>
                    );
                  })}
                </defs>

                <rect width={VIEWBOX_WIDTH} height={VIEWBOX_HEIGHT} rx={4} fill="#ddd8ce" />
                <rect x={2} y={2} width={VIEWBOX_WIDTH - 4} height={VIEWBOX_HEIGHT - 4} fill="url(#pixel-grid)" stroke="#9c9384" />
                <rect x={27} y={30} width={39} height={2} fill="#c6b7a0" />
                <rect x={66} y={30} width={6} height={2} fill="#c6b7a0" />
                <rect x={26} y={52} width={48} height={2} fill="#c6b7a0" />
                <rect x={46} y={24} width={10} height={5} fill="#b69170" stroke="#7c634a" />
                <rect x={48} y={22} width={2} height={2} fill="#a9815f" />
                <rect x={52} y={22} width={2} height={2} fill="#a9815f" />
                <rect x={8} y={58} width={8} height={3} fill="#8baa73" />
                <rect x={93} y={60} width={7} height={3} fill="#8baa73" />

                {roomEntries.map(({ room, roomAgents, roomQueue, roomStatus, roomLayout }) => {
                  const layout = roomLayout || ROOM_LAYOUTS.concierge;
                  const palette = ROOM_PALETTES[room.tone];
                  const statusTone = STATUS_PALETTES[roomStatus];
                  const overflowCount = Math.max(0, roomAgents.length - layout.slots.length);

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
                      <rect x={layout.x} y={layout.y} width={layout.w} height={layout.h} fill={palette.floor} stroke={palette.edge} />
                      <rect x={layout.x + layout.w - 4} y={layout.y + 2} width={2} height={2} fill={statusTone.tone} />
                      <g clipPath={`url(#virtual-room-clip-${room.id})`}>
                        <rect x={layout.x + 1} y={layout.y + 1} width={layout.w - 2} height={4} fill={palette.detail} />
                        <rect x={layout.x + layout.w - 7} y={layout.y + layout.h - 1} width={5} height={1} fill="#d8cfbf" />

                        {renderRoomDecoration(room.id, layout, palette)}

                        <text x={layout.x + 2} y={layout.y + 4} fill={palette.label} fontFamily="monospace" fontSize="3">
                          {getCompactRoomLabel(room.id, room.label)}
                        </text>

                        {layout.slots.map((slot, index) => {
                          const assignedAgent = roomAgents[index];

                          if (!assignedAgent) {
                            return null;
                          }

                          return renderDesk({
                            slot,
                            agent: assignedAgent,
                            label: `${assignedAgent.name} · ${getStatusLabel(assignedAgent.status, copy)}`
                          });
                        })}

                        {overflowCount > 0 ? (
                          <text
                            x={layout.x + layout.w - 9}
                            y={layout.y + 4}
                            fill={statusTone.ink}
                            fontFamily="monospace"
                            fontSize="3"
                          >
                            +{overflowCount}
                          </text>
                        ) : null}
                      </g>
                    </g>
                  );
                })}
              </svg>
            </div>
          </article>

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
        </div>

        <div className="virtualOfficeRailStack">
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
                    <p>{getDeskTask(agent, common.unavailable)}</p>
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
                    <p>{getDeskTask(agent, common.unavailable)}</p>
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
        </div>
      </div>
    </SectionShell>
  );
}
