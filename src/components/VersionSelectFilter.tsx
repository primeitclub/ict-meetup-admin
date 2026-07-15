interface VersionOption {
  label: string;
  value: string;
}

interface Props {
  value: string;
  onChange: (id: string) => void;
  options: VersionOption[];
  isLoading?: boolean;
}

export default function VersionSelectFilter({
  value,
  onChange,
  options,
  isLoading,
}: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={isLoading}
      className="px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:opacity-50"
    >
      <option value="">All versions</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
