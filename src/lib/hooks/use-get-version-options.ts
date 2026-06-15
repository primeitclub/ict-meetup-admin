import { useMemo } from "react";
import useGetVersions from "./use-get-versions";
import { EventVersionStatus } from "../../types/version";

export interface VersionOption {
  label: string;
  value: string;
}

interface UseGetVersionOptionsArgs {
  status?: EventVersionStatus | null;
}

/**
 * Fetches the version list and returns it pre-shaped for FormSelect / react-select.
 * Defaults to DRAFT-only versions (the common case for "pick a version" pickers).
 */
export default function useGetVersionOptions({
  status = null,
}: UseGetVersionOptionsArgs = {}) {
  const { data, isLoading } = useGetVersions();

  const options = useMemo<VersionOption[]>(() => {
    const items = data?.data.items ?? [];
    const filtered =
      status === null ? items : items.filter((item) => item.status === status);
    return filtered.map((item) => ({
      label: item.version_name,
      value: item.id,
    }));
  }, [data, status]);

  return { options, isLoading };
}
