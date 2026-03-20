import { SectionShell } from "@/components/section-shell";
import { formatDateTimeLabel } from "@/lib/dashboard-presenters";
import { formatMessage, type Locale } from "@/lib/i18n";
import type {
  AgentsSnapshot,
  AgentActivitySnapshot,
  AgentMissionMappingSnapshot,
  AgentQueueSnapshot,
  AgentRoomSnapshot,
  AgentSnapshot,
  AgentWorkloadSourceKind,
  AgentWorkStatus
} from "@/lib/agents";

type AgentsFocus = "floor" | "queues" | "activity";

type AgentsMessages = {
  section: string;
  title: string;
  copy: string;
  floorTitle: string;
  floorDescription: string;
  queuesTitle: string;
  queuesDescription: string;
  activityTitle: string;
  activityDescription: string;
  summaryAgents: string;
  summaryAttention: string;
  summaryQueues: string;
  summaryRooms: string;
  statusActive: string;
  statusBlocked: string;
  statusWaiting: string;
  statusIdle: string;
  statusOffline: string;
  roomLead: string;
  roomCapacity: string;
  roomQueue: string;
  roomEmpty: string;
  queueItems: string;
  sessionCount: string;
  model: string;
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
  boardTitle: string;
  boardCopy: string;
  laneBoardCopy: string;
  deskFeedTitle: string;
  deskFeedCopy: string;
  queueOwner: string;
  queueTarget: string;
  queueCount: string;
  utilization: string;
  attentionTitle: string;
  attentionCopy: string;
  timelineTitle: string;
  timelineCopy: string;
  roomOccupancy: string;
  provenanceLabel: string;
  provenanceFallback: string;
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
  workloadSourceRepoWork: string;
  workloadSourcePersonalResearch: string;
  workloadSourceCoordination: string;
  workloadSourceSupport: string;
};

const roomAreaClass: Record<string, string> = {
  dispatch: "officeRoomAreaDispatch",
  research: "officeRoomAreaResearch",
  build: "officeRoomAreaBuild",
  review: "officeRoomAreaReview",
  release: "officeRoomAreaRelease",
  concierge: "officeRoomAreaConcierge"
};

const toneClass: Record<NonNullable<AgentRoomSnapshot["tone"]>, string> = {
  sage: "officeRoomToneSage",
  clay: "officeRoomToneClay",
  ocean: "officeRoomToneOcean",
  gold: "officeRoomToneGold",
  berry: "officeRoomToneBerry",
  slate: "officeRoomToneSlate"
};

const statusClass: Record<AgentWorkStatus, string> = {
  active: "agentDeskActive",
  blocked: "agentDeskBlocked",
  waiting: "agentDeskWaiting",
  idle: "agentDeskIdle",
  offline: "agentDeskOffline"
};

const parseTimestampMs = (value?: string) => {
  if (!value) return undefined;
  const valueMs = Date.parse(value);
  return Number.isFinite(valueMs) ? valueMs : undefined;
};

