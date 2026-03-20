"use client";

import { useMemo, useState, type KeyboardEvent } from "react";

import { MissionTaskActions, type MissionTaskActionMessages } from "@/components/mission-task-actions";
import { SectionShell } from "@/components/section-shell";
import { formatDateTimeLabel } from "@/lib/dashboard-presenters";
import { formatMessage, type Locale } from "@/lib/i18n";
import type {
  AgentsSnapshot,
  AgentAdvisorySuggestionSnapshot,
  AgentActivitySnapshot,
  AgentMissionMappingSnapshot,
  AgentRoomSnapshot,
  AgentSnapshot,
  AgentWorkloadSourceKind,
  AgentWorkStatus
} from "@/lib/agents";
import type { MissionControlSnapshot, MissionControlTaskSnapshot, MissionControlTaskStatus } from "@/lib/mission-control";
import type { MissionTaskMutationMode } from "@/lib/mission-control-actions";
import type {
  PressureLifecycle,
  PressureLifecycleState,
  PressureSignal,
  PressureSignalSeverity,
  PressureSignalsModel
} from "@/lib/pressure-signals";

type AgentsVirtualOfficeMessages = {
  section: string;
  title: string;
  copy: string;
  virtualTitle: string;
  virtualDescription: string;
  virtualBoardTitle: string;
  virtualBoardCopy: string;
  triageTitle: string;
  triageCopy: string;
  triageWorkingCopy: string;
  triageBlockedCopy: string;
  triageIdleCopy: string;
  triageNoWorking: string;
  triageNoBlocked: string;
  triageNoIdle: string;
  triageDurationWorking: string;
  triageDurationBlocked: string;
  triageDurationIdle: string;
  triageRoleFit: string;
  triageSuggestionLabel: string;
  triageSuggestionSameRoom: string;
  triageSuggestionRoleFit: string;
  triageSuggestionFallback: string;
  triageSuggestionNone: string;
  triageQueueTitle: string;
  triageQueueCopy: string;
  triageQueueEmpty: string;
  triageQueueNoSuggestion: string;
  summaryAgents: string;
  summaryAttention: string;
  summaryQueues: string;
  summaryRooms: string;
  summaryMissions: string;
  summaryReviews: string;
  intelligenceTitle: string;
  intelligenceCopy: string;
  intelligenceScopeAll: string;
  intelligenceScopeRoom: string;
  intelligenceScopeMission: string;
  intelligenceScopeNoMission: string;
  intelligenceRank: string;
  intelligenceReasons: string;
  intelligenceQueueAge: string;
  intelligenceReviewWait: string;
  intelligenceBlocked: string;
  intelligenceThroughput: string;
  intelligenceSignals: string;
  intelligenceCompareEmpty: string;
  roomExplanationTitle: string;
  roomExplanationHealthy: string;
  operatorSummaryTitle: string;
  operatorSummaryCopy: string;
  operatorScopeAll: string;
  operatorScopeRoom: string;
  operatorScopeMission: string;
  operatorScopeNoMission: string;
  operatorSummaryHottestMission: string;
  operatorSummaryCriticalRoom: string;
  operatorSummaryIntervention: string;
  operatorSummaryHealthy: string;
  operatorSummaryNeedsFocus: string;
  operatorSummaryNoMission: string;
  operatorSummaryNoIntervention: string;
  operatorSummarySignals: string;
  operatorSummaryBottlenecksTitle: string;
  operatorSummaryBottlenecksCopy: string;
  operatorSummaryBottlenecksEmpty: string;
  operatorSummaryReasonBlocked: string;
  operatorSummaryReasonReview: string;
  operatorSummaryReasonAge: string;
  operatorSummaryReasonGap: string;
  operatorSummaryReasonSignals: string;
  operatorSummaryReasonOverload: string;
  operatorSummaryReasonWaiting: string;
  operatorSummaryReasonThroughput: string;
  operatorSummaryReasonLifecycle: string;
  operatorSummaryStatus: string;
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
  roomPressure: string;
  roomMission: string;
  roomMissionIdle: string;
  roomEmpty: string;
  queueCount: string;
  utilization: string;
  sessionCount: string;
  missionTasks: string;
  missionReviews: string;
  missionBlocked: string;
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
  missionQueueTitle: string;
  missionQueueCopy: string;
  missionQueueEmpty: string;
  missionUpdated: string;
  missionSignals: string;
  missionOwnerRoom: string;
  missionOwnerAgent: string;
  missionOwnership: string;
  ownershipExplicit: string;
  ownershipInferred: string;
  detailDrawerTitle: string;
  detailDrawerCopy: string;
  detailDrawerIdleTitle: string;
  detailDrawerIdleCopy: string;
  detailDrawerClear: string;
  detailMissionTitle: string;
  detailFeature: string;
  detailTaskId: string;
  detailStatus: string;
  detailActionsTitle: string;
  detailPathTitle: string;
  detailLastCompleted: string;
  detailNextStep: string;
  detailBlockedReason: string;
  detailWaitingOn: string;
  detailHistorySource: string;
  detailLifecycle: string;
  detailLifecycleReason: string;
  detailActiveAge: string;
  detailReviewWait: string;
  detailBlockedDuration: string;
  detailActivityGap: string;
  detailHandoffTitle: string;
  detailHandoffEmpty: string;
  detailArtifactsTitle: string;
  detailBranch: string;
  detailPr: string;
  detailBrief: string;
  detailRfc: string;
  detailQa: string;
  detailRelease: string;
  detailArtifactsEmpty: string;
  deskFeedTitle: string;
  deskFeedCopy: string;
  attentionTitle: string;
  attentionCopy: string;
  pressureTitleStaleReview: string;
  pressureTitleBlocked: string;
  pressureTitleWaitingHuman: string;
  pressureTitleNoOwner: string;
  pressureTitleRoomOverload: string;
  pressureSeverityCritical: string;
  pressureSeverityHigh: string;
  pressureSeverityMedium: string;
  pressureSeverityLow: string;
  pressureAgeHours: string;
  historyHoursValue: string;
  pressureWaitingOnHint: string;
  pressureSignalCount: string;
  historySourceFull: string;
  historySourcePartial: string;
  historySourceCurrent: string;
  roomTrendSummary: string;
  lifecycleStateNew: string;
  lifecycleStateSustained: string;
  lifecycleStateSlipping: string;
  lifecycleStateRecovering: string;
  lifecycleSummaryNew: string;
  lifecycleSummarySustained: string;
  lifecycleSummarySlipping: string;
  lifecycleSummaryRecovering: string;
  lifecycleSummaryFallback: string;
  lifecycleSourcePartial: string;
  lifecycleSourceCurrent: string;
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
  provenanceLabel: string;
  provenanceFallback: string;
  provenanceExact: string;
  provenancePartial: string;
  mappingLabel: string;
  mappingExact: string;
  mappingPartial: string;
  mappingUnavailable: string;
  mappingExactHint: string;
  mappingPartialHint: string;
  mappingUnavailableHint: string;
  mappingSystemRecord: string;
  mappingAction: string;
  mappingNoAction: string;
  advisoryLabel: string;
  advisoryReasonLabel: string;
  coordinationTitle: string;
  coordinationCopy: string;
  coordinationActiveTitle: string;
  coordinationActiveEmpty: string;
  coordinationSuggestionsTitle: string;
  coordinationSuggestionsEmpty: string;
  coordinationHeadlineFallback: string;
  workloadSourceRepoWork: string;
  workloadSourcePersonalResearch: string;
  workloadSourceCoordination: string;
  workloadSourceSupport: string;
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

type MissionOwnershipSource = "explicit" | "inferred";

type MissionOwnership = {
  roomId: string;
  agentId?: string;
  source: MissionOwnershipSource;
};

type RoomMissionCoverage = {
  roomId: string;
  taskCount: number;
  featureCount: number;
  reviewCount: number;
  blockedCount: number;
  primaryTaskId?: string;
  primaryFeatureTitle?: string;
  primaryTaskTitle?: string;
  primaryOwnerAgentId?: string;
  primaryOwnershipSource?: MissionOwnershipSource;
};

type DetailFocus =
  | {
      kind: "room";
      roomId: string;
      taskId?: string;
      featureId?: string;
    }
  | {
      kind: "agent";
      roomId: string;
      agentId: string;
      taskId?: string;
      featureId?: string;
    }
  | null;

type TriageSection = "working" | "blocked" | "idle";

type IdleSuggestionKind = "same-room" | "role-fit" | "fallback" | "none";

type IdleSuggestion = {
  kind: IdleSuggestionKind;
  task: MissionControlTaskSnapshot | null;
  roomId?: string;
  advisory?: AgentAdvisorySuggestionSnapshot;
};

type TriageEntry = {
  agent: AgentSnapshot;
  section: TriageSection;
  roomLabel: string;
  taskLabel: string;
  durationLabel: string;
  focusTask: MissionControlTaskSnapshot | null;
  blockedReason: string | null;
  waitingOn: string | null;
  suggestion: IdleSuggestion;
};

const createEmptyRoomMissionCoverage = (roomId: string): RoomMissionCoverage => ({
  roomId,
  taskCount: 0,
  featureCount: 0,
  reviewCount: 0,
  blockedCount: 0
});

const VIEWBOX_WIDTH = 160;
const VIEWBOX_HEIGHT = 96;
type SceneDensity = "overview" | "focus";

const PRESSURE_SEVERITY_WEIGHT: Record<PressureSignalSeverity, number> = {
  critical: 400,
  high: 300,
  medium: 200,
  low: 100
};

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

const MISSION_STATUS_PRIORITY: Record<MissionControlTaskStatus, number> = {
  blocked: 4,
  review: 3,
  running: 2,
  ready: 1,
  done: 0
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

const sortUpdatedDesc = (left: { updatedAt?: string }, right: { updatedAt?: string }) =>
  (parseTimestampMs(right.updatedAt) || 0) - (parseTimestampMs(left.updatedAt) || 0);

const humanizeStateLabel = (value?: string) =>
  value
    ? value
        .split("-")
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join(" ")
    : undefined;

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

const getWorkloadSourceLabel = (sourceKind: AgentWorkloadSourceKind, copy: AgentsVirtualOfficeMessages) => {
  switch (sourceKind) {
    case "repo-work":
      return copy.workloadSourceRepoWork;
    case "personal-research":
      return copy.workloadSourcePersonalResearch;
    case "coordination":
      return copy.workloadSourceCoordination;
    case "support":
    default:
      return copy.workloadSourceSupport;
  }
};

const getWorkloadConfidenceLabel = (confidence: "exact" | "partial", copy: AgentsVirtualOfficeMessages) =>
  confidence === "exact" ? copy.provenanceExact : copy.provenancePartial;

const getMissionMappingStateLabel = (mapping: AgentMissionMappingSnapshot | undefined, copy: AgentsVirtualOfficeMessages) => {
  switch (mapping?.state) {
    case "exact":
      return copy.mappingExact;
    case "partial":
      return copy.mappingPartial;
    case "unavailable":
    default:
      return copy.mappingUnavailable;
  }
};

const getMissionMappingHeadline = (mapping: AgentMissionMappingSnapshot | undefined, copy: AgentsVirtualOfficeMessages) => {
  if (!mapping) return copy.mappingUnavailable;
  return mapping.taskTitle || mapping.featureTitle || copy.mappingUnavailable;
};

const getMissionMappingHint = (mapping: AgentMissionMappingSnapshot | undefined, copy: AgentsVirtualOfficeMessages) => {
  switch (mapping?.state) {
    case "exact":
      return copy.mappingExactHint;
    case "partial":
      return copy.mappingPartialHint;
    case "unavailable":
    default:
      return copy.mappingUnavailableHint;
  }
};

const getMissionMappingClassName = (mapping: AgentMissionMappingSnapshot | undefined) => {
  const state = mapping?.state || "unavailable";
  return `${state.charAt(0).toUpperCase()}${state.slice(1)}`;
};

const getMissionControlHref = (mapping: AgentMissionMappingSnapshot | undefined, locale: Locale) => {
  if (!mapping?.destination) return null;

  const search = new URLSearchParams();
  if (locale === "zh") {
    search.set("lang", "zh");
  }
  search.set("view", "mission-control");
  search.set("panel", mapping.destination.panel);
  search.set("missionMapping", mapping.state);
  if (mapping.destination.taskId) search.set("missionTask", mapping.destination.taskId);
  if (mapping.destination.featureId) search.set("missionFeature", mapping.destination.featureId);
  if (mapping.destination.queue) search.set("missionQueue", mapping.destination.queue);
  if (mapping.destination.lane) search.set("missionLane", mapping.destination.lane);

  return `/?${search.toString()}`;
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

const getInferredMissionRoomId = (task: MissionControlTaskSnapshot) => {
  if (task.status === "review" || task.lane === "qa") return "review";
  if (task.lane === "research") return "research";
  if (task.lane === "build") return "build";
  if (task.lane === "release") return "release";
  return "dispatch";
};

const getMissionOwnership = (
  task: MissionControlTaskSnapshot,
  agentRoomById: Map<string, string>
): MissionOwnership => {
  const source: MissionOwnershipSource = task.ownerAgentId || task.ownerRoomId ? "explicit" : "inferred";

  return {
    roomId:
      task.ownerRoomId ||
      (task.ownerAgentId ? agentRoomById.get(task.ownerAgentId) : undefined) ||
      getInferredMissionRoomId(task),
    agentId: task.ownerAgentId,
    source
  };
};

const getOwnershipLabel = (source: MissionOwnershipSource, copy: AgentsVirtualOfficeMessages) =>
  source === "explicit" ? copy.ownershipExplicit : copy.ownershipInferred;

const getHistorySourceLabel = (
  source: "full-history" | "partial-history" | "current-only" | undefined,
  copy: AgentsVirtualOfficeMessages
) => {
  switch (source) {
    case "full-history":
      return copy.historySourceFull;
    case "partial-history":
      return copy.historySourcePartial;
    case "current-only":
    default:
      return copy.historySourceCurrent;
  }
};

const getPressureSeverityLabel = (severity: PressureSignalSeverity, copy: AgentsVirtualOfficeMessages) => {
  switch (severity) {
    case "critical":
      return copy.pressureSeverityCritical;
    case "high":
      return copy.pressureSeverityHigh;
    case "medium":
      return copy.pressureSeverityMedium;
    case "low":
      return copy.pressureSeverityLow;
  }
};

const getPressureSignalLabel = (signal: PressureSignal, copy: AgentsVirtualOfficeMessages) => {
  switch (signal.kind) {
    case "stale-review":
      return copy.pressureTitleStaleReview;
    case "blocked-too-long":
      return copy.pressureTitleBlocked;
    case "waiting-human":
      return copy.pressureTitleWaitingHuman;
    case "no-owner":
      return copy.pressureTitleNoOwner;
    case "room-overload":
      return copy.pressureTitleRoomOverload;
  }
};

const getLifecycleStateLabel = (state: PressureLifecycleState | undefined, copy: AgentsVirtualOfficeMessages) => {
  switch (state) {
    case "new":
      return copy.lifecycleStateNew;
    case "sustained":
      return copy.lifecycleStateSustained;
    case "slipping":
      return copy.lifecycleStateSlipping;
    case "recovering":
    default:
      return copy.lifecycleStateRecovering;
  }
};

const getLifecycleSummary = ({
  lifecycle,
  status,
  currentWaitHours,
  activityGapHours,
  source,
  copy,
  common,
  formatHistoryHours
}: {
  lifecycle?: PressureLifecycle;
  status?: MissionControlTaskStatus;
  currentWaitHours?: number;
  activityGapHours?: number;
  source?: "full-history" | "partial-history" | "current-only";
  copy: AgentsVirtualOfficeMessages;
  common: { na: string };
  formatHistoryHours: (value?: number) => string;
}) => {
  if (!lifecycle || !status) return copy.lifecycleSummaryFallback;

  const statusLabel = humanizeStateLabel(status) || common.na;
  const previousStatusLabel = lifecycle.previousStatus ? humanizeStateLabel(lifecycle.previousStatus) || common.na : null;
  const durationLabel = formatHistoryHours(currentWaitHours || activityGapHours);
  const sourceHint =
    source === "partial-history"
      ? ` · ${copy.lifecycleSourcePartial}`
      : source === "current-only"
        ? ` · ${copy.lifecycleSourceCurrent}`
        : "";

  switch (lifecycle.state) {
    case "new":
      return formatMessage(copy.lifecycleSummaryNew, {
        status: statusLabel,
        duration: durationLabel
      }) + sourceHint;
    case "sustained":
      return formatMessage(copy.lifecycleSummarySustained, {
        status: statusLabel,
        duration: durationLabel
      }) + sourceHint;
    case "slipping":
      return formatMessage(copy.lifecycleSummarySlipping, {
        status: statusLabel,
        previousStatus: previousStatusLabel || statusLabel,
        duration: durationLabel
      }) + sourceHint;
    case "recovering":
    default:
      return formatMessage(copy.lifecycleSummaryRecovering, {
        status: statusLabel,
        previousStatus: previousStatusLabel || statusLabel,
        duration: durationLabel
      }) + sourceHint;
  }
};

const summarizeThroughput = (roomQueue: number, taskCount: number) => {
  if (taskCount <= 0) return 0;
  return Math.max(0, taskCount * 10 - roomQueue * 3);
};

const sortMissionTasks = (left: MissionControlTaskSnapshot, right: MissionControlTaskSnapshot) => {
  const statusDelta = MISSION_STATUS_PRIORITY[right.status] - MISSION_STATUS_PRIORITY[left.status];
  if (statusDelta !== 0) return statusDelta;

  const updatedDelta = (parseTimestampMs(right.updatedAt) || 0) - (parseTimestampMs(left.updatedAt) || 0);
  if (updatedDelta !== 0) return updatedDelta;

  return left.title.localeCompare(right.title);
};

const getLiveMissionTasks = (missionControl: MissionControlSnapshot) =>
  [
    ...missionControl.queue.blockedTasks,
    ...missionControl.queue.reviewTasks,
    ...missionControl.queue.runningTasks,
    ...missionControl.queue.readyTasks
  ].sort(sortMissionTasks);

const buildFocusForTask = (
  task: MissionControlTaskSnapshot,
  agentRoomById: Map<string, string>,
  agentById: Map<string, AgentSnapshot>
): DetailFocus => {
  const ownership = getMissionOwnership(task, agentRoomById);

  if (ownership.agentId && agentById.has(ownership.agentId)) {
    return {
      kind: "agent",
      agentId: ownership.agentId,
      roomId: ownership.roomId,
      taskId: task.tqId,
      featureId: task.featureId
    };
  }

  return {
    kind: "room",
    roomId: ownership.roomId,
    taskId: task.tqId,
    featureId: task.featureId
  };
};

const getHoursSince = (value?: string) => {
  const timestampMs = parseTimestampMs(value);
  if (typeof timestampMs !== "number") return undefined;
  const elapsedHours = (Date.now() - timestampMs) / (1000 * 60 * 60);
  return elapsedHours > 0 ? elapsedHours : undefined;
};

const getAgentPreferredLanes = (agent: AgentSnapshot) => {
  const role = agent.role.toLowerCase();
  const lanes = new Set<MissionControlTaskSnapshot["lane"]>();

  if (agent.roomId === "research" || role.includes("research")) lanes.add("research");
  if (agent.roomId === "build" || role.includes("build") || role.includes("coding")) lanes.add("build");
  if (agent.roomId === "review" || role.includes("review") || role.includes("quality") || role.includes("qa")) lanes.add("qa");
  if (agent.roomId === "release" || role.includes("release")) lanes.add("release");

  if (!lanes.size && (agent.roomId === "dispatch" || role.includes("triage") || role.includes("dispatch"))) {
    lanes.add("research");
    lanes.add("build");
    lanes.add("qa");
    lanes.add("release");
  }

  return lanes;
};

const classifyTriageSection = (agent: AgentSnapshot): TriageSection => {
  if (agent.status === "blocked") return "blocked";
  if (agent.status === "idle" || agent.status === "offline") return "idle";
  return "working";
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
  missionControl,
  pressure,
  locale,
  copy,
  common,
  actionCopy,
  mutationMode
}: {
  id?: string;
  agents: AgentsSnapshot;
  missionControl: MissionControlSnapshot;
  pressure: PressureSignalsModel;
  locale: Locale;
  copy: AgentsVirtualOfficeMessages;
  common: { na: string; unavailable: string };
  actionCopy: MissionTaskActionMessages;
  mutationMode: MissionTaskMutationMode;
}) {
  const [selectedFocus, setSelectedFocus] = useState<DetailFocus>(null);
  const officeName = agents.officeName || copy.fallbackOffice;
  const onlineAgents = agents.agents.filter((agent) => agent.status !== "offline");
  const queueTotal = agents.agents.reduce((sum, agent) => sum + (agent.queueCount || 0), 0);
  const updatedLabel = formatDateTimeLabel(parseTimestampMs(agents.updatedAt), locale, common.na);
  const latestEventLabel = formatDateTimeLabel(parseTimestampMs(agents.recentEvents[0]?.at), locale, common.na);
  const agentById = useMemo(() => new Map(agents.agents.map((agent) => [agent.id, agent])), [agents.agents]);
  const agentNameById = useMemo(() => new Map(agents.agents.map((agent) => [agent.id, agent.name])), [agents.agents]);
  const agentRoomById = useMemo(() => new Map(agents.agents.map((agent) => [agent.id, agent.roomId])), [agents.agents]);
  const roomLabelById = useMemo(() => new Map(agents.rooms.map((room) => [room.id, room.label])), [agents.rooms]);
  const liveMissionTasks = useMemo(() => getLiveMissionTasks(missionControl), [missionControl]);
  const allMissionTasks = useMemo(
    () => missionControl.features.flatMap((feature) => feature.tasks),
    [missionControl.features]
  );
  const featureById = useMemo(
    () => new Map(missionControl.features.map((feature) => [feature.featureId, feature])),
    [missionControl.features]
  );
  const taskById = useMemo(() => new Map(allMissionTasks.map((task) => [task.tqId, task])), [allMissionTasks]);
  const liveMissionFeatureCount = useMemo(
    () => new Set(liveMissionTasks.map((task) => task.featureId)).size,
    [liveMissionTasks]
  );
  const pressureModel = pressure;
  const totalAttentionCount = pressureModel.signals.length;
  const roomMissionCoverage = useMemo(() => {
    const coverageByRoom = new Map<string, RoomMissionCoverage & { tasks: MissionControlTaskSnapshot[]; features: Set<string> }>(
      agents.rooms.map((room) => [
        room.id,
        {
          ...createEmptyRoomMissionCoverage(room.id),
          tasks: [],
          features: new Set<string>()
        }
      ])
    );

    liveMissionTasks.forEach((task) => {
      const ownership = getMissionOwnership(task, agentRoomById);
      const roomId = ownership.roomId;
      const current =
        coverageByRoom.get(roomId) ||
        ({
          ...createEmptyRoomMissionCoverage(roomId),
          tasks: [],
          features: new Set<string>()
        } satisfies RoomMissionCoverage & { tasks: MissionControlTaskSnapshot[]; features: Set<string> });

      current.taskCount += 1;
      current.reviewCount += task.status === "review" ? 1 : 0;
      current.blockedCount += task.status === "blocked" ? 1 : 0;
      current.tasks.push(task);
      current.features.add(task.featureId);
      coverageByRoom.set(roomId, current);
    });

    return new Map(
      [...coverageByRoom.entries()].map(([roomId, entry]) => {
        const sortedTasks = [...entry.tasks].sort(sortMissionTasks);
        const primaryTask = sortedTasks[0];

        return [
          roomId,
          {
            roomId,
            taskCount: entry.taskCount,
            featureCount: entry.features.size,
            reviewCount: entry.reviewCount,
            blockedCount: entry.blockedCount,
            primaryTaskId: primaryTask?.tqId,
            primaryFeatureTitle: primaryTask?.featureTitle,
            primaryTaskTitle: primaryTask?.title,
            primaryOwnerAgentId: primaryTask ? getMissionOwnership(primaryTask, agentRoomById).agentId : undefined,
            primaryOwnershipSource: primaryTask ? getMissionOwnership(primaryTask, agentRoomById).source : undefined
          } satisfies RoomMissionCoverage
        ];
      })
    );
  }, [agentRoomById, agents.rooms, liveMissionTasks]);

  const summaryCards = missionControl.available
    ? [
        { label: copy.summaryAgents, value: String(onlineAgents.length) },
        { label: copy.summaryAttention, value: String(totalAttentionCount), warning: totalAttentionCount > 0 },
        { label: copy.summaryMissions, value: String(liveMissionFeatureCount) },
        {
          label: copy.summaryReviews,
          value: String(missionControl.queue.reviewTasks.length),
          warning: missionControl.queue.reviewTasks.length > 0
        }
      ]
    : [
        { label: copy.summaryAgents, value: String(onlineAgents.length) },
        { label: copy.summaryAttention, value: String(totalAttentionCount), warning: totalAttentionCount > 0 },
        { label: copy.summaryQueues, value: String(queueTotal) },
        { label: copy.summaryRooms, value: String(agents.rooms.length) }
      ];

  const roomEntries = useMemo(
    () =>
      agents.rooms.map((room) => {
        const roomAgents = agents.agents.filter((agent) => agent.roomId === room.id).sort(sortByLoad);
        const roomQueue = roomAgents.reduce((sum, agent) => sum + (agent.queueCount || 0), 0);
        const roomCapacity = Math.max(room.capacity || 0, Math.max(2, roomAgents.length));
        const roomLead = room.lead || roomAgents[0]?.name || common.na;
        const roomStatus = getRoomStatus(roomAgents);
        const area = SCENE_AREAS[room.id];
        const missionCoverage = roomMissionCoverage.get(room.id) || createEmptyRoomMissionCoverage(room.id);
        const roomHistoryMetrics = pressureModel.roomMetricsByRoomId[room.id];

        return {
          room,
          roomAgents,
          roomQueue,
          roomCapacity,
          roomLead,
          roomStatus,
          missionCoverage,
          roomHistoryMetrics,
          area,
          roomPressureCount: pressureModel.roomSignalCountByRoomId[room.id] || 0,
          roomPressureSeverity: pressureModel.roomTopSeverityByRoomId[room.id],
          roomPriority: pressureModel.roomPriorityByRoomId[room.id] || 0,
          occupancy: `${roomAgents.length}/${roomCapacity}`
        };
      }),
    [
      agents.agents,
      agents.rooms,
      common.na,
      pressureModel.roomMetricsByRoomId,
      pressureModel.roomPriorityByRoomId,
      pressureModel.roomSignalCountByRoomId,
      pressureModel.roomTopSeverityByRoomId,
      roomMissionCoverage
    ]
  );

  const pinnedTask = selectedFocus?.taskId ? taskById.get(selectedFocus.taskId) || null : null;
  const pinnedFeature =
    (selectedFocus?.featureId ? featureById.get(selectedFocus.featureId) || null : null) ||
    (pinnedTask ? featureById.get(pinnedTask.featureId) || null : null);
  const replacementPinnedTask =
    pinnedTask && pinnedTask.status !== "done"
      ? pinnedTask
      : pinnedFeature
        ? [...pinnedFeature.tasks].filter((task) => task.status !== "done").sort(sortMissionTasks)[0] || null
        : null;
  const resolvedFocus = useMemo<DetailFocus>(() => {
    if (!selectedFocus) return null;

    if (selectedFocus.taskId || selectedFocus.featureId) {
      if (replacementPinnedTask) {
        return buildFocusForTask(replacementPinnedTask, agentRoomById, agentById);
      }

      if (selectedFocus.kind === "agent") {
        const refreshedAgent = agentById.get(selectedFocus.agentId) || null;
        return refreshedAgent ? { kind: "agent", agentId: refreshedAgent.id, roomId: refreshedAgent.roomId } : { kind: "room", roomId: selectedFocus.roomId };
      }

      return { kind: "room", roomId: selectedFocus.roomId };
    }

    if (selectedFocus.kind === "agent") {
      const refreshedAgent = agentById.get(selectedFocus.agentId) || null;
      if (!refreshedAgent) {
        return { kind: "room", roomId: selectedFocus.roomId };
      }

      if (refreshedAgent.roomId !== selectedFocus.roomId) {
        return { kind: "agent", agentId: refreshedAgent.id, roomId: refreshedAgent.roomId };
      }
    }

    return selectedFocus;
  }, [agentById, agentRoomById, replacementPinnedTask, selectedFocus]);
  const selectedRoomId = resolvedFocus?.roomId || null;
  const selectedRoomEntry = roomEntries.find(({ room }) => room.id === selectedRoomId) || null;
  const selectedAgent = resolvedFocus?.kind === "agent" ? agentById.get(resolvedFocus.agentId) || null : null;
  const focusedMissionTasks = selectedAgent
    ? [
        ...liveMissionTasks.filter((task) => task.ownerAgentId === selectedAgent.id),
        ...(selectedAgent.currentTaskId ? [taskById.get(selectedAgent.currentTaskId)] : [])
      ].filter((task, index, tasks): task is MissionControlTaskSnapshot => Boolean(task) && tasks.indexOf(task) === index)
    : selectedRoomId
      ? liveMissionTasks.filter((task) => getMissionOwnership(task, agentRoomById).roomId === selectedRoomId)
      : [];
  const selectedAgentIds = new Set(selectedRoomEntry?.roomAgents.map((agent) => agent.id) || []);
  const missionFeedTasks = useMemo(() => {
    const roomId = selectedRoomId;
    const taskScore = (task: MissionControlTaskSnapshot) => {
      const severity = pressureModel.taskTopSeverityByTaskId[task.tqId];
      const count = pressureModel.taskSignalCountByTaskId[task.tqId] || 0;
      return (severity ? PRESSURE_SEVERITY_WEIGHT[severity] : 0) + count * 20;
    };

    const tasks = roomId
      ? liveMissionTasks.filter((task) => getMissionOwnership(task, agentRoomById).roomId === roomId)
      : liveMissionTasks;

    return [...tasks]
      .sort((left, right) => {
        const scoreDelta = taskScore(right) - taskScore(left);
        if (scoreDelta !== 0) return scoreDelta;
        return sortMissionTasks(left, right);
      })
      .slice(0, 4);
  }, [agentRoomById, liveMissionTasks, pressureModel.taskSignalCountByTaskId, pressureModel.taskTopSeverityByTaskId, selectedRoomId]);
  const deskFeedAgents = [...(selectedRoomEntry ? selectedRoomEntry.roomAgents : onlineAgents)]
    .filter((agent) => (selectedRoomEntry ? true : agent.status !== "offline"))
    .sort(sortByLoad)
    .slice(0, 4);
  const attentionSignals = useMemo(() => {
    const scopedSignals = selectedAgent
      ? pressureModel.signals.filter(
          (signal) =>
            signal.agentId === selectedAgent.id ||
            signal.taskId === selectedAgent.currentTaskId ||
            signal.roomId === selectedAgent.roomId
        )
      : selectedRoomId
        ? pressureModel.signals.filter((signal) => signal.roomId === selectedRoomId)
        : pressureModel.signals;

    return scopedSignals.slice(0, 4);
  }, [pressureModel.signals, selectedAgent, selectedRoomId]);
  const timelineEvents = (selectedRoomEntry
    ? agents.recentEvents.filter((event) => selectedAgentIds.has(event.agentId))
    : agents.recentEvents
  ).slice(0, 5);
  const activeViewBox = getSceneViewBox(selectedRoomEntry?.area, selectedRoomEntry ? "focus" : "overview");
  const activeRoomLabel = selectedRoomEntry?.room.label || copy.allRooms;
  const activeRoomToneClass = `virtualOfficeSceneTone${selectedRoomEntry?.room.id || "all"}`;
  const activeRoomStatusLabel = selectedRoomEntry ? getStatusLabel(selectedRoomEntry.roomStatus, copy) : null;
  const selectedAgentStatusLabel = selectedAgent ? getStatusLabel(selectedAgent.status, copy) : null;
  const selectedAgentTaskLabel = selectedAgent ? getDeskTask(selectedAgent, copy, common.unavailable) : null;
  const selectedRoomMissionLabel = selectedRoomEntry?.missionCoverage.primaryFeatureTitle || copy.roomMissionIdle;
  const activeDetailTask =
    replacementPinnedTask ||
    focusedMissionTasks[0] ||
    (selectedAgent?.currentTaskId ? taskById.get(selectedAgent.currentTaskId) || null : null);
  const scopeMissionTask = selectedFocus?.taskId ? taskById.get(selectedFocus.taskId) || null : activeDetailTask;
  const activeDetailFeature = activeDetailTask ? featureById.get(activeDetailTask.featureId) || null : null;
  const activeDetailOwnership = activeDetailTask ? getMissionOwnership(activeDetailTask, agentRoomById) : null;
  const activeDetailMetrics = activeDetailTask ? pressureModel.taskMetricsByTaskId[activeDetailTask.tqId] || null : null;
  const lastCompletedTask =
    (selectedAgent?.lastTaskId ? taskById.get(selectedAgent.lastTaskId) : undefined) ||
    (activeDetailFeature
      ? [...activeDetailFeature.tasks].filter((task) => task.status === "done").sort(sortUpdatedDesc)[0]
      : undefined) ||
    null;
  const nextPlannedTask =
    (selectedAgent?.nextTaskId ? taskById.get(selectedAgent.nextTaskId) : undefined) ||
    (activeDetailFeature
      ? [...activeDetailFeature.tasks]
          .filter((task) => task.status !== "done" && task.tqId !== activeDetailTask?.tqId)
          .sort(sortMissionTasks)[0]
      : undefined) ||
    null;
  const detailEvents = (
    selectedAgent
      ? agents.recentEvents.filter((event) => event.agentId === selectedAgent.id)
      : selectedRoomEntry
        ? agents.recentEvents.filter((event) => selectedAgentIds.has(event.agentId))
        : []
  ).slice(0, 3);
  const formatHistoryHours = (value?: number) =>
    typeof value === "number" && value > 0
      ? formatMessage(copy.historyHoursValue, { value: String(Math.max(1, Math.round(value))) })
      : common.na;
  const triageEntries = (() => {
    const getTriageDurationLabel = (section: TriageSection, value?: number) => {
      const duration = formatHistoryHours(value);

      switch (section) {
        case "blocked":
          return formatMessage(copy.triageDurationBlocked, { value: duration });
        case "idle":
          return formatMessage(copy.triageDurationIdle, { value: duration });
        case "working":
        default:
          return formatMessage(copy.triageDurationWorking, { value: duration });
      }
    };
    const readyUnownedTasks = liveMissionTasks.filter((task) => task.status === "ready" && !task.ownerAgentId);
    const advisorySuggestions = agents.advisorySuggestions || [];

    const rankIdleSuggestion = (agent: AgentSnapshot): IdleSuggestion => {
      const preferredLanes = getAgentPreferredLanes(agent);
      const ranked: Array<{
        advisory?: AgentAdvisorySuggestionSnapshot;
        task: MissionControlTaskSnapshot | null;
        roomId: string;
        score: number;
        kind: IdleSuggestionKind;
      }> = [
        ...advisorySuggestions.map((advisory) => {
          const relatedTask = advisory.taskId ? taskById.get(advisory.taskId) || null : null;
          const candidateRoomId =
            advisory.roomId || (relatedTask ? getMissionOwnership(relatedTask, agentRoomById).roomId : agent.roomId);
          const sameRoom = candidateRoomId === agent.roomId;
          const roleFit =
            (advisory.sourceKind === "personal-research" && agent.roomId === "research") ||
            (advisory.sourceKind === "repo-work" && (agent.roomId === "build" || agent.roomId === "review")) ||
            (relatedTask ? preferredLanes.has(relatedTask.lane) : false);
          const score = (sameRoom ? 300 : 0) + (roleFit ? 200 : 0) + (advisory.confidence === "exact" ? 80 : 40);
          const kind: IdleSuggestionKind = sameRoom ? "same-room" : roleFit ? "role-fit" : "fallback";

          return {
            advisory,
            task: relatedTask,
            roomId: candidateRoomId,
            score,
            kind
          };
        }),
        ...[...readyUnownedTasks].map((task) => {
          const ownership = getMissionOwnership(task, agentRoomById);
          const sameRoom = ownership.roomId === agent.roomId;
          const roleFit = preferredLanes.has(task.lane);
          const score = (sameRoom ? 300 : 0) + (roleFit ? 200 : 0) + 100;
          const kind: IdleSuggestionKind = sameRoom ? "same-room" : roleFit ? "role-fit" : "fallback";

          return {
            advisory: undefined,
            task,
            roomId: ownership.roomId,
            score,
            kind
          };
        })
      ]
        .sort((left, right) => {
          const scoreDelta = right.score - left.score;
          if (scoreDelta !== 0) return scoreDelta;
          if (left.task && right.task) return sortMissionTasks(left.task, right.task);
          return left.advisory?.title.localeCompare(right.advisory?.title || "") || 0;
        });

      if (!ranked.length) {
        return { kind: "none", task: null };
      }

      return {
        kind: ranked[0].kind,
        task: ranked[0].task,
        roomId: ranked[0].roomId,
        advisory: ranked[0].advisory
      };
    };

    return agents.agents
      .map((agent) => {
        const section = classifyTriageSection(agent);
        const focusTask =
          (agent.currentTaskId ? taskById.get(agent.currentTaskId) || null : null) ||
          liveMissionTasks.find((task) => task.ownerAgentId === agent.id) ||
          null;
        const focusTaskMetrics = focusTask ? pressureModel.taskMetricsByTaskId[focusTask.tqId] || null : null;
        const durationHours =
          section === "blocked"
            ? focusTaskMetrics?.blockedDurationHours || focusTaskMetrics?.currentWaitHours || getHoursSince(focusTask?.updatedAt) || getHoursSince(agent.lastEventAt)
            : section === "idle"
              ? focusTaskMetrics?.activityGapHours || getHoursSince(agent.lastEventAt) || getHoursSince(focusTask?.updatedAt)
              : focusTaskMetrics?.activeAgeHours ||
                focusTaskMetrics?.currentWaitHours ||
                getHoursSince(focusTask?.startedAt) ||
                getHoursSince(focusTask?.lastWorkedAt) ||
                getHoursSince(focusTask?.updatedAt) ||
                getHoursSince(agent.lastEventAt);

        return {
          agent,
          section,
          roomLabel: roomLabelById.get(agent.roomId) || common.na,
          taskLabel: getDeskTask(agent, copy, common.unavailable),
          durationLabel: getTriageDurationLabel(section, durationHours),
          focusTask,
          blockedReason: focusTask?.blockedReason || null,
          waitingOn: focusTask?.waitingOn || null,
          suggestion: section === "idle" ? rankIdleSuggestion(agent) : { kind: "none", task: null }
        } satisfies TriageEntry;
      })
      .sort((left, right) => sortByLoad(left.agent, right.agent));
  })();
  const triageWorkingEntries = triageEntries.filter((entry) => entry.section === "working");
  const triageBlockedEntries = triageEntries.filter((entry) => entry.section === "blocked");
  const triageIdleEntries = triageEntries.filter((entry) => entry.section === "idle");
  const triageIdleQueueEntries = triageIdleEntries
    .map((entry) => ({
      ...entry,
      score:
        entry.suggestion.kind === "same-room"
          ? 3
          : entry.suggestion.kind === "role-fit"
            ? 2
            : entry.suggestion.kind === "fallback"
              ? 1
              : 0
    }))
    .sort((left, right) => {
      const scoreDelta = right.score - left.score;
      if (scoreDelta !== 0) return scoreDelta;
      return left.agent.name.localeCompare(right.agent.name);
    });
  const offlineCount = agents.agents.filter((agent) => agent.status === "offline").length;
  const activeWorkloadAgents = triageWorkingEntries
    .filter((entry) => entry.agent.workloads?.length)
    .slice(0, 4);
  const coordinationSuggestions = (agents.advisorySuggestions || []).slice(0, 4);
  const getSuggestionTone = (kind: IdleSuggestionKind) => {
    switch (kind) {
      case "same-room":
        return copy.triageSuggestionSameRoom;
      case "role-fit":
        return copy.triageSuggestionRoleFit;
      case "fallback":
        return copy.triageSuggestionFallback;
      case "none":
      default:
      return copy.triageSuggestionNone;
    }
  };
  const renderMissionMapping = (mapping: AgentMissionMappingSnapshot | undefined, compact = false) => {
    const mappingHref = getMissionControlHref(mapping, locale);
    const mappingReference = mapping?.taskId || mapping?.featureId;
    const mappingClassName = getMissionMappingClassName(mapping);

    return (
      <div className={`missionMappingCard missionMappingCard${mappingClassName} ${compact ? "missionMappingCardCompact" : ""}`}>
        <div className="missionMappingHead">
          <span className="missionMappingLabel">{copy.mappingLabel}</span>
          <span className={`missionMappingChip missionMappingChip${mappingClassName}`}>
            {getMissionMappingStateLabel(mapping, copy)}
          </span>
        </div>
        <strong className="missionMappingTitle">{getMissionMappingHeadline(mapping, copy)}</strong>
        <p className="missionMappingCopy">{getMissionMappingHint(mapping, copy)}</p>
        <div className="missionMappingMeta">
          <span>{copy.mappingSystemRecord}</span>
          {mappingReference ? <span>{mappingReference}</span> : null}
        </div>
        {mappingHref ? (
          <a className="missionMappingAction" href={mappingHref}>
            {copy.mappingAction}
          </a>
        ) : (
          <span className="missionMappingAction missionMappingActionDisabled">{copy.mappingNoAction}</span>
        )}
      </div>
    );
  };
  const getRoomTrendSummary = (
    metrics:
      | {
          source: "full-history" | "partial-history" | "current-only";
          longestActiveAgeHours: number;
          longestReviewWaitHours: number;
          longestBlockedDurationHours: number;
          longestActivityGapHours: number;
          lifecycle?: PressureLifecycle;
        }
      | undefined
  ) => {
    if (!metrics) return getHistorySourceLabel("current-only", copy);
    return `${getLifecycleStateLabel(metrics.lifecycle?.state, copy)} · ${getHistorySourceLabel(metrics.source, copy)}`;
  };
  const getRoomExplanation = (
    metrics:
      | {
          source: "full-history" | "partial-history" | "current-only";
          longestActiveAgeHours: number;
          longestReviewWaitHours: number;
          longestBlockedDurationHours: number;
          longestActivityGapHours: number;
          lifecycle?: PressureLifecycle;
        }
      | undefined,
    roomPressureCount: number
  ) => {
    const facts = [
      metrics?.lifecycle ? `${copy.operatorSummaryReasonLifecycle}: ${getLifecycleStateLabel(metrics.lifecycle.state, copy)}` : null,
      metrics?.longestBlockedDurationHours
        ? `${copy.intelligenceBlocked}: ${formatHistoryHours(metrics.longestBlockedDurationHours)}`
        : null,
      metrics?.longestReviewWaitHours
        ? `${copy.intelligenceReviewWait}: ${formatHistoryHours(metrics.longestReviewWaitHours)}`
        : null,
      metrics?.longestActiveAgeHours
        ? `${copy.intelligenceQueueAge}: ${formatHistoryHours(metrics.longestActiveAgeHours)}`
        : null,
      roomPressureCount > 0 ? `${copy.intelligenceSignals}: ${roomPressureCount}` : null
    ].filter((value): value is string => Boolean(value));

    if (!facts.length) return copy.roomExplanationHealthy;
    return facts.join(" · ");
  };
  const focusRoom = (roomId: string) => {
    setSelectedFocus({ kind: "room", roomId });
  };

  const focusAgent = (agentId: string, roomId: string) => {
    setSelectedFocus({ kind: "agent", agentId, roomId });
  };

  const focusMissionTask = (task: MissionControlTaskSnapshot) => {
    setSelectedFocus(buildFocusForTask(task, agentRoomById, agentById));
  };

  const focusPressureSignal = (signal: PressureSignal) => {
    const task = signal.taskId ? taskById.get(signal.taskId) : null;
    if (task) {
      focusMissionTask(task);
      return;
    }

    const agent = signal.agentId ? agentById.get(signal.agentId) : null;
    if (agent) {
      focusAgent(agent.id, agent.roomId);
      return;
    }

    focusRoom(signal.roomId);
  };

  const getPressureAgeLabel = (ageHours?: number) =>
    typeof ageHours === "number" && ageHours > 0
      ? formatMessage(copy.pressureAgeHours, { value: String(Math.max(1, Math.round(ageHours))) })
      : null;

  const getPressureSignalSummary = (signal: PressureSignal) => {
    if (signal.kind === "room-overload") {
      return roomLabelById.get(signal.roomId) || common.na;
    }

    if (signal.taskTitle && signal.featureTitle) {
      return `${signal.taskTitle} · ${signal.featureTitle}`;
    }

    return signal.taskTitle || signal.featureTitle || roomLabelById.get(signal.roomId) || common.na;
  };

  const getPressureSignalMeta = (signal: PressureSignal) => {
    const meta: string[] = [];
    const task = signal.taskId ? taskById.get(signal.taskId) : null;

    meta.push(`${copy.missionOwnerRoom}: ${roomLabelById.get(signal.roomId) || common.na}`);

    const ageLabel = getPressureAgeLabel(signal.ageHours);
    if (ageLabel) {
      meta.push(ageLabel);
    }

    if (signal.kind === "room-overload") {
      if (typeof signal.queueCount === "number") {
        meta.push(`${copy.roomQueue}: ${signal.queueCount}`);
      }
      if (typeof signal.signalCount === "number") {
        meta.push(formatMessage(copy.pressureSignalCount, { value: String(signal.signalCount) }));
      }
      return meta;
    }

    if (signal.waitingOn) {
      meta.push(formatMessage(copy.pressureWaitingOnHint, { value: humanizeStateLabel(signal.waitingOn) || signal.waitingOn }));
    } else if (task?.blockedReason) {
      meta.push(`${copy.detailBlockedReason}: ${task.blockedReason}`);
    }

    if (signal.kind === "no-owner") {
      meta.push(`${copy.missionOwnership}: ${copy.ownershipInferred}`);
    } else if (signal.featureTitle) {
      meta.push(`${copy.detailFeature}: ${signal.featureTitle}`);
    }

    return meta;
  };

  const pinFocusedTask = (task: MissionControlTaskSnapshot) => {
    setSelectedFocus((current) => {
      if (!current) {
        return buildFocusForTask(task, agentRoomById, agentById);
      }

      if (current.kind === "agent") {
        return {
          ...current,
          taskId: task.tqId,
          featureId: task.featureId
        };
      }

      return {
        ...current,
        taskId: task.tqId,
        featureId: task.featureId
      };
    });
  };

  const toggleRoomFocus = (roomId: string | null) => {
    if (!roomId) {
      setSelectedFocus(null);
      return;
    }

    if (resolvedFocus?.kind === "room" && resolvedFocus.roomId === roomId) {
      setSelectedFocus(null);
      return;
    }

    setSelectedFocus({ kind: "room", roomId });
  };

  const toggleAgentFocus = (agent: AgentSnapshot) => {
    if (resolvedFocus?.kind === "agent" && resolvedFocus.agentId === agent.id) {
      setSelectedFocus(null);
      return;
    }

    setSelectedFocus({ kind: "agent", agentId: agent.id, roomId: agent.roomId });
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
              {copy.floorStatus}: {totalAttentionCount > 0 ? copy.floorAttention : copy.floorHealthy}
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
                onClick={() => setSelectedFocus(null)}
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

        <article className="virtualOfficeRail virtualTriageBoard">
          <div className="virtualOfficeRailHeader">
            <div>
              <p className="eyebrow">{officeName}</p>
              <h3>{copy.triageTitle}</h3>
            </div>
            <p className="virtualOfficeRailCopy">{copy.triageCopy}</p>
          </div>

          <div className="virtualOperatorSummaryFooter">
            <span className="metaChip">
              {copy.statusActive}: {triageWorkingEntries.length}
            </span>
            <span className="metaChip">
              {copy.statusBlocked}: {triageBlockedEntries.length}
            </span>
            <span className="metaChip">
              {copy.statusIdle}: {triageIdleEntries.length}
            </span>
            {offlineCount > 0 ? (
              <span className="metaChip">
                {copy.statusOffline}: {offlineCount}
              </span>
            ) : null}
          </div>

          <div className="virtualTriageGrid">
            {[
              {
                key: "working",
                title: copy.statusActive,
                description: copy.triageWorkingCopy,
                empty: copy.triageNoWorking,
                entries: triageWorkingEntries
              },
              {
                key: "blocked",
                title: copy.statusBlocked,
                description: copy.triageBlockedCopy,
                empty: copy.triageNoBlocked,
                entries: triageBlockedEntries
              },
              {
                key: "idle",
                title: copy.statusIdle,
                description: copy.triageIdleCopy,
                empty: copy.triageNoIdle,
                entries: triageIdleEntries
              }
            ].map((section) => (
              <section key={section.key} className={`virtualTriageColumn virtualTriageColumn${section.key}`}>
                <div className="virtualTriageColumnHead">
                  <div>
                    <h4>{section.title}</h4>
                    <p>{section.description}</p>
                  </div>
                  <span className={`virtualPressureBadge virtualPressureBadge${section.key === "blocked" ? "high" : section.key === "idle" ? "low" : "medium"}`}>
                    {section.entries.length}
                  </span>
                </div>

                <div className="virtualTriageList">
                  {section.entries.length ? (
                    section.entries.map((entry) => (
                      <button
                        key={`triage:${section.key}:${entry.agent.id}`}
                        type="button"
                        className={`virtualTriageCard virtualDeskCardButton virtualTriageCard${entry.agent.status} ${
                          selectedAgent?.id === entry.agent.id ? "virtualDeskCardSelected" : ""
                        }`}
                        onClick={() => toggleAgentFocus(entry.agent)}
                      >
                        <div className="virtualDeskCardHead">
                          <strong>{entry.agent.name}</strong>
                          <span>{getStatusLabel(entry.agent.status, copy)}</span>
                        </div>
                        <p className="virtualTriageTask">{entry.taskLabel}</p>
                        <div className="virtualDeskCardMeta">
                          <span>
                            {copy.missionOwnerRoom}: {entry.roomLabel}
                          </span>
                          <span>{entry.durationLabel}</span>
                          {entry.focusTask ? (
                            <span>
                              {copy.detailTaskId}: {entry.focusTask.tqId}
                            </span>
                          ) : null}
                        </div>

                        {section.key === "working" ? (
                          <div className="virtualTriageCallout">
                            <strong>{copy.mappingLabel}</strong>
                            <p>{getMissionMappingHeadline(entry.agent.missionMapping, copy)}</p>
                            <span>{getMissionMappingStateLabel(entry.agent.missionMapping, copy)}</span>
                          </div>
                        ) : null}

                        {section.key === "blocked" ? (
                          <div className="virtualTriageCallout virtualTriageCalloutBlocked">
                            <strong>{copy.detailBlockedReason}</strong>
                            <p>{entry.blockedReason || entry.waitingOn || common.na}</p>
                          </div>
                        ) : null}

                        {section.key === "idle" ? (
                          <div className="virtualTriageCallout">
                            <strong>{copy.advisoryLabel}</strong>
                            <p>
                              {entry.suggestion.advisory
                                ? `${entry.suggestion.advisory.title} · ${entry.suggestion.advisory.sourceLabel}`
                                : entry.suggestion.task
                                  ? `${entry.suggestion.task.title} · ${roomLabelById.get(entry.suggestion.roomId || "") || common.na}`
                                  : copy.triageSuggestionNone}
                            </p>
                            <span>
                              {entry.suggestion.advisory
                                ? entry.suggestion.advisory.rankingReason
                                : copy.triageSuggestionNone}
                            </span>
                          </div>
                        ) : null}
                      </button>
                    ))
                  ) : (
                    <div className="virtualOfficeEmpty">{section.empty}</div>
                  )}
                </div>
              </section>
            ))}
          </div>

          <div className="virtualTriageQueue">
            <div className="virtualOfficeRailHeader">
              <div>
                <p className="eyebrow">{copy.statusIdle}</p>
                <h3>{copy.triageQueueTitle}</h3>
              </div>
              <p className="virtualOfficeRailCopy">{copy.triageQueueCopy}</p>
            </div>

            <div className="virtualTriageQueueList">
              {triageIdleQueueEntries.length ? (
                triageIdleQueueEntries.map((entry) => (
                  <button
                    key={`triage-queue:${entry.agent.id}`}
                    type="button"
                    className="virtualTriageQueueItem virtualDeskCardButton"
                    onClick={() => (entry.suggestion.task ? focusMissionTask(entry.suggestion.task) : toggleAgentFocus(entry.agent))}
                  >
                    <div className="virtualDeskCardHead">
                      <strong>{entry.agent.name}</strong>
                      <span>{entry.suggestion.advisory ? entry.suggestion.advisory.sourceLabel : getSuggestionTone(entry.suggestion.kind)}</span>
                    </div>
                    <p>
                      {entry.suggestion.advisory
                        ? entry.suggestion.advisory.title
                        : entry.suggestion.task
                          ? `${entry.suggestion.task.title} · ${entry.suggestion.task.featureTitle}`
                          : copy.triageQueueNoSuggestion}
                    </p>
                    <p className="virtualMissionCardSummary">
                      {entry.suggestion.advisory
                        ? entry.suggestion.advisory.rankingReason
                        : copy.triageQueueNoSuggestion}
                    </p>
                    <div className="virtualDeskCardMeta">
                      <span>
                        {copy.missionOwnerRoom}: {entry.roomLabel}
                      </span>
                      <span>{entry.durationLabel}</span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="virtualOfficeEmpty">{copy.triageQueueEmpty}</div>
              )}
            </div>
          </div>
        </article>

        <div className="virtualOfficeLower">
          <article className="virtualOfficeRail">
            <div className="virtualOfficeRailHeader">
              <div>
                <p className="eyebrow">{copy.coordinationTitle}</p>
                <h3>{copy.coordinationTitle}</h3>
              </div>
              <p className="virtualOfficeRailCopy">{agents.coordinationHeadline || copy.coordinationHeadlineFallback}</p>
            </div>
            <div className="virtualOfficeCoordinationGrid">
              <article className="virtualOfficeDrawerPanel">
                <p className="eyebrow">{copy.coordinationActiveTitle}</p>
                {activeWorkloadAgents.length ? (
                  <div className="virtualMissionList">
                    {activeWorkloadAgents.map((entry) => (
                      <article
                        key={`active-workload:${entry.agent.id}`}
                        className={`virtualMissionCard ${selectedAgent?.id === entry.agent.id ? "virtualDeskCardSelected" : ""}`}
                      >
                        <button
                          type="button"
                          className="virtualMissionCardButton"
                          onClick={() => toggleAgentFocus(entry.agent)}
                        >
                          <div className="virtualMissionCardHead">
                            <strong>{entry.agent.name}</strong>
                            <span>{getWorkloadSourceLabel(entry.agent.workloads?.[0]?.sourceKind || "coordination", copy)}</span>
                          </div>
                          <p>{entry.agent.workloads?.[0]?.title || entry.taskLabel}</p>
                          <p className="virtualMissionCardSummary">
                            {entry.agent.workloads?.[0]?.summary || entry.agent.provenanceNote || copy.provenanceFallback}
                          </p>
                          <div className="virtualDeskCardMeta">
                            <span>{copy.provenanceLabel}: {getWorkloadConfidenceLabel(entry.agent.workloads?.[0]?.confidence || "partial", copy)}</span>
                            <span>{copy.missionOwnerRoom}: {entry.roomLabel}</span>
                            <span>{entry.agent.workloads?.[0]?.threadLabel || entry.agent.workloads?.[0]?.channelLabel || common.na}</span>
                          </div>
                        </button>
                        {renderMissionMapping(entry.agent.missionMapping, true)}
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="virtualOfficeEmpty">{copy.coordinationActiveEmpty}</div>
                )}
              </article>

              <article className="virtualOfficeDrawerPanel">
                <p className="eyebrow">{copy.coordinationSuggestionsTitle}</p>
                {coordinationSuggestions.length ? (
                  <div className="virtualMissionList">
                    {coordinationSuggestions.map((suggestion) => (
                      <article key={suggestion.id} className="virtualMissionCard">
                        <div className="virtualMissionCardHead">
                          <strong>{suggestion.title}</strong>
                          <span>{getWorkloadSourceLabel(suggestion.sourceKind, copy)}</span>
                        </div>
                        {suggestion.summary ? <p>{suggestion.summary}</p> : null}
                        <p className="virtualMissionCardSummary">
                          {copy.advisoryReasonLabel}: {suggestion.rankingReason}
                        </p>
                        <div className="virtualDeskCardMeta">
                          <span>{copy.advisoryLabel}: {suggestion.sourceLabel}</span>
                          <span>{copy.provenanceLabel}: {getWorkloadConfidenceLabel(suggestion.confidence, copy)}</span>
                          <span>{suggestion.threadLabel || suggestion.repo || common.na}</span>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="virtualOfficeEmpty">{copy.coordinationSuggestionsEmpty}</div>
                )}
              </article>
            </div>
          </article>

          <div className="virtualOfficeDigestGrid">
            <article className="virtualOfficeRail virtualOfficeDrawer">
              <div className="virtualOfficeRailHeader">
                <div>
                  <p className="eyebrow">{selectedAgent ? copy.missionOwnerAgent : selectedRoomEntry ? copy.roomFocus : copy.detailDrawerTitle}</p>
                  <h3>{selectedAgent ? selectedAgent.name : selectedRoomEntry?.room.label || copy.detailDrawerTitle}</h3>
                </div>
                <div className="virtualOfficeDrawerHeaderMeta">
                  {selectedAgent && selectedAgentStatusLabel ? (
                    <span className={`virtualRoomStatus virtualRoomStatus${selectedAgent.status}`}>{selectedAgentStatusLabel}</span>
                  ) : null}
                  {!selectedAgent && selectedRoomEntry && activeRoomStatusLabel ? (
                    <span className={`virtualRoomStatus virtualRoomStatus${selectedRoomEntry.roomStatus}`}>{activeRoomStatusLabel}</span>
                  ) : null}
                  {selectedFocus ? (
                    <button type="button" className="virtualOfficeDrawerClear" onClick={() => setSelectedFocus(null)}>
                      {copy.detailDrawerClear}
                    </button>
                  ) : null}
                </div>
              </div>

              <p className="virtualOfficeRailCopy">{copy.detailDrawerCopy}</p>

              {selectedFocus ? (
                <div className="virtualOfficeDrawerBody">
                  <article className="virtualOfficeDrawerPanel">
                    <p className="eyebrow">{selectedAgent ? copy.focus : copy.roomFocus}</p>
                    <dl className="virtualOfficeDetailList">
                      {selectedAgent ? (
                        <>
                          <div>
                            <dt>{copy.missionOwnerRoom}</dt>
                            <dd>{roomLabelById.get(selectedAgent.roomId) || common.na}</dd>
                          </div>
                          <div>
                            <dt>{copy.task}</dt>
                            <dd>{selectedAgentTaskLabel || common.unavailable}</dd>
                          </div>
                          <div>
                            <dt>{copy.focus}</dt>
                            <dd>{selectedAgent.focus || common.na}</dd>
                          </div>
                          <div>
                            <dt>{copy.nextHandoff}</dt>
                            <dd>{selectedAgent.nextHandoff || common.na}</dd>
                          </div>
                          <div>
                            <dt>{copy.provenanceLabel}</dt>
                            <dd>
                              {selectedAgent.workloads?.[0]
                                ? `${selectedAgent.workloads[0].title} · ${getWorkloadSourceLabel(selectedAgent.workloads[0].sourceKind, copy)}`
                                : selectedAgent.provenanceNote || copy.provenanceFallback}
                            </dd>
                          </div>
                        </>
                      ) : selectedRoomEntry ? (
                        <>
                          <div>
                            <dt>{copy.roomLead}</dt>
                            <dd>{selectedRoomEntry.roomLead}</dd>
                          </div>
                          <div>
                            <dt>{copy.roomOccupancy}</dt>
                            <dd>{selectedRoomEntry.occupancy}</dd>
                          </div>
                          <div>
                            <dt>{copy.roomQueue}</dt>
                            <dd>{selectedRoomEntry.roomQueue}</dd>
                          </div>
                          <div>
                            <dt>{copy.roomMission}</dt>
                            <dd>{selectedRoomMissionLabel}</dd>
                          </div>
                          <div>
                            <dt>{copy.roomExplanationTitle}</dt>
                            <dd>{getRoomExplanation(selectedRoomEntry.roomHistoryMetrics, selectedRoomEntry.roomPressureCount)}</dd>
                          </div>
                        </>
                      ) : null}
                    </dl>
                    {selectedAgent ? renderMissionMapping(selectedAgent.missionMapping) : null}
                  </article>

                  <article className="virtualOfficeDrawerPanel">
                    <p className="eyebrow">{copy.detailMissionTitle}</p>
                    <dl className="virtualOfficeDetailList">
                      {activeDetailTask ? (
                        <>
                          <div>
                            <dt>{copy.detailFeature}</dt>
                            <dd>{activeDetailFeature?.title || activeDetailTask.featureTitle || common.na}</dd>
                          </div>
                          <div>
                            <dt>{copy.task}</dt>
                            <dd>{activeDetailTask.title}</dd>
                          </div>
                          <div>
                            <dt>{copy.detailTaskId}</dt>
                            <dd>{activeDetailTask.tqId}</dd>
                          </div>
                          <div>
                            <dt>{copy.detailStatus}</dt>
                            <dd>{humanizeStateLabel(activeDetailTask.status) || common.na}</dd>
                          </div>
                          <div>
                            <dt>{copy.missionOwnership}</dt>
                            <dd>{activeDetailOwnership ? getOwnershipLabel(activeDetailOwnership.source, copy) : common.na}</dd>
                          </div>
                          <div>
                            <dt>{copy.updated}</dt>
                            <dd>{formatDateTimeLabel(parseTimestampMs(activeDetailTask.updatedAt), locale, common.na)}</dd>
                          </div>
                          <div>
                            <dt>{copy.detailHistorySource}</dt>
                            <dd>{getHistorySourceLabel(activeDetailMetrics?.source || activeDetailTask.historySource, copy)}</dd>
                          </div>
                          <div>
                            <dt>{copy.detailLifecycle}</dt>
                            <dd>{getLifecycleStateLabel(activeDetailMetrics?.lifecycle?.state, copy)}</dd>
                          </div>
                          <div>
                            <dt>{copy.detailLifecycleReason}</dt>
                            <dd>
                              {getLifecycleSummary({
                                lifecycle: activeDetailMetrics?.lifecycle,
                                status: activeDetailTask.status,
                                currentWaitHours: activeDetailMetrics?.currentWaitHours,
                                activityGapHours: activeDetailMetrics?.activityGapHours,
                                source: activeDetailMetrics?.source || activeDetailTask.historySource,
                                copy,
                                common,
                                formatHistoryHours
                              })}
                            </dd>
                          </div>
                          <div>
                            <dt>{copy.detailActiveAge}</dt>
                            <dd>{formatHistoryHours(activeDetailMetrics?.activeAgeHours)}</dd>
                          </div>
                          <div>
                            <dt>{copy.detailReviewWait}</dt>
                            <dd>{formatHistoryHours(activeDetailMetrics?.reviewWaitHours)}</dd>
                          </div>
                          <div>
                            <dt>{copy.detailBlockedDuration}</dt>
                            <dd>{formatHistoryHours(activeDetailMetrics?.blockedDurationHours)}</dd>
                          </div>
                          <div>
                            <dt>{copy.detailActivityGap}</dt>
                            <dd>{formatHistoryHours(activeDetailMetrics?.activityGapHours)}</dd>
                          </div>
                        </>
                      ) : selectedAgent ? (
                        <>
                          <div>
                            <dt>{copy.task}</dt>
                            <dd>{selectedAgentTaskLabel || common.unavailable}</dd>
                          </div>
                          <div>
                            <dt>{copy.detailTaskId}</dt>
                            <dd>{selectedAgent.currentTaskId || common.na}</dd>
                          </div>
                        </>
                      ) : selectedRoomEntry ? (
                        <>
                          <div>
                            <dt>{copy.roomMission}</dt>
                            <dd>{selectedRoomMissionLabel}</dd>
                          </div>
                          <div>
                            <dt>{copy.missionTasks}</dt>
                            <dd>{selectedRoomEntry.missionCoverage.taskCount}</dd>
                          </div>
                          <div>
                            <dt>{copy.roomTrendSummary}</dt>
                            <dd>{getRoomExplanation(selectedRoomEntry.roomHistoryMetrics, selectedRoomEntry.roomPressureCount)}</dd>
                          </div>
                        </>
                      ) : null}
                    </dl>
                    {activeDetailTask ? (
                      <div className="virtualOfficeDrawerActions">
                        <p className="eyebrow">{copy.detailActionsTitle}</p>
                        <MissionTaskActions
                          task={activeDetailTask}
                          copy={actionCopy}
                          mode={mutationMode}
                          showDisabledActions
                          onActionTriggered={({ task }) => pinFocusedTask(task)}
                        />
                      </div>
                    ) : null}
                  </article>

                  <article className="virtualOfficeDrawerPanel">
                    <p className="eyebrow">{copy.detailPathTitle}</p>
                    <dl className="virtualOfficeDetailList">
                      <div>
                        <dt>{copy.detailLastCompleted}</dt>
                        <dd>
                          {lastCompletedTask
                            ? `${lastCompletedTask.title} · ${formatDateTimeLabel(
                                parseTimestampMs(lastCompletedTask.updatedAt),
                                locale,
                                common.na
                              )}`
                            : common.na}
                        </dd>
                      </div>
                      <div>
                        <dt>{copy.detailNextStep}</dt>
                        <dd>{activeDetailTask?.nextPlannedStep || nextPlannedTask?.summary || nextPlannedTask?.title || common.na}</dd>
                      </div>
                      <div>
                        <dt>{copy.detailBlockedReason}</dt>
                        <dd>{activeDetailTask?.blockedReason || common.na}</dd>
                      </div>
                      <div>
                        <dt>{copy.detailWaitingOn}</dt>
                        <dd>{activeDetailTask?.waitingOn || common.na}</dd>
                      </div>
                    </dl>
                  </article>

                  <article className="virtualOfficeDrawerPanel">
                    <p className="eyebrow">{copy.detailHandoffTitle}</p>
                    {detailEvents.length ? (
                      <div className="virtualOfficeDrawerEventList">
                        {detailEvents.map((event) => (
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
                        ))}
                      </div>
                    ) : (
                      <div className="virtualOfficeEmpty">
                        <p>{copy.detailHandoffEmpty}</p>
                      </div>
                    )}
                  </article>

                  <article className="virtualOfficeDrawerPanel">
                    <p className="eyebrow">{copy.detailArtifactsTitle}</p>
                    {activeDetailFeature ? (
                      <dl className="virtualOfficeDetailList">
                        <div>
                          <dt>{copy.detailBranch}</dt>
                          <dd>{activeDetailFeature.delivery.branch || common.na}</dd>
                        </div>
                        <div>
                          <dt>{copy.detailPr}</dt>
                          <dd>
                            {activeDetailFeature.delivery.prUrl ? (
                              <a className="virtualOfficeArtifactLink" href={activeDetailFeature.delivery.prUrl} target="_blank" rel="noreferrer">
                                {activeDetailFeature.delivery.prUrl}
                              </a>
                            ) : (
                              common.na
                            )}
                          </dd>
                        </div>
                        <div>
                          <dt>{copy.detailBrief}</dt>
                          <dd>{activeDetailFeature.artifacts.brief || common.na}</dd>
                        </div>
                        <div>
                          <dt>{copy.detailRfc}</dt>
                          <dd>{activeDetailFeature.artifacts.rfc || common.na}</dd>
                        </div>
                        <div>
                          <dt>{copy.detailQa}</dt>
                          <dd>{activeDetailFeature.artifacts.qa || common.na}</dd>
                        </div>
                        <div>
                          <dt>{copy.detailRelease}</dt>
                          <dd>{activeDetailFeature.artifacts.release || common.na}</dd>
                        </div>
                      </dl>
                    ) : (
                      <div className="virtualOfficeEmpty">
                        <p>{copy.detailArtifactsEmpty}</p>
                      </div>
                    )}
                  </article>
                </div>
              ) : (
                <div className="virtualOfficeEmpty virtualOfficeDrawerEmpty">
                  <strong>{copy.detailDrawerIdleTitle}</strong>
                  <p>{copy.detailDrawerIdleCopy}</p>
                </div>
              )}
            </article>

            <div className="virtualOfficeRailStack">
              <article className="virtualOfficeRail">
                <div className="virtualOfficeRailHeader">
                  <div>
                    <p className="eyebrow">{activeRoomLabel}</p>
                    <h3>{copy.missionQueueTitle}</h3>
                  </div>
                  <p className="virtualOfficeRailCopy">{copy.missionQueueCopy}</p>
                </div>

                <div className="virtualMissionList">
                  {missionFeedTasks.length ? (
                    missionFeedTasks.map((task) => {
                      const ownership = getMissionOwnership(task, agentRoomById);
                      const taskSignalCount = pressureModel.taskSignalCountByTaskId[task.tqId] || 0;
                      const taskPressureSeverity = pressureModel.taskTopSeverityByTaskId[task.tqId];

                      return (
                        <button
                          key={task.tqId}
                          type="button"
                          className={`virtualMissionCard virtualMissionCardButton ${
                            taskPressureSeverity ? `virtualMissionCardSeverity${taskPressureSeverity}` : ""
                          }`}
                          onClick={() => focusMissionTask(task)}
                        >
                          <div className="virtualMissionCardHead">
                            <strong>{task.featureTitle}</strong>
                            <div className="virtualMissionCardHeadMeta">
                              {taskSignalCount > 0 ? (
                                <span className={`virtualPressureBadge virtualPressureBadge${taskPressureSeverity || "medium"}`}>
                                  {copy.missionSignals}: {taskSignalCount}
                                </span>
                              ) : null}
                              <span>{task.tqId}</span>
                            </div>
                          </div>
                          <p>{task.title}</p>
                          {task.summary ? <p className="virtualMissionCardSummary">{task.summary}</p> : null}
                          <p className="virtualMissionCardSummary">
                            {getLifecycleSummary({
                              lifecycle: pressureModel.taskMetricsByTaskId[task.tqId]?.lifecycle,
                              status: task.status,
                              currentWaitHours: pressureModel.taskMetricsByTaskId[task.tqId]?.currentWaitHours,
                              activityGapHours: pressureModel.taskMetricsByTaskId[task.tqId]?.activityGapHours,
                              source: pressureModel.taskMetricsByTaskId[task.tqId]?.source,
                              copy,
                              common,
                              formatHistoryHours
                            })}
                          </p>
                          <div className="virtualDeskCardMeta">
                            <span>
                              {copy.missionOwnerRoom}: {roomLabelById.get(ownership.roomId) || common.na}
                            </span>
                            <span>
                              {copy.missionOwnership}: {getOwnershipLabel(ownership.source, copy)}
                            </span>
                            {ownership.agentId ? (
                              <span>
                                {copy.missionOwnerAgent}: {agentNameById.get(ownership.agentId) || common.na}
                              </span>
                            ) : null}
                            {taskSignalCount > 0 ? (
                              <span>
                                {copy.missionSignals}: {taskSignalCount}
                              </span>
                            ) : null}
                            <span>
                              {copy.missionUpdated}: {formatDateTimeLabel(parseTimestampMs(task.updatedAt), locale, common.na)}
                            </span>
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="virtualOfficeEmpty">{copy.missionQueueEmpty}</div>
                  )}
                </div>
              </article>

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
                      <button
                        key={agent.id}
                        type="button"
                        className={`virtualDeskCard virtualDeskCardButton virtualDeskCard${agent.status} ${
                          selectedAgent?.id === agent.id ? "virtualDeskCardSelected" : ""
                        }`}
                        onClick={() => toggleAgentFocus(agent)}
                      >
                        <div className="virtualDeskCardHead">
                          <strong>{agent.name}</strong>
                          <span>{getStatusLabel(agent.status, copy)}</span>
                        </div>
                        <p>{getDeskTask(agent, copy, common.unavailable)}</p>
                        <p className="virtualMissionCardSummary">
                          {copy.provenanceLabel}:{" "}
                          {agent.workloads?.[0]
                            ? `${agent.workloads[0].title} · ${getWorkloadSourceLabel(agent.workloads[0].sourceKind, copy)}`
                            : agent.provenanceNote || copy.provenanceFallback}
                        </p>
                        <p className="virtualMissionCardSummary">
                          {copy.mappingLabel}: {getMissionMappingStateLabel(agent.missionMapping, copy)} · {getMissionMappingHeadline(agent.missionMapping, copy)}
                        </p>
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
                      </button>
                    ))
                  ) : (
                    <div className="virtualOfficeEmpty">{copy.roomEmpty}</div>
                  )}
                </div>
              </article>
            </div>

            <article className="virtualOfficeRail">
              <div className="virtualOfficeRailHeader">
                <div>
                  <p className="eyebrow">{activeRoomLabel}</p>
                  <h3>{copy.attentionTitle}</h3>
                </div>
                <p className="virtualOfficeRailCopy">{copy.attentionCopy}</p>
              </div>

              <div className="virtualAlertList">
                {attentionSignals.length ? (
                  attentionSignals.map((signal) => (
                    <button
                      key={signal.id}
                      type="button"
                      className={`virtualAlertItem virtualAlertItemButton virtualPressureItem virtualPressureItem${signal.severity}`}
                      onClick={() => focusPressureSignal(signal)}
                    >
                      <div className="virtualAlertItemHead">
                        <strong>{getPressureSignalLabel(signal, copy)}</strong>
                        <span className={`virtualPressureBadge virtualPressureBadge${signal.severity}`}>
                          {getPressureSeverityLabel(signal.severity, copy)}
                        </span>
                      </div>
                      <p>
                        {signal.taskId && taskById.get(signal.taskId)
                          ? getLifecycleSummary({
                              lifecycle: pressureModel.taskMetricsByTaskId[signal.taskId]?.lifecycle,
                              status: taskById.get(signal.taskId)?.status,
                              currentWaitHours: pressureModel.taskMetricsByTaskId[signal.taskId]?.currentWaitHours,
                              activityGapHours: pressureModel.taskMetricsByTaskId[signal.taskId]?.activityGapHours,
                              source: pressureModel.taskMetricsByTaskId[signal.taskId]?.source,
                              copy,
                              common,
                              formatHistoryHours
                            })
                          : getPressureSignalSummary(signal)}
                      </p>
                      <div className="virtualDeskCardMeta">
                        {getPressureSignalMeta(signal).map((item) => (
                          <span key={`${signal.id}:${item}`}>{item}</span>
                        ))}
                      </div>
                    </button>
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
