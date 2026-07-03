import { useEffect, useMemo, useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import FormInput from "../../components/form-field/input-field/InputController";
import FormSelect from "../../components/form-field/input-select/SelectController";
import { useApiMutation } from "../../lib/use-api-mutation";
import { useApiQuery } from "../../lib";
import Divider from "../../shared/design-components/divider/Divider";
import { Text } from "../../shared/design-components";
import ConfirmDialog from "../../shared/design-components/dialog/ConfirmDialog";
import { useSettingsForVersion, useSaveSettings } from "./use-settings";
import Table from "../../components/table/Table";
import TableRowActions from "../../components/table/TableRowActions";
import type { ColumnDef } from "@tanstack/react-table";
import type { Settings } from "../../types/settings";
import { SOCIAL_PLATFORMS, type SocialPlatform } from "../../types/settings";

interface SocialFormValues {
  links: { platform: SocialPlatform | ""; link: string }[];
}

const platformOptions = SOCIAL_PLATFORMS.map((p) => ({ label: p, value: p }));

const urlRule = {
  required: "Link is required",
  pattern: { value: /^https?:\/\/.+/, message: "Must be a valid URL" },
};

export default function SocialMediaProfile() {
  const {
    selectedVersionId,
    setVersion,
    settings,
    exists,
    isDraft,
    refetchSettings,
  } = useSettingsForVersion();

  const methods = useForm<SocialFormValues>({
    defaultValues: { links: [] },
  });
  const { control, handleSubmit, reset } = methods;
  const { fields, append, remove } = useFieldArray({ control, name: "links" });

  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: allSettingsData, isLoading: isLoadingAll, refetch: refetchAll } = useApiQuery("settings")<{
    data: { items: Settings[] };
  }>({
    enabled: !isFormOpen,
  });

  const tableData = allSettingsData?.data?.items ?? [];

  const columns: ColumnDef<Settings>[] = useMemo(
    () => [
      {
        id: "sn",
        header: "S.N",
        cell: ({ row }) => row.index + 1,
      },
      {
        header: "Social Links",
        cell: ({ row }) => {
          const links = row.original.socialMediaLinks;
          if (!links || links.length === 0) return "—";
          return links.map((l: { platform: string }) => l.platform).join(", ");
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <TableRowActions
            onEdit={() => {
              setVersion(row.original.versionId);
              setIsFormOpen(true);
            }}
          />
        ),
      },
    ],
    [setVersion]
  );

  // Pre-fill form when editing existing settings
  useEffect(() => {
    if (settings) {
      reset({ links: settings.socialMediaLinks || [] });
    } else {
      reset({ links: [] });
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

  const onSubmit = async (data: SocialFormValues) => {
    const links = data.links
      .filter((l) => l.platform && l.link.trim())
      .map((l) => ({ platform: l.platform, link: l.link.trim() }));

    await save(selectedVersionId, (fd) => {
      fd.append("socialMediaLinks", JSON.stringify(links));
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

  if (!isFormOpen) {
    return (
      <div className="space-y-6">
        <Table
          columns={columns}
          data={tableData}
          onRefetch={refetchAll}
          searchPlaceholder="Search social media..."
          actionRight={
            <button
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus size={16} />
              Add social media
            </button>
          }
        />
        {isLoadingAll && (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-lg w-full shadow-sm">
      <div className="p-4 border-b border-border flex items-center gap-4">
        <button
          onClick={() => setIsFormOpen(false)}
          className="p-2 hover:bg-surface-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-medium">Add/Edit Social Media Links</h2>
      </div>

      <Divider />

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6 space-y-4">
            {fields.length === 0 && (
              <Text size="sm" variant="muted">
                No social links yet. Add one below.
              </Text>
            )}

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-1 md:grid-cols-[12rem_1fr_auto] gap-4 items-start"
              >
                <FormSelect
                  name={`links.${index}.platform`}
                  label="Platform"
                  options={platformOptions}
                  rules={{ required: "Required" }}
                />
                <FormInput
                  name={`links.${index}.link`}
                  label="Link"
                  placeholder="https://instagram.com/ictmeetup"
                  rules={urlRule}
                />
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="mt-7 inline-flex items-center justify-center rounded-lg p-2 text-red-500 hover:bg-red-500/10 transition-colors"
                  aria-label="Remove link"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => append({ platform: "", link: "" })}
              className="inline-flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:border-accent hover:text-foreground transition-colors"
            >
              <Plus size={16} />
              Add social link
            </button>
          </div>

          {/* Current saved values */}
          {settings?.socialMediaLinks && settings.socialMediaLinks.length > 0 && (
            <div className="px-6 pb-4">
              <Divider />
              <div className="pt-4 space-y-2">
                <Text size="sm" variant="muted">Current saved links</Text>
                <div className="flex flex-wrap gap-2">
                  {settings.socialMediaLinks.map((l: { platform: string; link: string }, i: number) => (
                    <a
                      key={i}
                      href={l.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-accent transition-colors"
                    >
                      {l.platform}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

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
        description="This permanently deletes the social media links for this version. Only allowed while the version is a draft."
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
