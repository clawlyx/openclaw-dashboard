"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import type { MissionControlDeliveryMode, MissionControlTaskLane } from "@/lib/mission-control";

type MissionIntakeMessages = {
  intakeTitle: string;
  intakeDescription: string;
  intakeTitleField: string;
  intakeDetailsField: string;
  intakeRepoField: string;
  intakeProjectField: string;
  intakeWorkspaceField: string;
  intakeDeliveryModeField: string;
  intakeStartLaneField: string;
  intakeSubmit: string;
  intakeSubmitting: string;
  intakeSuccess: string;
  intakeError: string;
  intakeTitlePlaceholder: string;
  intakeDetailsPlaceholder: string;
  intakeRepoPlaceholder: string;
  intakeProjectPlaceholder: string;
  intakeWorkspacePlaceholder: string;
  laneResearch: string;
  laneBuild: string;
  laneQa: string;
  laneRelease: string;
  deliveryAdvisoryOnly: string;
  deliveryLocalOnly: string;
  deliveryCommitRequired: string;
  deliveryPushRequired: string;
  deliveryPrRequired: string;
};

export function MissionIntakeForm({
  copy,
  defaultRepo = "openclaw-dashboard"
}: {
  copy: MissionIntakeMessages;
  defaultRepo?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [repo, setRepo] = useState(defaultRepo);
  const [project, setProject] = useState("");
  const [workspace, setWorkspace] = useState("");
  const [deliveryMode, setDeliveryMode] = useState<MissionControlDeliveryMode>("pr-required");
  const [startLane, setStartLane] = useState<MissionControlTaskLane>("research");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    startTransition(async () => {
      try {
        const response = await fetch("/api/mission-control/intake", {
          method: "POST",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({
            title,
            details,
            repo,
            project,
            workspace,
            deliveryMode,
            startLane
          })
        });

        const result = (await response.json().catch(() => ({}))) as {
          error?: string;
          feature?: { featureId?: string; title?: string };
          createdTask?: { tqId?: string };
        };

        if (!response.ok) {
          setError(result.error || copy.intakeError);
          return;
        }

        setSuccess(
          result.createdTask?.tqId
            ? `${copy.intakeSuccess} ${result.createdTask.tqId}`
            : result.feature?.featureId
              ? `${copy.intakeSuccess} ${result.feature.featureId}`
              : copy.intakeSuccess
        );
        setTitle("");
        setDetails("");
        setProject("");
        setWorkspace("");
        router.refresh();
      } catch {
        setError(copy.intakeError);
      }
    });
  };

  return (
    <form className="missionIntakeForm" onSubmit={handleSubmit}>
      <div className="missionIntakeHeader">
        <p className="eyebrow">{copy.intakeTitle}</p>
        <p className="missionIntakeCopy">{copy.intakeDescription}</p>
      </div>

      <label className="missionField">
        <span className="missionFieldLabel">{copy.intakeTitleField}</span>
        <input
          className="missionFieldInput"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder={copy.intakeTitlePlaceholder}
          required
        />
      </label>

      <label className="missionField">
        <span className="missionFieldLabel">{copy.intakeDetailsField}</span>
        <textarea
          className="missionFieldInput missionFieldTextarea"
          value={details}
          onChange={(event) => setDetails(event.target.value)}
          placeholder={copy.intakeDetailsPlaceholder}
          required
        />
      </label>

      <div className="missionFieldGrid">
        <label className="missionField">
          <span className="missionFieldLabel">{copy.intakeRepoField}</span>
          <input
            className="missionFieldInput"
            value={repo}
            onChange={(event) => setRepo(event.target.value)}
            placeholder={copy.intakeRepoPlaceholder}
          />
        </label>
        <label className="missionField">
          <span className="missionFieldLabel">{copy.intakeProjectField}</span>
          <input
            className="missionFieldInput"
            value={project}
            onChange={(event) => setProject(event.target.value)}
            placeholder={copy.intakeProjectPlaceholder}
          />
        </label>
        <label className="missionField">
          <span className="missionFieldLabel">{copy.intakeWorkspaceField}</span>
          <input
            className="missionFieldInput"
            value={workspace}
            onChange={(event) => setWorkspace(event.target.value)}
            placeholder={copy.intakeWorkspacePlaceholder}
          />
        </label>
      </div>

      <div className="missionFieldGrid">
        <label className="missionField">
          <span className="missionFieldLabel">{copy.intakeDeliveryModeField}</span>
          <select
            className="missionFieldInput"
            value={deliveryMode}
            onChange={(event) => setDeliveryMode(event.target.value as MissionControlDeliveryMode)}
          >
            <option value="pr-required">{copy.deliveryPrRequired}</option>
            <option value="push-required">{copy.deliveryPushRequired}</option>
            <option value="commit-required">{copy.deliveryCommitRequired}</option>
            <option value="local-only">{copy.deliveryLocalOnly}</option>
            <option value="advisory-only">{copy.deliveryAdvisoryOnly}</option>
          </select>
        </label>

        <label className="missionField">
          <span className="missionFieldLabel">{copy.intakeStartLaneField}</span>
          <select
            className="missionFieldInput"
            value={startLane}
            onChange={(event) => setStartLane(event.target.value as MissionControlTaskLane)}
          >
            <option value="research">{copy.laneResearch}</option>
            <option value="build">{copy.laneBuild}</option>
            <option value="qa">{copy.laneQa}</option>
            <option value="release">{copy.laneRelease}</option>
          </select>
        </label>
      </div>

      <div className="missionIntakeActions">
        <button className="missionSubmitButton" type="submit" disabled={isPending}>
          {isPending ? copy.intakeSubmitting : copy.intakeSubmit}
        </button>
        {error ? <p className="missionFormStatus missionFormStatusError">{error}</p> : null}
        {success ? <p className="missionFormStatus missionFormStatusSuccess">{success}</p> : null}
      </div>
    </form>
  );
}
