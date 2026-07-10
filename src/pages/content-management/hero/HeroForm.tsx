import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { Save } from "lucide-react";
import FormInput from "../../../components/form-field/input-field/InputController";
import FormSelect from "../../../components/form-field/input-select/SelectController";
import Textarea from "../../../components/form-field/Textarea";
import useGetVersionOptions from "../../../lib/hooks/use-get-version-options";
import { useApiQuery } from "../../../lib";
import { useApiMutation } from "../../../lib/use-api-mutation";
import { ApiError } from "../../../lib/api-client";
import type { HeroSection } from "./types";
import toast from "react-hot-toast";
import Divider from "../../../shared/design-components/divider/Divider";
import { Text } from "../../../shared/design-components";

type HeroFormValues = {
  title: string;
  description: string;
  flagship_versions: string;
};

export default function HeroForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const { options: versionOptions, isLoading: versionsLoading, activeVersionId } =
    useGetVersionOptions();
  const { execute: createHeroSection, isLoading: isCreating } = useApiMutation(
    "heroSections",
  )<{ data: HeroSection }, { heading: string; paragraph: string; flagshipEventVersionId: string }>({
    method: "POST",
    invalidateRoutes: ["heroSections"],
    onSuccess: () => {
      toast.success("Hero section created successfully");
      navigate(-1);
    },
    onError: (err: ApiError) =>
      toast.error(err.message || "Failed to create hero section"),
  });

  const { execute: updateHeroSection, isLoading: isUpdating } = useApiMutation(
    "heroSectionDetail",
  )<{ data: HeroSection }, { heading: string; paragraph: string; flagshipEventVersionId: string }>({
    method: "PUT",
    invalidateRoutes: ["heroSections", "heroSectionDetail"],
    onSuccess: () => {
      toast.success("Hero section updated successfully");
      navigate(-1);
    },
    onError: (err: ApiError) =>
      toast.error(err.message || "Failed to update hero section"),
  });

  const { data: editData } = useApiQuery("heroSectionDetail")<{
    data: HeroSection;
  }>({
    pathParams: { id: id! },
    enabled: isEditMode,
  });

  const methods = useForm<HeroFormValues>({
    defaultValues: {
      title: "",
      description: "",
      flagship_versions: "",
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = methods;

  useEffect(() => {
    if (editData?.data) {
      const section = editData.data;
      reset({
        title: section.heading,
        description: section.paragraph,
        flagship_versions: section.flagshipEventVersionId,
      });
    }
  }, [editData, reset]);

  // Auto-select current version on create
  useEffect(() => {
    if (!isEditMode && activeVersionId) {
      setValue("flagship_versions", activeVersionId);
    }
  }, [isEditMode, activeVersionId, setValue]);

  const isSubmitting = isCreating || isUpdating;

  const onSubmit = async (formData: HeroFormValues) => {
    const payload = {
      heading: formData.title,
      paragraph: formData.description,
      flagshipEventVersionId: formData.flagship_versions,
    };

    if (isEditMode) {
      await updateHeroSection(payload, { pathParams: { id } });
    } else {
      await createHeroSection(payload);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-lg w-full shadow-sm">
      {/* Header */}
      <div className="flex justify-between p-6 shrink-0">
        <div className="flex flex-col items-start gap-1">
          <h1 className="text-xl font-bold">
            {isEditMode ? "Edit Content" : "Create New Content"}
          </h1>
          <Text size="sm" variant="muted">
            Add a hero block to your landing page. Pick the flagship version it
            belongs to and add the calls-to-action.
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
        <form
          onSubmit={handleSubmit(onSubmit)}
        >
          {/* Scrollable body */}
          <div className="p-6 space-y-6">
            {/* Basics */}
            <div className="space-y-6">
              <FormInput
                name="title"
                label="Title"
                placeholder="Enter hero title"
                rules={{ required: "Title is required" }}
              />

              <Textarea
                label="Description"
                placeholder="Enter hero description"
                isRequired
                {...register("description", {
                  required: "Description is required",
                })}
                error={errors.description?.message}
              />

              <FormSelect
                name="flagship_versions"
                label="Flagship Version"
                options={versionOptions ?? []}
                rules={{ required: "Please select a flagship version" }}
                isLoading={versionsLoading}
              />
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
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                <Save size={16} />
              )}
              <span>{isEditMode ? "Update Content" : "Create Content"}</span>
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
