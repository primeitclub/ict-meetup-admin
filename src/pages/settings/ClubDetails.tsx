import { useEffect, useState, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Save, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import FormInput from "../../components/form-field/input-field/InputController";
import { useApiMutation } from "../../lib/use-api-mutation";
import Divider from "../../shared/design-components/divider/Divider";

import ConfirmDialog from "../../shared/design-components/dialog/ConfirmDialog";
import { useSettingsForVersion, useSaveSettings } from "./use-settings";
import SettingsVersionBar from "./SettingsVersionBar";
import { useApiQuery } from "../../lib";
import Table from "../../components/table/Table";
import TableRowActions from "../../components/table/TableRowActions";
import type { ColumnDef } from "@tanstack/react-table";
import type { Settings } from "../../types/settings";
import { Plus, ArrowLeft } from "lucide-react";

interface ClubDetailsFormValues {
  clubEmail: string;
  clubPhoneNumber: string;
}

export default function ClubDetails() {
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

  const methods = useForm<ClubDetailsFormValues>({
    defaultValues: { clubEmail: "", clubPhoneNumber: "" },
  });
  const { handleSubmit, reset } = methods;

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
        header: "Version",
        accessorKey: "flagshipEventVersion.version_number",
        cell: ({ row }) => {
          const version = row.original.flagshipEventVersion;
          if (!version) return <span className="text-muted-foreground">—</span>;
          return (
            <div>
              {version.version_number}
              {version.is_current && (
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full ml-2" />
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "clubEmail",
        header: "Club Email",
        cell: ({ row }) => row.original.clubEmail || "—",
      },
      {
        accessorKey: "clubPhoneNumber",
        header: "Club Phone Number",
        cell: ({ row }) => row.original.clubPhoneNumber || "—",
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

  // Populate the form with existing settings so the user can update them.
  useEffect(() => {
    if (settings) {
      reset({
        clubEmail: settings.clubEmail || "",
        clubPhoneNumber: settings.clubPhoneNumber || "",
      });
    } else {
      reset({
        clubEmail: "",
        clubPhoneNumber: "",
      });
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

    // Clear the form inputs immediately after submit.
    reset({
      clubEmail: "",
      clubPhoneNumber: "",
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
          searchPlaceholder="Search club details..."
          actionRight={
            <button
              onClick={() => {
                setVersion(versionOptions[0]?.value);
                setIsFormOpen(true);
              }}
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus size={16} />
              Add settings
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
        <h2 className="text-lg font-medium">Add/Edit Club Details</h2>
      </div>
      <div className="p-6">
        <SettingsVersionBar
          title="Club Details"
          description="Email and phone number of the organizing club."
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

          {/* Current values (saved) */}
          <div className="mt-6">
            <Divider />
            <div className="pt-4 space-y-3">
              <p className="text-sm text-muted-foreground">
                Current values for this version
              </p>


              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border border-border p-4 space-y-1">
                  <p className="text-xs text-muted-foreground">Club Email</p>
                  <p>{settings?.clubEmail ?? "—"}</p>

                </div>
                <div className="rounded-lg border border-border p-4 space-y-1">
                  <p className="text-xs text-muted-foreground">Club Phone Number</p>
                  <p>{settings?.clubPhoneNumber ?? "—"}</p>

                </div>
              </div>
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
