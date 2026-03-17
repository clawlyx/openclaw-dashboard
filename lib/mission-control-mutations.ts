import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { isMissionTaskActionAllowed, type MissionTaskAction } from "@/lib/mission-control-actions";
import type { MissionControlDeliveryMode, MissionControlTaskLane } from "@/lib/mission-control";

type MutableIdeaStatus = "captured" | "promoted";
type MutableFeatureStatus =
  | "intake"
  | "researching"
  | "building"
  | "qa"
  | "ready-to-release"
  | "blocked"
  | "released"
  | "rfc-approved";
type MutableTaskStatus = "ready" | "running" | "review" | "done" | "blocked";

type MutableIdeaRecord = {
  ideaId: string;
  title: string;
  status: MutableIdeaStatus;
  project: string;
  workspace: string;
  repo: string;
  rawPrompt: string;
  brief: string;
  featureId: string | null;
  createdAt: string;
  updatedAt: string;
};

type MutableTaskRecord = {
  tqId: string;
  title: string;
  lane: MissionControlTaskLane;
  status: MutableTaskStatus;
  updatedAt: string;
  summary: string;
};

type MutableFeatureRecord = {
  featureId: string;
  title: string;
  status: MutableFeatureStatus;
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
  tasks: MutableTaskRecord[];
  history: Array<{ at: string; action: string; detail: string }>;
};

type MutableState = {
  nextIdeaNumber: number;
  nextFeatureNumber: number;
  nextTaskNumber: number;
  ideas: MutableIdeaRecord[];
  features: MutableFeatureRecord[];
};

export type MissionIntakeInput = {
  title: string;
  details: string;
  repo?: string;
  project?: string;
  workspace?: string;
  deliveryMode?: MissionControlDeliveryMode;
  startLane?: MissionControlTaskLane;
};

export type MissionIntakeResult = {
  idea: MutableIdeaRecord;
  feature: MutableFeatureRecord;
  createdTask: MutableTaskRecord | null;
};

export type MissionTaskMutationResult = {
  feature: MutableFeatureRecord;
  task: MutableTaskRecord;
  nextTask: MutableTaskRecord | null;
};

const DEFAULT_MISSION_CONTROL_HOME = path.join(os.homedir(), ".openclaw", "mission-control");
const DEFAULT_REPO_ROOT = path.join(os.homedir(), "Documents", "GitHub");
const TASK_LANES: MissionControlTaskLane[] = ["research", "build", "qa", "release"];

let mutationQueue: Promise<unknown> = Promise.resolve();

const normalizeText = (value?: string | null) => String(value || "").trim();

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64) || "item";

const formatIdeaNumber = (value: number) => `IDEA-${String(value).padStart(3, "0")}`;
const formatFeatureNumber = (value: number, title: string) => `F-${String(value).padStart(4, "0")}-${slugify(title)}`;
const formatTaskNumber = (value: number) => `TQ-${String(value).padStart(3, "0")}`;
const numericSuffix = (value: string, prefix: string) => {
  const match = value.match(new RegExp(`^${prefix}-(\\d+)`));
  return match ? Number(match[1]) : 0;
};
const deriveNextIdeaNumber = (ideas: MutableIdeaRecord[]) =>
  Math.max(0, ...ideas.map((idea) => numericSuffix(idea.ideaId, "IDEA"))) + 1;
const deriveNextFeatureNumber = (features: MutableFeatureRecord[]) =>
  Math.max(0, ...features.map((feature) => numericSuffix(feature.featureId, "F"))) + 1;
const deriveNextTaskNumber = (features: MutableFeatureRecord[]) =>
  Math.max(0, ...features.flatMap((feature) => feature.tasks.map((task) => numericSuffix(task.tqId, "TQ")))) + 1;

const normalizeDeliveryMode = (input: string, hasRepoBinding: boolean): MissionControlDeliveryMode => {
  const value = normalizeText(input) as MissionControlDeliveryMode;
  if (!hasRepoBinding) return "advisory-only";
  switch (value) {
    case "local-only":
    case "commit-required":
    case "push-required":
    case "pr-required":
      return value;
    default:
      return "pr-required";
  }
};

const advisoryArtifactRoot = (missionControlHome: string, featureId: string) =>
  path.join(missionControlHome, "artifacts", "advisory", featureId);

