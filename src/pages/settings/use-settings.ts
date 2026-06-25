import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useApiQuery } from "../../lib";
import { useApiMutation } from "../../lib/use-api-mutation";
import useGetVersions from "../../lib/hooks/use-get-versions";
import type { SelectOption } from "../../components/form-field/input-select/Select";
import type { Settings } from "../../types/settings";

/**
 * Resolves the version picker + the settings record for the selected version.
 * Shared by all settings tabs — they each edit a slice of the same record.
 */
export function useSettingsForVersion() {
  const { data: versionsData } = useGetVersions();
  const versions = useMemo(
    () => versionsData?.data?.items ?? [],
    [versionsData],
  );

  const versionOptions = useMemo<SelectOption[]>(
    () => versions.map((v) => ({ label: v.version_name, value: v.id })),
    [versions],
  );

  // Default to the current version; user pick overrides.
  const defaultVersionId = useMemo(() => {
    const current = versions.find((v) => v.is_current) ?? versions[0];
    return current?.id ?? "";
  }, [versions]);
  const [pickedVersionId, setPickedVersionId] = useState<string | null>(null);
  const selectedVersionId = pickedVersionId ?? defaultVersionId;

  const selectedVersion = useMemo(
    () => versions.find((v) => v.id === selectedVersionId),
    [versions, selectedVersionId],
  );
  const status = selectedVersion?.status;

  const { data, isLoading, refetch } = useApiQuery("settings")<{
    data: { items: Settings[] };
  }>({
    queryParams: { versionId: selectedVersionId },
    enabled: !!selectedVersionId,
  });

  const settings = data?.data?.items?.[0];

  return {
    versionOptions,
    selectedVersionId,
    setVersion: setPickedVersionId,
    settings,
    exists: !!settings,
    // Create/update are blocked on archived versions; delete needs draft.
    isArchived: status === "archived",
    isDraft: status === "draft",
    isLoadingSettings: isLoading,
    refetchSettings: refetch,
  };
}

interface UseSaveSettingsArgs {
  exists: boolean;
  settingsId?: string;
  onSaved: () => void;
}

/**
 * Saves a slice of the settings record: POST to create the record on the first
 * save for a version, PUT (partial) to update it afterwards. Both are multipart.
 */
export function useSaveSettings({
  exists,
  settingsId,
  onSaved,
}: UseSaveSettingsArgs) {
  const { execute: createSettings, isLoading: isCreating } = useApiMutation(
    "settings",
  )<{ data: Settings }, FormData>({
    method: "POST",
    invalidateRoutes: ["settings"],
    onSuccess: () => {
      toast.success("Settings saved");
      onSaved();
    },
    onError: (err) => toast.error(err.message || "Failed to save settings"),
  });

  const { execute: updateSettings, isLoading: isUpdating } = useApiMutation(
    "settingDetail",
  )<{ data: Settings }, FormData>({
    method: "PUT",
    invalidateRoutes: ["settings"],
    onSuccess: () => {
      toast.success("Settings saved");
      onSaved();
    },
    onError: (err) => toast.error(err.message || "Failed to save settings"),
  });

  const save = async (versionId: string, build: (fd: FormData) => void) => {
    const formData = new FormData();
    formData.append("versionId", versionId);
    build(formData);
    if (exists && settingsId) {
      await updateSettings(formData, { pathParams: { id: settingsId } });
    } else {
      await createSettings(formData);
    }
  };

  return { save, isSaving: isCreating || isUpdating };
}
