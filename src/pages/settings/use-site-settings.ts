import toast from "react-hot-toast";
import { useApiQuery } from "../../lib";
import { useApiMutation } from "../../lib/use-api-mutation";
import type { SiteSettings } from "../../types/settings";

/**
 * Loads and saves the single global site-settings record (Club Details,
 * Social Media, Payment Setup tabs). There is no version picker here —
 * unlike Contact Management, this data is not versioned.
 */
export function useSiteSettings() {
  const { data, isLoading, refetch } = useApiQuery("siteSettings")<{
    data: SiteSettings | null;
  }>();

  const settings = data?.data ?? null;

  const { execute: putSettings, isLoading: isSaving } = useApiMutation(
    "siteSettings",
  )<{ data: SiteSettings }, FormData>({
    method: "PUT",
    invalidateRoutes: ["siteSettings"],
    onSuccess: () => {
      toast.success("Settings saved");
      refetch();
    },
    onError: (err) => toast.error(err.message || "Failed to save settings"),
  });

  const { execute: removeQrCode, isLoading: isRemovingQrCode } = useApiMutation(
    "siteSettingsQrCode",
  )<{ data: SiteSettings }, never>({
    method: "DELETE",
    invalidateRoutes: ["siteSettings"],
    onSuccess: () => {
      toast.success("QR code removed");
      refetch();
    },
    onError: (err) => toast.error(err.message || "Failed to remove QR code"),
  });

  const save = async (build: (fd: FormData) => void) => {
    const formData = new FormData();
    build(formData);
    await putSettings(formData);
  };

  return {
    settings,
    exists: !!settings,
    isLoading,
    save,
    isSaving,
    removeQrCode,
    isRemovingQrCode,
    refetch,
  };
}