const resolveRepoRoot = (repoInput: string) => {
  const configuredRoot =
    normalizeText(process.env.MISSION_CONTROL_REPO_ROOT) ||
    normalizeText(process.env.AGENT_LAUNCHPAD_REPO_ROOT) ||
    DEFAULT_REPO_ROOT;
  if (!repoInput) return configuredRoot;
  if (path.isAbsolute(repoInput)) return repoInput;
  return path.join(configuredRoot, repoInput);
};

const repoNameFromInput = (repoInput: string) => (repoInput ? path.basename(repoInput) : "");

const appendHistory = (
  history: MutableFeatureRecord["history"],
  action: string,
  detail: string,
  at = new Date().toISOString()
) => [...history, { at, action, detail }];

const transitionStatusForTarget = (target: MissionControlTaskLane): MutableFeatureStatus => {
  switch (target) {
    case "research":
      return "researching";
    case "build":
      return "building";
    case "qa":
      return "qa";
    case "release":
      return "ready-to-release";
  }
};

const taskTitleForLane = (featureTitle: string, lane: MissionControlTaskLane) => {
  switch (lane) {
    case "research":
      return `Research · ${featureTitle}`;
    case "build":
      return `Build · ${featureTitle}`;
    case "qa":
      return `QA · ${featureTitle}`;
    case "release":
      return `Release · ${featureTitle}`;
  }
};

const nextLaneAfter = (lane: MissionControlTaskLane) => {
  const currentIndex = TASK_LANES.indexOf(lane);
  if (currentIndex < 0 || currentIndex >= TASK_LANES.length - 1) return null;
  return TASK_LANES[currentIndex + 1];
};

const touchTask = (
  tasks: MutableTaskRecord[],
  lane: MissionControlTaskLane,
  nextTaskId: string,
  featureTitle: string,
  summary: string,
  status: MutableTaskStatus = "ready"
) => {
  const now = new Date().toISOString();
  const existing = tasks.find((task) => task.lane === lane) ?? null;
  if (existing) {
    return tasks.map((task) =>
      task.lane === lane
        ? {
            ...task,
            status,
            updatedAt: now,
            summary
          }
        : task
    );
  }

  return [
    ...tasks,
    {
      tqId: nextTaskId,
      title: taskTitleForLane(featureTitle, lane),
      lane,
      status,
      updatedAt: now,
      summary
    }
  ];
};

const defaultState = (): MutableState => ({
  nextIdeaNumber: 1,
  nextFeatureNumber: 1,
  nextTaskNumber: 1,
  ideas: [],
  features: []
});

const resolveRuntimePaths = () => {
  const missionControlHome =
    normalizeText(process.env.MISSION_CONTROL_HOME) ||
    normalizeText(process.env.AGENT_LAUNCHPAD_HOME) ||
    DEFAULT_MISSION_CONTROL_HOME;
  const stateFile =
    normalizeText(process.env.MISSION_CONTROL_STATE_FILE) ||
    normalizeText(process.env.AGENT_LAUNCHPAD_STATE_FILE) ||
    path.join(missionControlHome, "archive-state.json");

  return {
    missionControlHome,
    stateFile
  };
};

const ensureStateFile = async (stateFile: string) => {
  await fs.mkdir(path.dirname(stateFile), { recursive: true });
  try {
    await fs.access(stateFile);
  } catch {
    await fs.writeFile(stateFile, `${JSON.stringify(defaultState(), null, 2)}\n`, "utf8");
  }
};

const readState = async (stateFile: string): Promise<MutableState> => {
  await ensureStateFile(stateFile);
  const raw = await fs.readFile(stateFile, "utf8");
  if (!raw.trim()) return defaultState();

  try {
    const parsed = JSON.parse(raw) as Partial<MutableState>;
    const ideas = Array.isArray(parsed.ideas) ? (parsed.ideas as MutableIdeaRecord[]) : [];
    const features = Array.isArray(parsed.features) ? (parsed.features as MutableFeatureRecord[]) : [];
    return {
      nextIdeaNumber: parsed.nextIdeaNumber || deriveNextIdeaNumber(ideas),
      nextFeatureNumber: parsed.nextFeatureNumber || deriveNextFeatureNumber(features),
      nextTaskNumber: parsed.nextTaskNumber || deriveNextTaskNumber(features),
      ideas,
      features
    };
  } catch {
    return defaultState();
  }
};

const writeState = async (stateFile: string, state: MutableState) => {
  await fs.mkdir(path.dirname(stateFile), { recursive: true });
  await fs.writeFile(stateFile, `${JSON.stringify(state, null, 2)}\n`, "utf8");
};

