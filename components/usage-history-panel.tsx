import type { UsageHistoryPoint, UsageHistorySnapshot } from "@/lib/openclaw";
import { formatMessage, localeTag, type Locale } from "@/lib/i18n";

const CHART_WIDTH = 640;
const CHART_HEIGHT = 220;
const CHART_PADDING_X = 18;
const CHART_PADDING_Y = 18;

type TrendMetric = "requests" | "tokens";
type HistoryFocus = "all" | TrendMetric;

type HistoryMessages = {
  section: string;
  title: string;
  description: string;
  descriptionUnavailable: string;
  range: string;
  reportsNormalized: string;
  requestsPerReport: string;
  tokensPerReport: string;
  firstReport: string;
  flat: string;
  newActivity: string;
  vsPrev: string;
  chartLabel: string;
  historyUnavailable: string;
  average: string;
};

const getMetricValue = (point: UsageHistoryPoint, metric: TrendMetric) =>
  metric === "requests" ? point.totalRequestsValue : point.totalTokensValue;

const getMetricLabel = (metric: TrendMetric, copy: HistoryMessages) =>
  metric === "requests" ? copy.requestsPerReport : copy.tokensPerReport;

const getMetricLatest = (point: UsageHistoryPoint, metric: TrendMetric, locale: Locale) =>
  new Intl.NumberFormat(localeTag(locale), { notation: "compact", maximumFractionDigits: 2 }).format(
    getMetricValue(point, metric)
  );

const formatShortDate = (value: string, locale: Locale) =>
  new Intl.DateTimeFormat(localeTag(locale), { month: "short", day: "numeric" }).format(
    new Date(`${value}T00:00:00`)
  );

const formatDelta = (latest: number, previous: number | undefined, copy: HistoryMessages) => {
  if (previous === undefined) return { label: copy.firstReport, tone: "neutral" as const };
  if (previous === 0) return { label: latest === 0 ? copy.flat : copy.newActivity, tone: "neutral" as const };

  const delta = ((latest - previous) / previous) * 100;
  if (Math.abs(delta) < 0.05) return { label: copy.flat, tone: "neutral" as const };

  return {
    label: formatMessage(copy.vsPrev, { delta: delta.toFixed(1) }),
    tone: delta > 0 ? ("up" as const) : ("down" as const)
  };
};

const buildCoordinates = (points: UsageHistoryPoint[], metric: TrendMetric) => {
  const values = points.map((point) => getMetricValue(point, metric));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const width = CHART_WIDTH - CHART_PADDING_X * 2;
  const height = CHART_HEIGHT - CHART_PADDING_Y * 2;

  return values.map((value, index) => {
    const ratio = max === min ? 0.5 : (value - min) / (max - min);
    const x = points.length === 1 ? CHART_WIDTH / 2 : CHART_PADDING_X + (index / (points.length - 1)) * width;
    const y = CHART_HEIGHT - CHART_PADDING_Y - ratio * height;

    return { x, y, value };
  });
};

const buildLinePath = (coords: { x: number; y: number }[]) =>
  coords.map((coord, index) => `${index === 0 ? "M" : "L"} ${coord.x} ${coord.y}`).join(" ");

const buildAreaPath = (coords: { x: number; y: number }[]) => {
  if (coords.length === 0) return "";

  const line = buildLinePath(coords);
  const first = coords[0];
  const last = coords[coords.length - 1];
  const baseline = CHART_HEIGHT - CHART_PADDING_Y;

  return `${line} L ${last.x} ${baseline} L ${first.x} ${baseline} Z`;
};

