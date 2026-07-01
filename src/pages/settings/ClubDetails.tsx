import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Save, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import FormInput from "../../components/form-field/input-field/InputController";
import { useApiMutation } from "../../lib/use-api-mutation";
import Divider from "../../shared/design-components/divider/Divider";
import { Text } from "../../shared/design-components";
import ConfirmDialog from "../../shared/design-components/dialog/ConfirmDialog";
import { useSettingsForVersion, useSaveSettings } from "./use-settings";
import { useState } from "react";

interface ClubDetailsFormValues {
  clubEmail: string;
  clubPhoneNumber: string;
}

export default function ClubDetails() {
  const {
    selectedVersionId,
    settings,
    exists,
    isDraft,
    refetchSettings,
  } = useSettingsForVersion();

  const methods = useForm<ClubDetailsFormValues>({
    defaultValues: { clubEmail: "", clubPhoneNumber: "" },
  });
  const { handleSubmit, reset } = methods;

  useEffect(() => {
    if (settings) {
      reset({
        clubEmail: settings.clubEmail || "",
        clubPhoneNumber: settings.clubPhoneNumber || "",
      });
    } else {
      reset({ clubEmail: "", clubPhoneNumber: "" });
    }
  }, [settings, reset, selectedVersionId]);

  const { save, isSaving } = useSaveSettings({
    exists,
    settingsId: settings?.id,
    onSaved: refetchSettings,
  });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const { execute: deleteSettings, isLoading: isDeleting } = useApiMutation(
    "settingDetail",
  )<void, never>({
    method: "DELETE",
    invalidateRoutes: ["settings"],
    onSuccess: () => {
      toast.success("Settings deleted");
      refetchSettings();
    },
    onError: (err) => toast.error(err.message || "Failed to delete settings"),
  });

  const onSubmit = async (data: ClubDetailsFormValues) => {
    await save(selectedVersionId, (fd) => {
      fd.append("clubEmail", data.clubEmail.trim());
      fd.append("clubPhoneNumber", data.clubPhoneNumber.trim());
    });
  };

  const handleConfirmDelete = async () => {
    if (!settings?.id) return;
    try {
      await deleteSettings(undefined, { pathParams: { id: settings.id } });
    } finally {
      setConfirmOpen(false);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-lg w-full shadow-sm">
      <div className="p-6">
        <h2 className="text-lg font-semibold">Club Details</h2>
        <Text size="sm" variant="muted">
          General contact information for the organizing club.
        </Text>
      </div>

      <Divider />

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                name="clubEmail"
                label="Club Email"
                type="email"
                placeholder="club@prime.edu.np"
                rules={{
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email",
                  },
                }}
              />
              <FormInput
                name="clubPhoneNumber"
                label="Club Phone Number"
                placeholder="+977 98XXXXXXXX"
                rules={{
                  maxLength: { value: 20, message: "Max 20 characters" },
                }}
              />
            </div>
          </div>

          <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-border bg-surface px-6 py-4">
            <div>
              {exists && isDraft && (
                <button
                  type="button"
                  onClick={() => setConfirmOpen(true)}
                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 size={16} />
                  Delete settings
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={isSaving || !selectedVersionId}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                <Save size={16} />
              )}
              <span>Save</span>
            </button>
          </div>
        </form>
      </FormProvider>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete settings?"
        description="This permanently deletes this version's settings. Only allowed while the version is a draft."
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
