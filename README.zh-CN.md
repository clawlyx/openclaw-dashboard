# OpenClaw Dashboard

[English](README.md) | [简体中文](README.zh-CN.md)

一个面向 OpenClaw 的工作站应用，提供 Agents、Mission Control、概览、历史、用量和调度等独立工作区。

当前已发布版本：`1.4.0 Agent Clarity`。

<p align="center">
  <img src="./.github/assets/readme-demo.png" alt="OpenClaw Dashboard Agents 虚拟办公室桌面端预览" width="78%" />
  <img src="./.github/assets/readme-mobile.png" alt="OpenClaw Dashboard Agents 虚拟办公室移动端预览" width="19%" />
</p>

## 其他页面预览

<p align="center">
  <img src="./.github/assets/preview-mission-control.png" alt="OpenClaw Dashboard Mission Control 页面预览" width="100%" />
</p>
<p align="center">
  <img src="./.github/assets/preview-overview.png" alt="OpenClaw Dashboard 概览页面预览" width="49%" />
  <img src="./.github/assets/preview-history.png" alt="OpenClaw Dashboard 历史页面预览" width="49%" />
</p>
<p align="center">
  <img src="./.github/assets/preview-usage.png" alt="OpenClaw Dashboard 用量页面预览" width="49%" />
  <img src="./.github/assets/preview-scheduler.png" alt="OpenClaw Dashboard 调度页面预览" width="49%" />
</p>

## 功能特性

- 顶部主菜单 + 左侧上下文导航 + 单面板渲染的 dashboard shell
- 独立的 `Agents` 工作区，带按房间组织的二级导航、显式任务归属和 Mission Control 联动
- 用像素风 `Virtual Office` 直观展示 active / waiting / blocked / idle agents
- Working agents 会直接显示 repo-work / intake 来源，并在元数据足够时展示多 session 工作负载
- Working agents 还会直接显示 `Mission Control` 映射状态，明确区分精确、部分和不可用，同时继续把任务真相留在 Mission Control
- Idle 建议会同时参考本地 repo 计划和个人研究队列，并明确说明这只是建议而不是归属真相
- 默认下半屏改成更简洁的协同摘要，只保留当前工作负载和下一步建议，而不是堆满分析栏
- 当 Agents 上存在可信映射时，可以一键跳转到最相关的 `Mission Control` 面板
- 在办公室视图里直接展示房间级任务归属、内联 mission queue，以及点击任务卡后聚焦归属房间
- 共享的房间 / agent 详情抽屉，可查看任务路径、交接记录和关联交付物
- 可直接在办公室抽屉内执行 Mission Control 任务动作
- 一条压力轨道，用来浮出老化评审、长期阻塞、等待人工、推断归属和房间过载
- 带生命周期判断的 operator summary，可区分新出现、持续中、正在滑落和正在恢复的压力，同时保留当前快照事实
- 房间与任务详情里的生命周期证据说明，会结合最近等待/老化信息，并在历史不完整时给出安全的回退文案
- 顶级 `Mission Control` 工作区，用于任务 intake、队列推进、评审压力和发布就绪状态
- `Office Floor`、`Queues & handoffs`、`Recent activity` 三个补充面板，用于快速理解 agent 运转状态
- 最新 usage 报告摘要
- 已连接 providers 视图，包含 auth/profile 元数据、active 高亮和可复用的限额 tile
- Codex 的 5h / 7d 滚动限额直接展示在 active provider 行内
- OpenRouter API profile 可见，并可从 AI Model usage report 读取每日 free quota 使用情况
- Top 模型来源占比
- 模型 usage 表格
- cron 概览
- 下一批计划任务
- 失败或未送达任务列表
- 面向公开预览和首次运行的内置 demo 数据自动回退
- 基于多份报告归一化后的 usage 历史和趋势图

这个仓库的目标不局限于单个 usage report skill，而是一个可以继续扩展到 agent 运维、Mission Control、channels、browser telemetry、delivery health 和 host-level schedulers 的完整 OpenClaw 工作站。

## 工作方式

