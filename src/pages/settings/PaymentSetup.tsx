import { useState } from "react";
import { Trash2, Save } from "lucide-react";
import FormFileUpload from "../../components/form-field/FormFileUpload";
import Divider from "../../shared/design-components/divider/Divider";
import { Text } from "../../shared/design-components";
import { useSiteSettings } from "./use-site-settings";
import { getImageUrl } from "../../utils/imageUtils";

export default function PaymentSetup() {
  const { settings, exists, isLoading, save, isSaving, removeQrCode, isRemovingQrCode } =
    useSiteSettings();

  const [qrFile, setQrFile] = useState<File | null>(null);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);

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
    await save((fd) => fd.append("qrCode", qrFile));
    setQrFile(null);
    setUploadedPreview(null);
  };

  const handleRemove = async () => {
    await removeQrCode();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-lg w-full shadow-sm">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-medium">Payment Setup</h2>
        <Text size="sm" variant="muted">
          The QR code shown for event payments across the whole site.
        </Text>
      </div>

      <Divider />

      <div className="p-6 space-y-4">
        <FormFileUpload
          name="qrCode"
          label="QR Code"
          accept="image/*"
          preview={uploadedPreview}
          onFileChange={handleFileChange}
          title="Drop the QR code image here"
          hint="SVG, PNG, or JPG · max 150 KB"
        />

        {exists && settings?.qrCodeUrl && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={isRemovingQrCode}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
          >
            <Trash2 size={16} />
            Remove QR code
          </button>
        )}

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
          disabled={isSaving || !qrFile}
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