const withStateLock = <T>(fn: () => Promise<T>) => {
  const next = mutationQueue.then(fn, fn);
  mutationQueue = next.then(() => undefined, () => undefined);
  return next;
};

const syncFeatureArtifactBundle = async ({
  repoRoot,
  feature,
  idea
}: {
  repoRoot: string;
  feature: MutableFeatureRecord;
  idea: MutableIdeaRecord;
}) => {
  const docsRoot = path.join(repoRoot, "docs");
  const paths = {
    root: docsRoot,
    brief: path.join(docsRoot, "briefs", `${feature.featureId}.md`),
    rfc: path.join(docsRoot, "rfc", `${feature.featureId}.md`),
    qa: path.join(docsRoot, "qa", `${feature.featureId}.md`),
    release: path.join(docsRoot, "release", `${feature.featureId}.md`)
  };

  await Promise.all([
    fs.mkdir(path.dirname(paths.brief), { recursive: true }),
    fs.mkdir(path.dirname(paths.rfc), { recursive: true }),
    fs.mkdir(path.dirname(paths.qa), { recursive: true }),
    fs.mkdir(path.dirname(paths.release), { recursive: true })
  ]);

  const taskSummary = feature.tasks.length
    ? feature.tasks.map((task) => `- ${task.tqId} · ${task.lane.toUpperCase()} · ${task.status.toUpperCase()} · ${task.summary}`).join("\n")
    : "- No execution tasks yet.";

  await Promise.all([
    fs.writeFile(
      paths.brief,
      `# ${feature.featureId} Brief\n\n## Title\n${feature.title}\n\n## Repo\n${feature.repo}\n\n## Idea Prompt\n${idea.rawPrompt}\n\n## Working Brief\n${idea.brief}\n\n## Tasks\n${taskSummary}\n`,
      "utf8"
    ),
    fs.writeFile(
      paths.rfc,
      `# ${feature.featureId} RFC\n\n## Context\n${idea.rawPrompt}\n\n## Scope\n${feature.summary}\n\n## Delivery Mode\n${feature.deliveryMode}\n\n## Current Lane\n${feature.currentLane}\n`,
      "utf8"
    ),
    fs.writeFile(
      paths.qa,
      `# ${feature.featureId} QA Plan\n\n## Current Status\n${feature.status}\n\n## Suggested Checks\n- Verify the main operator flow\n- Verify the repo binding\n- Verify the current lane task\n`,
      "utf8"
    ),
    fs.writeFile(
      paths.release,
      `# ${feature.featureId} Release Packet\n\n## Delivery State\n- Status: ${feature.status}\n- Current lane: ${feature.currentLane}\n- Branch: ${feature.delivery.branch}\n- PR: ${feature.delivery.prUrl || "Not opened yet"}\n`,
      "utf8"
    )
  ]);

  return paths;
};

const resolveArtifactIdea = (feature: MutableFeatureRecord, state: MutableState, at: string): MutableIdeaRecord =>
  state.ideas.find((idea) => idea.ideaId === feature.linkedIdeaId) || {
    ideaId: feature.linkedIdeaId || `${feature.featureId}-idea`,
    title: feature.title,
    status: "promoted",
    project: feature.project,
    workspace: feature.workspace,
    repo: feature.repo,
    rawPrompt: feature.summary,
    brief: feature.summary,
    featureId: feature.featureId,
    createdAt: at,
    updatedAt: at
  };

