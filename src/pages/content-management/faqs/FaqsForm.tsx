import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { ArrowDown, ArrowUp, Plus, Save, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import FormSelect from "../../../components/form-field/input-select/SelectController";
import FormInput from "../../../components/form-field/input-field/InputController";
import Textarea from "../../../components/form-field/Textarea";
import useGetVersionOptions from "../../../lib/hooks/use-get-version-options";
import { useApiQuery } from "../../../lib";
import { useApiMutation } from "../../../lib/use-api-mutation";
import { ApiError } from "../../../lib/api-client";
import type { Faq, FaqSyncPayload } from "../../../types/faq";
import Divider from "../../../shared/design-components/divider/Divider";
import { Text } from "../../../shared/design-components";

interface FaqFormValues {
  versionId: string;
  faqs: { id?: string; title: string; description: string }[];
}

const LIST_PATH = "/content-management/faqs";
const emptyRow = { title: "", description: "" };

export default function FaqsForm() {
  const navigate = useNavigate();
  // Edit mode targets one version (from the URL); add mode lets the user pick.
  const { versionId: versionIdParam } = useParams<{ versionId: string }>();
  const isEdit = !!versionIdParam;

  // Only draft versions can receive FAQs (POST requires draft), so the picker
  // shows draft versions only — the hook's default filter.
  const { options: versionOptions, isLoading: versionsLoading } =
    useGetVersionOptions();

  const methods = useForm<FaqFormValues>({
    defaultValues: {
      versionId: versionIdParam ?? "",
      faqs: [{ ...emptyRow }],
    },
  });
  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
  } = methods;

  const { fields, append, remove, replace, move } = useFieldArray({
    control,
    name: "faqs",
  });

  // Edit mode: load the version's existing FAQs and hydrate the row list.
  const { data, isFetching } = useApiQuery("faqs")<{ data: { items: Faq[] } }>({
    queryParams: { versionId: versionIdParam },
    enabled: isEdit,
  });

  useEffect(() => {
    if (!isEdit || !data?.data) return;
    const items = data.data.items ?? [];
    // Defense in depth: sort by the persisted `order` client-side too, in case
    // the API response isn't already ordered. This is the same key the
    // backend now uses to sort, so it must stay consistent with it.
    const sorted = [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    replace(
      sorted.length
        ? sorted.map((f) => ({
            id: f.id,
            title: f.title,
            description: f.description,
          }))
        : [{ ...emptyRow }],
    );
  }, [data, isEdit, replace]);

  const { execute: createFaqs, isLoading: isCreating } = useApiMutation(
    "faqs",
  )<{ data: { items: Faq[] } }, FaqSyncPayload>({
    method: "POST",
    onSuccess: () => {
      toast.success("FAQs created successfully");
      navigate(LIST_PATH);
    },
    onError: (err: ApiError) =>
      toast.error(err.message || "Failed to create FAQs"),
  });

  const { execute: updateFaqs, isLoading: isUpdating } = useApiMutation(
    "faqs",
  )<{ data: { items: Faq[] } }, FaqSyncPayload>({
    method: "PUT",
    onSuccess: () => {
      toast.success("FAQs saved successfully");
      navigate(LIST_PATH);
    },
    onError: (err: ApiError) =>
      toast.error(err.message || "Failed to save FAQs"),
  });

  const onSubmit = async (values: FaqFormValues) => {
    if (!values.versionId) {
      toast.error("Please select a version");
      return;
    }
    if (values.faqs.length === 0) {
      toast.error("Add at least one FAQ");
      return;
    }

    // Send the entire current list — the backend syncs (create/update/delete)
    // to match it. Keep `id` on existing rows; omit it on new ones.
    const faqs = values.faqs.map((f) =>
      f.id
        ? { id: f.id, title: f.title.trim(), description: f.description.trim() }
        : { title: f.title.trim(), description: f.description.trim() },
    );

    const payload: FaqSyncPayload = { versionId: values.versionId, faqs };

    if (isEdit) {
      await updateFaqs(payload);
    } else {
      await createFaqs(payload);
    }
  };

  const isLoading = isCreating || isUpdating || isFetching;

  return (
    <div className="bg-surface border border-border rounded-lg w-full shadow-sm">
      {/* Header */}
      <div className="flex justify-between p-6 shrink-0">
        <div className="flex flex-col items-start gap-1">
          <h1 className="text-xl font-bold">
            {isEdit ? "Edit FAQs" : "Create FAQs"}
          </h1>
          <Text size="sm" variant="muted">
            Manage frequently asked questions for a flagship version.
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

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6 space-y-6">
            {/* Version */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormSelect
                name="versionId"
                label="Version"
                options={versionOptions}
                placeholder="Select a version"
                rules={{ required: "Please select a version" }}
                isLoading={versionsLoading}
              />
            </div>

            <Divider />

            {/* FAQ items */}
            <div className="space-y-4">
              <Text size="sm" variant="muted">
                FAQs
              </Text>

              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="rounded-lg border border-border bg-background p-4 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <Text size="sm" variant="muted">
                      FAQ #{index + 1}
                    </Text>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => move(index, index - 1)}
                        disabled={index === 0}
                        title="Move up"
                        aria-label="Move FAQ up"
                        className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => move(index, index + 1)}
                        disabled={index === fields.length - 1}
                        title="Move down"
                        aria-label="Move FAQ down"
                        className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ArrowDown size={14} />
                      </button>
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="inline-flex items-center gap-1 text-sm text-red-500 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={14} />
                          Remove
                        </button>
                      )}
                    </div>
                  </div>

                  <FormInput
                    name={`faqs.${index}.title`}
                    label="Question"
                    placeholder="What is the ICT Meetup?"
                    isRequired
                    rules={{
                      required: "Question is required",
                      maxLength: {
                        value: 255,
                        message: "Must be at most 255 characters",
                      },
                    }}
                  />

                  <Textarea
                    label="Answer"
                    placeholder="Provide a clear, helpful answer."
                    isRequired
                    {...register(`faqs.${index}.description`, {
                      required: "Answer is required",
                      maxLength: {
                        value: 1000,
                        message: "Must be at most 1000 characters",
                      },
                    })}
                    error={errors.faqs?.[index]?.description?.message}
                  />
                </div>
              ))}

              <button
                type="button"
                onClick={() => append({ ...emptyRow })}
                className="inline-flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:border-accent hover:text-foreground transition-colors"
              >
                <Plus size={16} />
                Add FAQ
              </button>
            </div>
          </div>

          {/* Fixed footer */}
          <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-border bg-surface px-6 py-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-foreground/5 hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                <Save size={16} />
              )}
              <span>{isEdit ? "Update FAQs" : "Create FAQs"}</span>
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
