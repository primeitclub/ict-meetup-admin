import { useState } from "react";
import { Trash2, Save, FileText } from "lucide-react";
import FormFileUpload from "../../components/form-field/FormFileUpload";
import Divider from "../../shared/design-components/divider/Divider";
import { Text } from "../../shared/design-components";
import { useSiteSettings } from "./use-site-settings";
import { getImageUrl } from "../../utils/imageUtils";
import { pdfValidationError } from "../../utils/fileValidation";

export default function ProposalSetup() {
  const {
    settings,
    exists,
    isLoading,
    save,
    isSaving,
    removeProposal,
    isRemovingProposal,
  } = useSiteSettings();

  const [proposalFile, setProposalFile] = useState<File | null>(null);

  const handleFileChange = (file: File | null) => {
    setProposalFile(file);
  };

  const handleSave = async () => {
    if (!proposalFile) return;
    await save((fd) => fd.append("proposalPdf", proposalFile));
    setProposalFile(null);
  };

  const handleRemove = async () => {
    await removeProposal();
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
        <h2 className="text-lg font-medium">Proposal Setup</h2>
        <Text size="sm" variant="muted">
          The sponsorship proposal PDF shared with prospective sponsors.
        </Text>
      </div>

      <Divider />

      <div className="p-6 space-y-4">
        <FormFileUpload
          name="proposalPdf"
          label="Proposal PDF"
          accept="application/pdf"
          preview={proposalFile?.name ?? null}
          previewKind="document"
          validate={pdfValidationError}
          onFileChange={handleFileChange}
          title="Drop the proposal PDF here"
          hint="PDF only · max 5 MB"
        />

        {exists && settings?.proposalUrl && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={isRemovingProposal}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
          >
            <Trash2 size={16} />
            Remove proposal
          </button>
        )}

        {settings?.proposalUrl && (
          <div className="pt-2">
            <Divider />
            <div className="pt-4 space-y-2">
              <Text size="sm" variant="muted">Saved Proposal</Text>
              <a
                href={getImageUrl(settings.proposalUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border border-border p-4 text-sm font-medium text-accent hover:bg-surface-2 transition-colors"
              >
                <FileText size={18} />
                View saved proposal PDF
              </a>
            </div>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-border bg-surface px-6 py-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || !proposalFile}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          ) : (
            <Save size={16} />
          )}
          <span>{exists ? "Save proposal" : "Create with proposal"}</span>
        </button>
      </div>
    </div>
  );
}
