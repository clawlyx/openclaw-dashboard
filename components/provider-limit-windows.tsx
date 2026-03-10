type ProviderLimitWindowView = {
  id: string;
  label: string;
  value: string;
};

const splitWindowValue = (value: string) => {
  const normalized = value.replace(/[（]/g, "(").replace(/[）]/g, ")");
  const percentMatch = normalized.match(/^(\d+%)/);
  const parenthesizedMatch = normalized.match(/^\d+%\s*\((?:剩余约\s*)?([^)]+)\)$/i);
  const dottedMatch = normalized.match(/^(\d+%\s+left)\s+·\s+(.+)$/i);

  if (dottedMatch) {
    return {
      primary: dottedMatch[1],
      secondary: dottedMatch[2]
    };
  }

  if (percentMatch && parenthesizedMatch) {
    return {
      primary: percentMatch[1],
      secondary: parenthesizedMatch[1]
    };
  }

  return {
    primary: value
  };
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
      {windows.map((window) => {
        const parts = splitWindowValue(window.value);

        return (
          <div key={window.id} className="providerLimitItem">
            <span className="providerLimitLabel">{window.label}</span>
            <strong className="providerLimitValue">{parts.primary}</strong>
            {parts.secondary ? <span className="providerLimitSubvalue">{parts.secondary}</span> : null}
          </div>
        );
      })}
    </div>
  );
}
