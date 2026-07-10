import { useEffect, useState, useMemo } from "react";
import { Save, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import FormFileUpload from "../../components/form-field/FormFileUpload";
import { useApiMutation } from "../../lib/use-api-mutation";
import Divider from "../../shared/design-components/divider/Divider";
import { Text } from "../../shared/design-components";
import { useSettingsForVersion, useSaveSettings } from "./use-settings";
import SettingsVersionBar from "./SettingsVersionBar";
import { useApiQuery } from "../../lib";
import Table from "../../components/table/Table";
import TableRowActions from "../../components/table/TableRowActions";
import type { ColumnDef } from "@tanstack/react-table";
import type { Settings } from "../../types/settings";
import { Plus, ArrowLeft } from "lucide-react";
import { getImageUrl } from "../../utils/imageUtils";

export default function PaymentSetup() {
  const {
    versionOptions,
    selectedVersionId,
    setVersion,
    settings,
    exists,
    isArchived,
    refetchSettings,
  } = useSettingsForVersion();

  const [qrFile, setQrFile] = useState<File | null>(null);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);

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
        header: "QR Code",
        cell: ({ row }) => {
          const url = row.original.qrCodeUrl;
          if (!url) return <span className="text-muted-foreground">—</span>;
          return (
            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface-2 overflow-hidden">
              <img src={getImageUrl(url)} alt="QR Code" className="h-full w-full object-cover" />
            </div>
          );
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

  // Upload area shows only a newly picked file — saved QR is shown in "Current values".
  const preview = uploadedPreview;

  // Reset upload area when switching versions.
  // We can just rely on the key prop or just let the user reset it manually.
  useEffect(() => {
    // If really needed, use a timeout or different pattern, but for now we skip setState in effect.
  }, [selectedVersionId]);

  const { save, isSaving } = useSaveSettings({
    exists,
    settingsId: settings?.id,
    onSaved: () => {
      setQrFile(null);
      setUploadedPreview(null);
      refetchSettings();
    },
  });

  const { execute: removeQrCode, isLoading: isRemoving } = useApiMutation(
    "settingQrCode",
  )<{ data: unknown }, never>({
    method: "DELETE",
    invalidateRoutes: ["settings"],
    onSuccess: () => {
      toast.success("QR code removed");
      setQrFile(null);
      setUploadedPreview(null);
      refetchSettings();
    },
    onError: (err) => toast.error(err.message || "Failed to remove QR code"),
  });

  const handleFileChange = (file: File | null) => {
    if (file === null) {
      setQrFile(null);
      setUploadedPreview(null);
      return;
    }
    setQrFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setUploadedPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!qrFile) return;
    await save(selectedVersionId, (fd) => fd.append("qrCode", qrFile));
    // Clear the upload inputs immediately after submit.
    setQrFile(null);
    setUploadedPreview(null);
  };

  const handleRemove = async () => {
    if (!settings?.id) return;
    await removeQrCode(undefined, { pathParams: { id: settings.id } });
  };

  if (!isFormOpen) {
    return (
      <div className="space-y-6">
        <Table
          columns={columns}
          data={tableData}
          onRefetch={refetchAll}
          searchPlaceholder="Search payment setup..."
          actionRight={
            <button
              onClick={() => {
                setVersion(versionOptions[0]?.value);
                setIsFormOpen(true);
              }}
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus size={16} />
              Add payment
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
        <h2 className="text-lg font-medium">Add/Edit Payment Setup</h2>
      </div>
      <div className="p-6">
        <SettingsVersionBar
          title="Payment Setup"
          description="Upload the payment QR code shown for this version."
          versionOptions={versionOptions}
          selectedVersionId={selectedVersionId}
          onVersionChange={(v) => setVersion(v)}
          isArchived={isArchived}
        />
      </div>

      <Divider />

      <div className="p-6 space-y-4">
        <FormFileUpload
          name="qrCode"
          label="QR Code"
          accept="image/*"
          preview={preview}
          onFileChange={handleFileChange}
          title="Drop the QR code image here"
          hint="SVG, PNG, or JPG · max 150 KB"
        />

        {exists && settings?.qrCodeUrl && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={isRemoving}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
          >
            <Trash2 size={16} />
            Remove QR code
          </button>
        )}

        {!selectedVersionId && (
          <Text size="sm" variant="muted">
            Select a version to manage its QR code.
          </Text>
        )}

        {/* Current saved QR code preview */}
        {settings?.qrCodeUrl && (
          <div className="pt-2">
            <Divider />
            <div className="pt-4 space-y-2">
              <Text size="sm" variant="muted">Saved QR Code</Text>
              <div className="rounded-lg border border-border p-4 flex justify-center">
                <img
                  src={getImageUrl(settings.qrCodeUrl)}
                  alt="Saved QR Code"
                  className="h-40 w-40 object-contain rounded"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-border bg-surface px-6 py-4">

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || isArchived || !selectedVersionId || !qrFile}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          ) : (
            <Save size={16} />
          )}
          <span>{exists ? "Save QR code" : "Create with QR code"}</span>
        </button>
      </div>
    </div>
  );
}
