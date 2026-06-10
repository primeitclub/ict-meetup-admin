import { useState } from "react";
import { Save, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import FormFileUpload from "../../components/form-field/FormFileUpload";
import { useApiMutation } from "../../lib/use-api-mutation";
import Divider from "../../shared/design-components/divider/Divider";
import { Text } from "../../shared/design-components";
import { useSettingsForVersion, useSaveSettings } from "./use-settings";
import SettingsVersionBar from "./SettingsVersionBar";

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

  // New pick wins; otherwise show the saved QR code.
  const preview = uploadedPreview ?? settings?.qrCodeUrl ?? null;

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
  };

  const handleRemove = async () => {
    if (!settings?.id) return;
    await removeQrCode(undefined, { pathParams: { id: settings.id } });
  };

  return (
    <div className="bg-surface border border-border rounded-lg w-full shadow-sm">
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
          hint="SVG, PNG, or JPG · max 2 MB"
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
