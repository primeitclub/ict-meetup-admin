import { useNavigate } from "react-router-dom";
import Divider from "../../../shared/design-components/divider/Divider";
import { Text } from "../../../shared/design-components";

export default function FaqsForm() {
  const navigate = useNavigate();

  return (
    <div className="bg-surface border border-border rounded-lg w-full shadow-sm">
      <div className="flex justify-between p-6">
        <div className="flex flex-col items-start gap-1">
          <h1 className="text-xl font-bold">Create New FAQ</h1>
          <Text size="sm" variant="muted">
            Add a frequently asked question entry.
          </Text>
        </div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; Back
        </button>
      </div>

      <Divider />

      <div className="p-6 space-y-6">
        <p className="text-muted-foreground text-sm">Form content goes here.</p>
      </div>

      <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-border bg-surface px-6 py-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-foreground/5 hover:text-foreground transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