export const createMissionControlIntake = async (input: MissionIntakeInput): Promise<MissionIntakeResult> =>
  withStateLock(async () => {
    const title = normalizeText(input.title);
    const details = normalizeText(input.details);
    if (!title || !details) {
      throw new Error("Title and details are required");
    }

    const { missionControlHome, stateFile } = resolveRuntimePaths();
    const state = await readState(stateFile);
    const repoInput = normalizeText(input.repo);
    const repo = repoNameFromInput(repoInput);
    const project = normalizeText(input.project) || repo || slugify(title);
    const workspace = normalizeText(input.workspace) || repo || project;
    const hasRepoBinding = Boolean(repoInput && workspace);
    const deliveryMode = normalizeDeliveryMode(input.deliveryMode || "", hasRepoBinding);
    const ideaId = formatIdeaNumber(state.nextIdeaNumber);
    const featureId = formatFeatureNumber(state.nextFeatureNumber, title);
    const now = new Date().toISOString();
    const requestedLane = input.startLane || "research";
    const effectiveLane =
      deliveryMode === "advisory-only" && requestedLane !== "research" ? "research" : requestedLane;
    const resolvedRepoRoot = hasRepoBinding
      ? resolveRepoRoot(repoInput)
      : advisoryArtifactRoot(missionControlHome, featureId);

    const idea: MutableIdeaRecord = {
      ideaId,
      title,
      status: "promoted",
      project,
      workspace,
      repo: repo || "unbound",
      rawPrompt: details,
      brief: details,
      featureId,
      createdAt: now,
      updatedAt: now
    };

    let feature: MutableFeatureRecord = {
      featureId,
      title,
      status: transitionStatusForTarget(effectiveLane),
      project,
      workspace,
      repo: repo || "unbound",
      deliveryMode,
      linkedIdeaId: ideaId,
      currentLane: effectiveLane,
      artifactRoot: path.join(resolvedRepoRoot, "docs"),
      artifacts: {
        brief: "",
        rfc: "",
        qa: "",
        release: ""
      },
      summary: details,
      delivery: {
        branch: `feat/${featureId}`,
        prUrl: null,
        prMerged: false,
        repoRoot: resolvedRepoRoot
      },
      tasks: [],
      history: appendHistory([], "idea", "Created from mission control intake.", now)
    };

    const tasks = touchTask(
      feature.tasks,
      effectiveLane,
      formatTaskNumber(state.nextTaskNumber),
      feature.title,
      effectiveLane === "research"
        ? "Queued the first research lane for this feature."
        : `Queued the ${effectiveLane} lane for this feature.`,
      "ready"
    );

    feature = {
      ...feature,
      tasks,
      history: appendHistory(feature.history, "promote", `Promoted into the ${effectiveLane} lane.`, now)
    };

    const artifacts = await syncFeatureArtifactBundle({
      repoRoot: resolvedRepoRoot,
      feature,
      idea
    });

    feature = {
      ...feature,
      artifactRoot: artifacts.root,
      artifacts: {
        brief: artifacts.brief,
        rfc: artifacts.rfc,
        qa: artifacts.qa,
        release: artifacts.release
      }
    };

    const nextState: MutableState = {
      nextIdeaNumber: state.nextIdeaNumber + 1,
      nextFeatureNumber: state.nextFeatureNumber + 1,
      nextTaskNumber: state.nextTaskNumber + 1,
      ideas: [idea, ...state.ideas],
      features: [feature, ...state.features]
    };

    await writeState(stateFile, nextState);

    return {
      idea,
      feature,
      createdTask: feature.tasks[0] || null
    };
  });