应用对两类实时数据分别读取：

- agents + usage + scheduler：从 `OPENCLAW_HOME` 或 `~/.openclaw` 读取
- mission control：从 `MISSION_CONTROL_HOME` 或 `~/.openclaw/mission-control` 读取
- 演示模式：任一实时路径缺失时，对应页面会回退到内置 demo 数据
- 本地前端绑定：`pnpm dev` / `pnpm start` 会从 `.env` 或 `.env.local` 读取 `DASHBOARD_URL`

这样仓库可以直接公开发布，同时在已经安装 OpenClaw 的机器上仍然优先使用真实本地数据。

默认情况下应用会从 `~/.openclaw` 读取。你也可以通过 `OPENCLAW_HOME` 覆盖这个路径。如果没有实时安装，应用会自动使用内置 demo 数据。

- usage 报告：`workspace/memory/usage/*.md`
- cron 任务：`cron/jobs.json`

这意味着它仍然围绕你自己的 OpenClaw 本地数据运行，不需要额外自定义后端。JSON 快照也会通过 `/api/snapshot` 暴露出来，其中包含供 Agents 办公室视图使用的归一化 `agents` 数据、显式的 `agents.workloads` / `agents.advisorySuggestions` 协同字段、用于精确 / 部分 / 不可用 Mission Control 联动的 `agents.missionMapping` 元数据、供 operator surface 与验证共用的 `pressure` 生命周期数据、供图表使用的 `usage.history` 数据、用于 active 滚动窗口的 `usage.providerLimits`，以及用于已保存 provider profile 的 `usage.providerProfiles`。

## 快速开始

```bash
git clone <your-fork-or-this-repo-url>
cd openclaw-dashboard
cp .env.example .env
pnpm install
pnpm dev
```

