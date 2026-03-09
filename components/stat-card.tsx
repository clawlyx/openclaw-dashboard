import type { ReactNode } from "react";

type StatCardProps = {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: "default" | "warning";
};

export function StatCard({ label, value, hint, tone = "default" }: StatCardProps) {
  const isPlainValue = typeof value === "string" || typeof value === "number";

  return (
    <article className={`statCard ${tone === "warning" ? "statCardWarning" : ""}`}>
      <p className="eyebrow">{label}</p>
      {isPlainValue ? <p className="statValue">{value}</p> : <div className="statValueGroup">{value}</div>}
      {hint ? <p className="statHint">{hint}</p> : null}
    </article>
  );
}
