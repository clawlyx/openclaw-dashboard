# Phase 13: Default Coordination Guidance - Context

**Gathered:** 2026-03-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Make the default Agents scan path answer one question immediately: what should the operator do next, and where should they do it? This phase is about surfacing one trustworthy recommended next move from existing Agents coordination context, clarifying whether the move belongs in Agents or Mission Control, and keeping the reasoning concise enough to trust at a glance. It is not about adding a new coordination workspace, moving ownership truth out of Mission Control, or inventing predictive/automatic staffing behavior.

</domain>

<decisions>
## Implementation Decisions

### Recommendation selection
- The single default recommendation should follow the highest intervention-risk coordination issue first.
- Recommendation ranking should prefer urgent intervention over lower-severity but cleaner signals.
- The product should still show one best recommendation for `watch` states when no `intervene` issue exists.
- Routine / healthy states should not force a recommendation when no meaningful next move is needed.

### Recommendation presentation
- The recommendation should live inside the existing Agents coordination surface rather than as a new large banner.
- The UI should highlight one existing agent / coordination card as the recommended move instead of inventing a net-new coordination workspace or top-of-page hero.
- The recommendation should remain grounded in current overlap, handoff, and mapping state already visible in Agents.

### Destination clarity
- The recommendation must tell the operator whether the next move belongs in Agents or Mission Control before they navigate.
- When confidence is high, the UI should name the exact destination context, such as the linked task, feature, agent, or room.
- When confidence is partial, the UI should stay explicit about the destination surface without faking exact precision.

### Reasoning style
- Recommendation reasoning should stay to one short sentence.
- The sentence should tie directly to current mapping, overlap, or handoff evidence rather than generic urgency wording.
- Trust comes from specificity and brevity, not from extra explanatory chrome.

### Mission Control handoff behavior
- If the recommended move belongs in Mission Control, Agents should still highlight the relevant coordination card so the operator can see why that item won.
- When confidence is high, the highlighted recommendation should include a lightweight jump affordance into the linked Mission Control context.
- The Agents-side recommendation remains advisory and must not imply that ownership truth moved out of Mission Control.

### Claude's Discretion
- Exact recommendation scoring details beneath the chosen severity-first policy
- Exact highlight treatment and copy shape, as long as it reads as one recommended next move rather than a second coordination system
- Exact jump affordance style for high-confidence Mission Control destinations

</decisions>

<specifics>
## Specific Ideas

- Reuse the existing coordination snippets/cards in `components/agents-virtual-office-panel.tsx` and `components/agents-office-panel.tsx` as the recommendation anchor instead of layering a new panel on top.
- Build the recommendation from the overlap / handoff / mapping model already assembled in `lib/openclaw.ts`, then present it as a single default operator cue.
- If no item rises above routine state, let the default scan path stay calm instead of manufacturing a recommendation.
- When the recommendation points to Mission Control, align the wording and jump behavior with the current Mission Control handoff affordances so the cross-surface move feels continuous.

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `components/agents-virtual-office-panel.tsx` already computes active workload cards, coordination snippets, and per-agent coordination priority from overlap and handoff data.
- `components/agents-office-panel.tsx` already renders compact coordination snippets that can carry a highlighted recommendation state.
- `components/mission-control-panel.tsx` already supports Agents-to-Mission-Control handoff context, destination labeling, and lightweight coordination banners.
- `lib/openclaw.ts` already builds overlap groups, handoff state, coordination priority, and Mission Control mapping joins.
- `lib/agents.ts` already carries coordination headline, overlap-group IDs, and handoff snapshots on each agent.

### Established Patterns
- Agents may summarize and guide, but Mission Control remains the ownership system of record.
- Coordination guidance already uses explicit states like `parallel`, `ambiguous`, `watch`, and `intervene`; Phase 13 should deepen that model instead of replacing it.
- High-confidence cross-surface navigation already exists through Mission Control handoff context, so default guidance should extend that path rather than inventing a parallel destination model.

### Integration Points
- `components/agents-virtual-office-panel.tsx`
- `components/agents-office-panel.tsx`
- `components/mission-control-panel.tsx`
- `lib/openclaw.ts`
- `lib/agents.ts`
- `locales/en.json`
- `locales/zh.json`

</code_context>

<deferred>
## Deferred Ideas

- Predictive recommendation or bottleneck forecasting
- Host/runtime control actions from the recommendation surface
- A dedicated coordination workspace beyond existing Agents and Mission Control surfaces
- Automatic staffing or autonomous next-step execution

</deferred>
