import { useEffect, useRef, useState } from "react";
import useGetVersionOptions from "./use-get-version-options";

export function useVersionFilter() {
  const { options, isLoading, activeVersionId } = useGetVersionOptions({
    status: null,
  });
  const [selectedVersionId, setSelectedVersionId] = useState("");
  const didInit = useRef(false);

  useEffect(() => {
    if (!didInit.current && activeVersionId) {
      didInit.current = true;
      setSelectedVersionId(activeVersionId);
    }
  }, [activeVersionId]);

  return {
    selectedVersionId,
    setSelectedVersionId,
    versionOptions: options,
    versionsLoading: isLoading,
  };
}
