import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import useGetVersionOptions from "./use-get-version-options";

function storageKey(pathname: string) {
  return `versionFilter:${pathname}`;
}

export function useVersionFilter() {
  const { options, isLoading, activeVersionId } = useGetVersionOptions({
    status: null,
  });

  const { pathname } = useLocation();
  const key = storageKey(pathname);

  const [selectedVersionId, setSelectedVersionIdState] = useState(
    () => sessionStorage.getItem(key) ?? "",
  );
  const didInit = useRef(false);

  const setSelectedVersionId = useCallback(
    (versionId: string) => {
      setSelectedVersionIdState(versionId);
      if (versionId) {
        sessionStorage.setItem(key, versionId);
      } else {
        sessionStorage.removeItem(key);
      }
    },
    [key],
  );

  useEffect(() => {
    if (!didInit.current && !selectedVersionId && activeVersionId) {
      didInit.current = true;
      setSelectedVersionId(activeVersionId);
    }
  }, [activeVersionId, selectedVersionId, setSelectedVersionId]);

  return {
    selectedVersionId,
    setSelectedVersionId,
    versionOptions: options,
    versionsLoading: isLoading,
  };
}
