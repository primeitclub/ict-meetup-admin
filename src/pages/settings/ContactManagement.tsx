import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Save, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import FormInput from "../../components/form-field/input-field/InputController";
import FormSelect from "../../components/form-field/input-select/SelectController";
import { useApiMutation } from "../../lib/use-api-mutation";
import { useApiQuery } from "../../lib";
import Divider from "../../shared/design-components/divider/Divider";
import ConfirmDialog from "../../shared/design-components/dialog/ConfirmDialog";
import { useSettingsForVersion, useSaveSettings } from "./use-settings";
import SettingsVersionBar from "./SettingsVersionBar";
import type { TeamMember } from "../../types/team";

interface ContactFormValues {
  email: string;
  phoneNumber: string;
  teamName: string;
}

export default function ContactManagement() {
  const {
    versionOptions,
    selectedVersionId,
    setVersion,
    settings,
    exists,
    isArchived,
    isDraft,
    refetchSettings,
  } = useSettingsForVersion();

  const methods = useForm<ContactFormValues>({
    defaultValues: { email: "", phoneNumber: "", teamName: "" },
  });
  const { handleSubmit, reset } = methods;

  useEffect(() => {
    reset({
      email: settings?.email ?? "",
      phoneNumber: settings?.phoneNumber ?? "",
      teamName: settings?.teamName ?? "",
    });
  }, [settings, reset]);

  const { data: teamsData, isLoading: isLoadingTeams } = useApiQuery("teams")<{
    data: { items: TeamMember[] };
  }>({
    queryParams: { versionId: selectedVersionId ?? "", limit: 100 },
    enabled: !!selectedVersionId,
  });

  const teamOptions = useMemo(
    () =>
      (teamsData?.data?.items ?? []).map((m) => ({
        value: m.name,
        label: m.name,
      })),
    [teamsData],
  );

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
    onSuccess: () => {
      toast.success("Settings deleted");
      refetchSettings();
    },
    onError: (err) => toast.error(err.message || "Failed to delete settings"),
  });

  const onSubmit = async (data: ContactFormValues) => {
    await save(selectedVersionId, (fd) => {
      fd.append("email", data.email.trim());
      fd.append("phoneNumber", data.phoneNumber.trim());
      fd.append("teamName", data.teamName.trim());
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
        <SettingsVersionBar
          title="Contact Management"
          description="Email, phone, and team name shown for this version."
          versionOptions={versionOptions}
          selectedVersionId={selectedVersionId}
          onVersionChange={(v) => setVersion(v)}
          isArchived={isArchived}
        />
      </div>

      <Divider />

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                name="email"
                label="Email"
                type="email"
                placeholder="hello@ictmeetup.com"
                rules={{
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email",
                  },
                }}
              />
              <FormInput
                name="phoneNumber"
                label="Phone Number"
                placeholder="+977 98XXXXXXXX"
                rules={{
                  maxLength: { value: 20, message: "Max 20 characters" },
                }}
              />
              <FormSelect
                name="teamName"
                label="Team Name"
                options={teamOptions}
                placeholder="Select a team member"
                isLoading={isLoadingTeams}
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
              disabled={isSaving || isArchived || !selectedVersionId}
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
        description="This permanently deletes this version's settings (contact, social links, and QR code). Only allowed while the version is a draft."
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
