import type { MissionControlTaskLane, MissionControlTaskStatus } from "@/lib/mission-control";

export type MissionTaskAction = "start" | "send-to-review" | "advance" | "ready" | "block";
export type MissionTaskMutationMode = "local" | "remote";

export const getMissionTaskActions = ({
  status,
  lane,
  mode
}: {
  status: MissionControlTaskStatus;
  lane: MissionControlTaskLane;
  mode: MissionTaskMutationMode;
}) => {
  if (mode === "remote") {
    switch (status) {
      case "ready":
      case "running":
        return ["block"] as MissionTaskAction[];
      case "review":
        return [lane === "release" ? "advance" : "advance", "block"] as MissionTaskAction[];
      case "blocked":
        return ["ready"] as MissionTaskAction[];
      case "done":
        return [] as MissionTaskAction[];
    }
  }

  switch (status) {
    case "ready":
      return ["start", "block"] as MissionTaskAction[];
    case "running":
      return ["send-to-review", "block"] as MissionTaskAction[];
    case "review":
      return ["advance", "block"] as MissionTaskAction[];
    case "blocked":
      return ["ready"] as MissionTaskAction[];
    case "done":
      return [] as MissionTaskAction[];
  }
};

export const isMissionTaskActionAllowed = ({
  status,
  lane,
  mode,
  action
}: {
  status: MissionControlTaskStatus;
  lane: MissionControlTaskLane;
  mode: MissionTaskMutationMode;
  action: MissionTaskAction;
}) => getMissionTaskActions({ status, lane, mode }).includes(action);