export const updateMissionControlTask = async ({
  tqId,
  action
}: {
  tqId: string;
  action: MissionTaskAction;
}): Promise<MissionTaskMutationResult> =>
  withStateLock(async () => {
    const taskId = normalizeText(tqId);
    if (!taskId) {
      throw new Error("Task id is required");
    }

    const { missionControlHome, stateFile } = resolveRuntimePaths();
    const state = await readState(stateFile);
    const featureIndex = state.features.findIndex((feature) => feature.tasks.some((task) => task.tqId === taskId));

    if (featureIndex < 0) {
      throw new Error(`Task ${taskId} was not found in the local mission archive state.`);
    }

    const sourceFeature = state.features[featureIndex];
    const taskIndex = sourceFeature.tasks.findIndex((task) => task.tqId === taskId);
    if (taskIndex < 0) {
      throw new Error(`Task ${taskId} was not found in feature ${sourceFeature.featureId}.`);
    }

    const now = new Date().toISOString();
    let nextTaskNumber = state.nextTaskNumber;
    let nextTask: MutableTaskRecord | null = null;
    let featureStatus = sourceFeature.status;
    let currentLane = sourceFeature.currentLane;
    let history = [...sourceFeature.history];
    let tasks = sourceFeature.tasks.map((task) => ({ ...task }));

    const sourceTask = tasks[taskIndex];
    if (sourceTask.lane !== sourceFeature.currentLane) {
      throw new Error(
        `Task ${sourceTask.tqId} is in the ${sourceTask.lane} lane, but the feature is currently in ${sourceFeature.currentLane}.`
      );
    }
    if (
      !isMissionTaskActionAllowed({
        status: sourceTask.status,
        lane: sourceTask.lane,
        mode: "local",
        action
      })
    ) {
      throw new Error(`Action ${action} is not allowed for a ${sourceTask.status} task in the ${sourceTask.lane} lane.`);
    }

    const updateSelectedTask = (status: MutableTaskStatus, summary: string) => {
      tasks = tasks.map((task, index) =>
        index === taskIndex
          ? {
              ...task,
              status,
              summary,
              updatedAt: now
            }
          : task
      );
    };

    switch (action) {
      case "start":
        updateSelectedTask("running", "Mission Control marked this task as running.");
        featureStatus = transitionStatusForTarget(sourceTask.lane);
        currentLane = sourceTask.lane;
        history = appendHistory(history, "task", `${sourceTask.tqId} started from Mission Control.`, now);
        break;
      case "send-to-review":
        updateSelectedTask("review", "Mission Control sent this task to review.");
        featureStatus = sourceTask.lane === "research" ? "rfc-approved" : transitionStatusForTarget(sourceTask.lane);
        currentLane = sourceTask.lane;
        history = appendHistory(history, "task", `${sourceTask.tqId} moved to review.`, now);
        break;
      case "block":
        updateSelectedTask("blocked", "Mission Control marked this task as blocked.");
        featureStatus = "blocked";
        currentLane = sourceTask.lane;
        history = appendHistory(history, "task", `${sourceTask.tqId} was blocked.`, now);
        break;
      case "ready":
        updateSelectedTask("ready", "Mission Control returned this task to ready.");
        featureStatus = transitionStatusForTarget(sourceTask.lane);
        currentLane = sourceTask.lane;
        history = appendHistory(history, "task", `${sourceTask.tqId} returned to ready.`, now);
        break;
      case "advance": {
        const followingLane = nextLaneAfter(sourceTask.lane);
        updateSelectedTask(
          "done",
          followingLane
            ? `Mission Control completed ${sourceTask.lane} and queued ${followingLane}.`
            : "Mission Control completed the release lane."
        );

        if (followingLane) {
          const existingNextTask = tasks.find((task) => task.lane === followingLane) ?? null;
          const nextTaskId = existingNextTask?.tqId || formatTaskNumber(nextTaskNumber);
          const followOnSummary =
            followingLane === "build"
              ? "Research is complete. Build is ready to start."
              : followingLane === "qa"
                ? "Build is complete. QA is ready to start."
                : "QA is complete. Release is ready to start.";

          tasks = touchTask(tasks, followingLane, nextTaskId, sourceFeature.title, followOnSummary, "ready");
          nextTask = tasks.find((task) => task.lane === followingLane) || null;
          if (!existingNextTask) {
            nextTaskNumber += 1;
          }
          currentLane = followingLane;
          featureStatus = transitionStatusForTarget(followingLane);
          history = appendHistory(
            history,
            "advance",
            `${sourceTask.tqId} completed and ${nextTaskId} entered ${followingLane}.`,
            now
          );
        } else {
          currentLane = "release";
          featureStatus = "released";
          history = appendHistory(history, "release", `${sourceTask.tqId} completed and the feature was released.`, now);
        }
        break;
      }
    }

    let feature: MutableFeatureRecord = {
      ...sourceFeature,
      status: featureStatus,
      currentLane,
      tasks,
      history
    };

    const artifactIdea = resolveArtifactIdea(feature, state, now);
    const artifactRepoRoot = feature.delivery.repoRoot || advisoryArtifactRoot(missionControlHome, feature.featureId);
    const artifacts = await syncFeatureArtifactBundle({
      repoRoot: artifactRepoRoot,
      feature,
      idea: artifactIdea
    });

    feature = {
      ...feature,
      artifactRoot: artifacts.root,
      artifacts: {
        brief: artifacts.brief,
        rfc: artifacts.rfc,
        qa: artifacts.qa,
        release: artifacts.release
      },
      delivery: {
        ...feature.delivery,
        repoRoot: artifactRepoRoot
      }
    };

    const nextState: MutableState = {
      ...state,
      nextTaskNumber,
      features: state.features.map((featureEntry, index) => (index === featureIndex ? feature : featureEntry))
    };

    await writeState(stateFile, nextState);

    const task = feature.tasks.find((taskEntry) => taskEntry.tqId === taskId);
    if (!task) {
      throw new Error(`Task ${taskId} was updated but could not be resolved afterwards.`);
    }

    return {
      feature,
      task,
      nextTask
    };
  });
