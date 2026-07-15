import { AlertTriangle } from "lucide-react";
import Select, {
  type SelectOption,
} from "../../components/form-field/input-select/Select";
import { Text } from "../../shared/design-components";

interface SettingsVersionBarProps {
  title: string;
  description: string;
  versionOptions: SelectOption[];
  selectedVersionId: string;
  onVersionChange: (versionId: string) => void;
  isArchived: boolean;
}

/** Header row shared by the settings tabs: title + version picker + archive notice. */
export default function SettingsVersionBar({
  title,
  description,
  versionOptions,
  selectedVersionId,
  onVersionChange,
  isArchived,
}: Readonly<SettingsVersionBarProps>) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col items-start gap-1">
          <h2 className="text-xl font-bold">{title}</h2>
          <Text size="sm" variant="muted">
            {description}
          </Text>
        </div>
        <div className="w-64">
          <Select
            label="Version"
            options={versionOptions}
            value={
              versionOptions.find((o) => o.value === selectedVersionId) ?? null
            }
            onChange={(opt) =>
              onVersionChange((opt as SelectOption | null)?.value ?? "")
            }
            placeholder="Select a version"
          />
        </div>
      </div>

      {isArchived && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-600">
          <AlertTriangle size={16} />
          This version is archived — settings can't be created or edited.
        </div>
      )}
    </div>
  );
}
