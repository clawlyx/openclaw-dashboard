type ProviderLimitWindowView = {
  id: string;
  label: string;
  value: string;
};

export function ProviderLimitWindows({
  windows,
  variant = "default"
}: {
  windows: ProviderLimitWindowView[];
  variant?: "default" | "hero" | "compact";
}) {
  return (
    <div className={`providerLimitsGrid providerLimitsGrid${variant[0].toUpperCase()}${variant.slice(1)}`}>
      {windows.map((window) => (
        <div key={window.id} className="providerLimitItem">
          <span className="providerLimitLabel">{window.label}</span>
          <strong className="providerLimitValue">{window.value}</strong>
        </div>
      ))}
    </div>
  );
}