然后打开 `DASHBOARD_URL` 中配置的地址（示例配置使用 [http://localhost:3000](http://localhost:3000)）。

Next.js 会自动加载 `.env` / `.env.local`，所以第一次配置完成后，你以后只需要运行：

```bash
pnpm dev
```

如果你的 OpenClaw home 不是 `~/.openclaw`，就在 `.env` 或 `.env.local` 里设置：

```bash
OPENCLAW_HOME=/path/to/.openclaw
```

`OPENCLAW_HOME=~/.openclaw` 这种写法同样支持。

如果你想把本地前端从默认端口挪开，可以在 `.env` 或 `.env.local` 里设置：

```bash
DASHBOARD_URL=http://localhost:3000
```

然后直接运行 `pnpm dev` 或 `pnpm start`。脚本会把 Next.js 绑定到这个 host 和 port。你可以把 `.env.example` 保持在 `3000`，再把你自己的本地 `.env` 覆盖成 `3200` 或其他空闲端口。

如果你想在截图、预览或 CI 中强制使用完整的内置 demo 数据，可以把这行放进 `.env` / `.env.local`，或者直接内联运行：

```bash
OPENCLAW_HOME=demo/openclaw-home MISSION_CONTROL_HOME=/tmp/openclaw-dashboard-demo pnpm dev
```

上面的 `MISSION_CONTROL_HOME` 可以指向一个不存在的目录。只要这个目录下没有 mission archive 状态文件，Mission Control 就会回退到仓库内置的归档后样例，而不会读取你本机真实队列。旧的 `AGENT_LAUNCHPAD_HOME` 仍可作为兼容别名，但 repo-task bridge 本身已经退役。

## 验证

发布验证演示命令：

```bash
OPENCLAW_HOME=demo/openclaw-home MISSION_CONTROL_HOME=/tmp/openclaw-dashboard-demo pnpm start
```

发布前需要确认：

- `Agents` 页面能从内置 demo 数据中看出 repo-work 来源、`#intake` 研究来源，以及一个多 session 的 working agent case
- `Agents` 页面在 demo 模式下还会展示一个精确、一个部分、一个不可用的 Mission Control 映射状态
- Agents 默认下半屏会先展示 `Coordination brief`、`Active workloads` 和 `Advisory next moves`，而不是旧的分析型大面板
- 精确和部分映射会暴露 `Mission Control` 跳转动作，而不可用映射会明确保持不可点击
- Idle 建议会解释来源和排序原因，而且文案保持为建议而不是自动指派
- `/api/snapshot` 在 `pressure.taskMetricsByTaskId` 和 `pressure.roomMetricsByRoomId` 下暴露出同一组生命周期状态
- `/api/snapshot` 还会暴露 `agents.workloads`、`agents.advisorySuggestions`、`agents.coordinationHeadline` 和 `agents.missionMapping`
- `Mission Control` 页面只展示保留下来的个人研究 `TQ-XXX` 任务，并明确说明 repo-bound task system 已归档
- 从 Agents 跳转到 Mission Control 后，会直接落到相关任务或队列上下文，不会暗示归属已经转移到 Agents
- 内置 mission 注释能清楚说明 `TQ-091` 与 `TQ-101` 被保留，而 repo-bound 任务记录已被归档或移除
- `.github/assets/` 中的 README 与预览截图全部来自内置 demo 数据，而不是本机真实数据
- `package.json`、README 里的发布描述和 changelog 对 `1.4.0` 版本保持一致

```bash
pnpm lint
pnpm typecheck
pnpm build
```

或者直接运行组合检查：

```bash
pnpm check
```

仓库还包含一个位于 `.github/workflows/ci.yml` 的 GitHub Actions 工作流，会在每次 push 到 `main` 和每次 pull request 时基于内置 demo 数据执行 install、typecheck 和 build。

## 当前页面

- `Agents`：Virtual Office、带来源的 working roster、Mission Control 映射状态、建议型 idle suggestions、简洁协同摘要、详情抽屉、办公室动作、压力轨道、Office Floor、Queues & handoffs、Recent activity
- `Mission Control`：Active missions、Execution queue、Review desk、Release lane、Mission intake，以及来自 Agents 的高亮交接上下文
- `Overview`：最新摘要卡片和高优先级运行状态
- `History`：usage 历史趋势和图表视图
- `Usage`：provider 状态、滚动限额、来源占比和模型明细
- `Scheduler`：cron 概览、下一批任务和投递失败

## 当前假设

- usage 数据来自当前 `usage-tracker` 生成的 markdown
- 解析器同时兼容新的 account-status 报告和旧的 quota-only 报告
- Top 模型来源占比来自 `Model × Source Breakdown`
- OpenRouter free quota 的可见性来自 AI Model Daily Usage Report 中的对应 section（如果存在）
- agent 办公室视图来自 `agents/dashboard.json`，如果存在 session 数据也可以从中推断状态
- 还没有接入 `launchd` 这类主机侧调度器

## 路线图

- 接入 launchd / system cron，让主机侧任务和 OpenClaw cron 一起出现
- 增加 Telegram / Discord / Feishu 的通道投递状态
- 增加 browser automation telemetry
- 把 usage history 归一化成 JSON，支撑真正的图表而不是继续解析 markdown
- 暴露一个可复用的打包安装路径，作为 OpenClaw integration / skill

## 隐私与 Demo 数据

不要提交：

- 真实 bot token
- 除非你明确要公开，否则不要提交个人 chat id
- 完整的 `openclaw.json`
- 你不想公开的私有 report 数据
- 真实的 `~/.openclaw` 快照，除非你明确要公开

`demo/openclaw-home` 下的 demo 数据是合成的，可以安全发布。  
`.github/assets/readme-demo.png`、`.github/assets/readme-mobile.png`、`.github/assets/preview-mission-control.png`、`.github/assets/preview-overview.png`、`.github/assets/preview-history.png`、`.github/assets/preview-usage.png`、`.github/assets/preview-scheduler.png` 和 `.github/assets/social-preview.png` 里的公开截图都应始终基于内置 demo 数据生成。

## 项目文档

- [Contribution guide](CONTRIBUTING.md)
- [Security policy](SECURITY.md)
- [Pull request template](.github/PULL_REQUEST_TEMPLATE.md)
- [Changelog](CHANGELOG.md)

## License

MIT