const getStatusLabel = (status: AgentWorkStatus, copy: AgentsMessages) => {
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

const getDeskTask = (agent: AgentSnapshot, copy: AgentsMessages, na: string) => {
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

const getEventSummary = (event: AgentActivitySnapshot, copy: AgentsMessages) => {
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

const getWorkloadSourceLabel = (sourceKind: AgentWorkloadSourceKind, copy: AgentsMessages) => {
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

const getMissionMappingStateLabel = (mapping: AgentMissionMappingSnapshot | undefined, copy: AgentsMessages) => {
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

const getMissionMappingHeadline = (mapping: AgentMissionMappingSnapshot | undefined, copy: AgentsMessages) => {
  if (!mapping) return copy.mappingUnavailable;
  return mapping.taskTitle || mapping.featureTitle || copy.mappingUnavailable;
};

const getMissionMappingHint = (mapping: AgentMissionMappingSnapshot | undefined, copy: AgentsMessages) => {
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
  const leftScore = (left.status === "blocked" ? 300 : left.status === "active" ? 200 : 0) + (left.queueCount || 0) * 10;
  const rightScore =
    (right.status === "blocked" ? 300 : right.status === "active" ? 200 : 0) + (right.queueCount || 0) * 10;

  if (rightScore !== leftScore) return rightScore - leftScore;
  return (right.utilization || 0) - (left.utilization || 0);
};

export function AgentsOfficePanel({
  id,
  agents,
  locale,
  copy,
  common,
  focus = "floor"
}: {
  id?: string;
  agents: AgentsSnapshot;
  locale: Locale;
  copy: AgentsMessages;
  common: { na: string; unavailable: string };
  focus?: AgentsFocus;
}) {
  const officeName = agents.officeName || copy.fallbackOffice;
  const onlineAgents = agents.agents.filter((agent) => agent.status !== "offline");
  const blockedAgents = agents.agents.filter((agent) => agent.status === "blocked");
  const attentionAgents = [...agents.agents]
    .filter((agent) => agent.status === "blocked" || (agent.queueCount || 0) >= 4)
    .sort(sortByLoad)
    .slice(0, 6);
  const queueTotal = agents.agents.reduce((sum, agent) => sum + (agent.queueCount || 0), 0);
  const roomsWithAgents = agents.rooms.filter((room) => agents.agents.some((agent) => agent.roomId === room.id));
  const recentEvents = agents.recentEvents.slice(0, 8);
  const updatedLabel = formatDateTimeLabel(parseTimestampMs(agents.updatedAt), locale, common.na);
  const latestEventLabel = formatDateTimeLabel(parseTimestampMs(recentEvents[0]?.at), locale, common.na);
  const floorStatusValue = blockedAgents.length > 0 ? copy.floorAttention : copy.floorHealthy;
  const renderMissionMapping = (agent: AgentSnapshot) => {
    const mapping = agent.missionMapping;
    const mappingHref = getMissionControlHref(mapping, locale);
    const mappingState = mapping?.state || "unavailable";
    const mappingReference = mapping?.taskId || mapping?.featureId;

    return (
      <div className={`missionMappingCard missionMappingCard${mappingState.charAt(0).toUpperCase()}${mappingState.slice(1)}`}>
        <div className="missionMappingHead">
          <span className="missionMappingLabel">{copy.mappingLabel}</span>
          <span className={`missionMappingChip missionMappingChip${mappingState.charAt(0).toUpperCase()}${mappingState.slice(1)}`}>
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

  const summaryCards = [
    { label: copy.summaryAgents, value: String(onlineAgents.length) },
    { label: copy.summaryAttention, value: String(blockedAgents.length), warning: blockedAgents.length > 0 },
    { label: copy.summaryQueues, value: String(queueTotal) },
    { label: copy.summaryRooms, value: String(roomsWithAgents.length || agents.rooms.length) }
  ];

  const roomEntries = agents.rooms.map((room) => {
    const roomAgents = agents.agents.filter((agent) => agent.roomId === room.id).sort(sortByLoad);
    const roomQueue = roomAgents.reduce((sum, agent) => sum + (agent.queueCount || 0), 0);
    const roomCapacity = room.capacity || Math.max(2, roomAgents.length);
    const roomLead = room.lead || roomAgents[0]?.name;
    const roomLoad = roomAgents.length
      ? Math.round(roomAgents.reduce((sum, agent) => sum + (agent.utilization || 0), 0) / roomAgents.length)
      : 0;

    return {
      room,
      roomAgents,
      roomQueue,
      roomCapacity,
      roomLead,
      roomLoad
    };
  });

  const queues = (agents.queues.length
    ? agents.queues
    : roomEntries
        .filter((entry) => entry.roomQueue > 0)
        .map(
          (entry) =>
            ({
              id: `${entry.room.id}-lane`,
              label: entry.room.label,
              owner: entry.roomLead,
              target: entry.room.label,
              count: entry.roomQueue,
              tone: entry.roomAgents.some((agent) => agent.status === "blocked")
                ? "warning"
                : entry.roomAgents.some((agent) => agent.status === "active")
                  ? "active"
                  : "default"
            }) satisfies AgentQueueSnapshot
        )).sort((left, right) => right.count - left.count);

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

  const sharedHeader = (
    <>
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
          {copy.floorStatus}: {blockedAgents.length > 0 ? copy.floorAttention : floorStatusValue}
        </span>
        <span className="metaChip">{formatMessage(copy.floorHint, { count: onlineAgents.length })}</span>
      </div>
    </>
  );

  if (focus === "queues") {
    const maxQueueCount = Math.max(1, ...queues.map((queue) => queue.count));

    return (
      <SectionShell id={id} eyebrow={copy.section} title={copy.queuesTitle} description={copy.queuesDescription}>
        {sharedHeader}

        <div className="officeSecondaryGrid officeSecondaryGridWide">
          <article className="officeRailCard">
            <div className="officeRailHeader">
              <div>
                <p className="eyebrow">{copy.queueCount}</p>
                <h3>{copy.queuesTitle}</h3>
              </div>
              <p className="officeRailCopy">{copy.laneBoardCopy}</p>
            </div>

            <div className="queueLaneList">
              {queues.map((queue) => (
                <article key={queue.id} className={`queueLane queueLane${queue.tone === "warning" ? "Warning" : ""}`}>
                  <div className="queueLaneHead">
                    <div>
                      <strong>{queue.label}</strong>
                      <p>
                        {copy.queueOwner}: {queue.owner || common.na}
                      </p>
                    </div>
                    <strong>{queue.count}</strong>
                  </div>
                  <div className="queueLaneBar">
                    <span style={{ width: `${(queue.count / maxQueueCount) * 100}%` }} />
                  </div>
                  <p className="queueLaneTail">
                    {copy.queueTarget}: {queue.target || common.na}
                  </p>
                </article>
              ))}
            </div>
          </article>

          <article className="officeRailCard">
            <div className="officeRailHeader">
              <div>
                <p className="eyebrow">{copy.summaryAttention}</p>
                <h3>{copy.attentionTitle}</h3>
              </div>
              <p className="officeRailCopy">{copy.attentionCopy}</p>
            </div>

            <div className="attentionDeskList">
              {attentionAgents.map((agent) => (
                <article key={agent.id} className={`agentStrip ${statusClass[agent.status]}`}>
                  <div className="agentStripHead">
                    <strong>{agent.name}</strong>
                    <span>{getStatusLabel(agent.status, copy)}</span>
                  </div>
                  <p>{getDeskTask(agent, copy, common.na)}</p>
                  <div className="agentStripMeta">
                    <span>
                      {copy.queueCount}: {agent.queueCount || 0}
                    </span>
                    <span>
                      {copy.utilization}: {agent.utilization || 0}%
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </article>
        </div>

        <div className="roomLoadGrid">
          {roomEntries.map(({ room, roomAgents, roomQueue, roomLead, roomCapacity, roomLoad }) => (
            <article key={room.id} className={`roomLoadCard ${toneClass[room.tone]}`}>
              <div className="roomLoadHead">
                <div>
                  <strong>{room.label}</strong>
                  <p>{room.description}</p>
                </div>
                <span>{roomLoad}%</span>
              </div>
              <div className="agentStripMeta">
                <span>
                  {copy.roomLead}: {roomLead || common.na}
                </span>
                <span>
                  {copy.roomCapacity}: {roomAgents.length}/{roomCapacity}
                </span>
              </div>
              <div className="agentStripMeta">
                <span>
                  {copy.roomQueue}: {roomQueue}
                </span>
                <span>
                  {copy.summaryAgents}: {roomAgents.length}
                </span>
              </div>
            </article>
          ))}
        </div>
      </SectionShell>
    );
  }

  if (focus === "activity") {
    const latestAgents = [...agents.agents]
      .filter((agent) => agent.lastEventAt)
      .sort((left, right) => (parseTimestampMs(right.lastEventAt) || 0) - (parseTimestampMs(left.lastEventAt) || 0))
      .slice(0, 6);

    return (
      <SectionShell id={id} eyebrow={copy.section} title={copy.activityTitle} description={copy.activityDescription}>
        {sharedHeader}

        <div className="officeSecondaryGrid officeSecondaryGridWide">
          <article className="officeRailCard">
            <div className="officeRailHeader">
              <div>
                <p className="eyebrow">{copy.latest}</p>
                <h3>{copy.timelineTitle}</h3>
              </div>
              <p className="officeRailCopy">{copy.timelineCopy}</p>
            </div>

            <div className="timelineList">
              {recentEvents.map((event) => {
                const agent = agents.agents.find((item) => item.id === event.agentId);

                return (
                  <article key={event.id} className={`timelineItem timelineItem${event.tone === "warning" ? "Warning" : ""}`}>
                    <div className="timelineDot" />
                    <div className="timelineBody">
                      <div className="timelineHead">
                        <strong>{getEventSummary(event, copy)}</strong>
                        <span>{formatDateTimeLabel(parseTimestampMs(event.at), locale, common.na)}</span>
                      </div>
                      <p>{event.detail || getDeskTask(agent || { id: "", name: "", role: "", roomId: "", status: "idle", sessionCount: 0 }, copy, common.na)}</p>
                      <div className="agentStripMeta">
                        <span>{agent?.name || event.agentId}</span>
                        {event.toolName ? <span>{event.toolName}</span> : null}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </article>

          <article className="officeRailCard">
            <div className="officeRailHeader">
              <div>
                <p className="eyebrow">{copy.summaryAgents}</p>
                <h3>{copy.deskFeedTitle}</h3>
              </div>
              <p className="officeRailCopy">{copy.deskFeedCopy}</p>
            </div>

            <div className="attentionDeskList">
              {latestAgents.map((agent) => (
                <article key={agent.id} className={`agentStrip ${statusClass[agent.status]}`}>
                  <div className="agentStripHead">
                    <strong>{agent.name}</strong>
                    <span>{formatDateTimeLabel(parseTimestampMs(agent.lastEventAt), locale, common.na)}</span>
                  </div>
                  <p>{getDeskTask(agent, copy, common.na)}</p>
                  <div className="agentStripMeta">
                    <span>{getStatusLabel(agent.status, copy)}</span>
                    <span>
                      {copy.sessionCount}: {agent.sessionCount}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </article>
        </div>
      </SectionShell>
    );
  }

  return (
    <SectionShell id={id} eyebrow={copy.section} title={copy.floorTitle} description={copy.floorDescription}>
      {sharedHeader}

      <div className="officeBoard">
        <div className="officeBoardHeader">
          <div>
            <p className="eyebrow">{officeName}</p>
            <h3>{copy.boardTitle}</h3>
            <p className="officeBoardCopy">{copy.boardCopy}</p>
          </div>

          <div className="officeLegend">
            {(["active", "waiting", "blocked", "idle", "offline"] as const).map((status) => (
              <span key={status} className={`officeLegendChip ${statusClass[status]}`}>
                {getStatusLabel(status, copy)}
              </span>
            ))}
          </div>
        </div>

        <div className="officeFloorPlan">
          {roomEntries.map(({ room, roomAgents, roomQueue, roomLead, roomCapacity, roomLoad }) => (
            <section
              key={room.id}
              className={`officeRoom ${toneClass[room.tone]} ${roomAreaClass[room.id] || ""}`.trim()}
            >
              <div className="officeRoomHeader">
                <div>
                  <h3>{room.label}</h3>
                  {roomLead ? <p className="officeRoomLead">{copy.roomLead}: {roomLead}</p> : null}
                  <p className="officeRoomCopy">{room.description}</p>
                </div>

                <div className="officeRoomMeta">
                  <span>
                    {copy.roomCapacity}: {roomAgents.length}/{roomCapacity}
                  </span>
                  <span>
                    {copy.roomQueue}: {roomQueue}
                  </span>
                  <span>
                    {copy.utilization}: {roomLoad}%
                  </span>
                </div>
              </div>

              {roomAgents.length ? (
                <div className="agentDeskGrid">
                  {roomAgents.map((agent) => (
                    <article key={agent.id} className={`agentDesk ${statusClass[agent.status]}`}>
                      <div className="agentDeskTop">
                        <span className="agentDeskStatus">{getStatusLabel(agent.status, copy)}</span>
                        <span className="agentDeskQueue">
                          {copy.roomQueue}: {agent.queueCount || 0}
                        </span>
                      </div>
                      <strong className="agentDeskName">{agent.name}</strong>
                      <span className="agentDeskRole">{agent.role}</span>
                      <p className="agentDeskTask">{getDeskTask(agent, copy, common.na)}</p>
                      <p className="virtualMissionCardSummary">
                        {copy.provenanceLabel}:{" "}
                        {agent.workloads?.[0]
                          ? `${agent.workloads[0].title} · ${getWorkloadSourceLabel(agent.workloads[0].sourceKind, copy)}`
                          : agent.provenanceNote || copy.provenanceFallback}
                      </p>
                      {agent.workloads?.[0]?.sourceNote ? <p className="virtualMissionCardSummary">{agent.workloads[0].sourceNote}</p> : null}
                      {renderMissionMapping(agent)}

                      <div className="agentDeskFacts">
                        <span>
                          {copy.focus}: {agent.focus || common.na}
                        </span>
                        <span>
                          {copy.lastEvent}: {formatDateTimeLabel(parseTimestampMs(agent.lastEventAt), locale, common.na)}
                        </span>
                        <span>
                          {copy.nextHandoff}: {agent.nextHandoff || common.na}
                        </span>
                      </div>

                      <div className="agentDeskMeter" aria-hidden="true">
                        <span style={{ width: `${agent.utilization || 0}%` }} />
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="officeRoomEmpty">{copy.roomEmpty}</div>
              )}
            </section>
          ))}
        </div>
      </div>

      <div className="officeSecondaryGrid">
        <article className="officeRailCard">
          <div className="officeRailHeader">
            <div>
              <p className="eyebrow">{copy.queueCount}</p>
              <h3>{copy.queuesTitle}</h3>
            </div>
            <p className="officeRailCopy">{copy.attentionCopy}</p>
          </div>

          <div className="queueLaneList">
            {queues.slice(0, 4).map((queue) => (
              <article key={queue.id} className={`queueLane queueLane${queue.tone === "warning" ? "Warning" : ""}`}>
                <div className="queueLaneHead">
                  <div>
                    <strong>{queue.label}</strong>
                    <p>{queue.owner || common.na}</p>
                  </div>
                  <strong>{queue.count}</strong>
                </div>
                <div className="queueLaneBar">
                  <span style={{ width: `${Math.min(100, queue.count * 18)}%` }} />
                </div>
              </article>
            ))}
          </div>
        </article>

        <article className="officeRailCard">
          <div className="officeRailHeader">
            <div>
              <p className="eyebrow">{copy.latest}</p>
              <h3>{copy.timelineTitle}</h3>
            </div>
            <p className="officeRailCopy">{copy.timelineCopy}</p>
          </div>

          <div className="timelineList timelineListCompact">
            {recentEvents.slice(0, 4).map((event) => (
              <article key={event.id} className={`timelineItem timelineItem${event.tone === "warning" ? "Warning" : ""}`}>
                <div className="timelineDot" />
                <div className="timelineBody">
                  <div className="timelineHead">
                    <strong>{getEventSummary(event, copy)}</strong>
                    <span>{formatDateTimeLabel(parseTimestampMs(event.at), locale, common.na)}</span>
                  </div>
                  <p>{event.detail || common.unavailable}</p>
                </div>
              </article>
            ))}
          </div>
        </article>
      </div>
    </SectionShell>
  );
}