function UsageTrendChart({
  metric,
  points,
  locale,
  copy
}: {
  metric: TrendMetric;
  points: UsageHistoryPoint[];
  locale: Locale;
  copy: HistoryMessages;
}) {
  if (points.length === 0) return null;

  const coords = buildCoordinates(points, metric);
  const values = points.map((point) => getMetricValue(point, metric));
  const latest = points[points.length - 1];
  const previous = points.length > 1 ? values[values.length - 2] : undefined;
  const delta = formatDelta(getMetricValue(latest, metric), previous, copy);
  const linePath = buildLinePath(coords);
  const areaPath = buildAreaPath(coords);
  const axisPoints = [points[0], points[Math.floor((points.length - 1) / 2)], points[points.length - 1]];
  const metricLabel = getMetricLabel(metric, copy);

  return (
    <article className="historyChartCard">
      <div className="historyChartHeader">
        <div>
          <p className="eyebrow">{metricLabel}</p>
          <h3>{getMetricLatest(latest, metric, locale)}</h3>
        </div>
        <span
          className={`historyDeltaChip ${
            delta.tone === "up" ? "historyDeltaUp" : delta.tone === "down" ? "historyDeltaDown" : ""
          }`}
        >
          {delta.label}
        </span>
      </div>

      <svg
        className="historyChartSvg"
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        role="img"
        aria-label={formatMessage(copy.chartLabel, { metric: metricLabel })}
      >
        <line
          x1={CHART_PADDING_X}
          y1={CHART_HEIGHT - CHART_PADDING_Y}
          x2={CHART_WIDTH - CHART_PADDING_X}
          y2={CHART_HEIGHT - CHART_PADDING_Y}
          className="historyGridLine"
        />
        <line
          x1={CHART_PADDING_X}
          y1={CHART_HEIGHT / 2}
          x2={CHART_WIDTH - CHART_PADDING_X}
          y2={CHART_HEIGHT / 2}
          className="historyGridLine historyGridLineSoft"
        />
        <path d={areaPath} className={`historyArea historyArea${metric === "requests" ? "Requests" : "Tokens"}`} />
        <path d={linePath} className={`historyLine historyLine${metric === "requests" ? "Requests" : "Tokens"}`} />
        {coords.map((coord, index) => (
          <circle
            key={`${metric}-${points[index].date}`}
            cx={coord.x}
            cy={coord.y}
            r={4}
            className={`historyDot historyDot${metric === "requests" ? "Requests" : "Tokens"}`}
          />
        ))}
      </svg>

      <div className="historyAxis">
        {axisPoints.map((point) => (
          <span key={`${metric}-${point.date}`}>{formatShortDate(point.date, locale)}</span>
        ))}
      </div>
    </article>
  );
}

export function UsageHistoryPanel({
  id,
  history,
  locale,
  copy,
  common,
  focus = "all"
}: {
  id?: string;
  history: UsageHistorySnapshot;
  locale: Locale;
  copy: HistoryMessages;
  common: { na: string; to: string };
  focus?: HistoryFocus;
}) {
  if (!history.available) {
    return (
      <section id={id} className="panel historyPanel sectionAnchor">
        <div className="sectionHeader">
          <p className="eyebrow">{copy.section}</p>
          <h2>{copy.title}</h2>
          <p className="sectionDescription">{copy.descriptionUnavailable}</p>
        </div>

        <div className="emptyState">
          <p>{history.error || copy.historyUnavailable}</p>
          {(history.notes || []).map((note) => (
            <p key={note}>{note}</p>
          ))}
        </div>
      </section>
    );
  }

  const chartPoints = history.points.slice(-Math.min(14, history.points.length));
  const chartMetrics = focus === "all" ? (["requests", "tokens"] as const) : ([focus] as const);

  return (
    <section id={id} className="panel historyPanel sectionAnchor">
      <div className="sectionHeader">
        <p className="eyebrow">{copy.section}</p>
        <h2>{copy.title}</h2>
        <p className="sectionDescription">{copy.description}</p>
      </div>

      <div className="heroMeta historyMeta">
        <div className="metaChip">
          {formatMessage(copy.range, {
            start: history.rangeStart || common.na,
            end: history.rangeEnd || common.na
          })}
        </div>
        <div className="metaChip">{formatMessage(copy.reportsNormalized, { count: history.reportCount })}</div>
      </div>

      <div className={`historyChartGrid ${chartMetrics.length === 1 ? "historyChartGridSingle" : ""}`}>
        {chartMetrics.map((metric) => (
          <UsageTrendChart key={metric} metric={metric} points={chartPoints} locale={locale} copy={copy} />
        ))}
      </div>

      <div className="historyFootnotes">
        <p>
          {formatMessage(copy.average, {
            requests: history.averageRequests || common.na,
            tokens: history.averageTokens || common.na
          })}
        </p>
        {(history.notes || []).slice(0, 2).map((note) => (
          <p key={note}>{note}</p>
        ))}
      </div>
    </section>
  );
}
