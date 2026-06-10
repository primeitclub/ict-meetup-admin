import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FormProvider, useForm } from "react-hook-form";
import { Save } from "lucide-react";
import Divider from "../../shared/design-components/divider/Divider";
import FormFileUpload from "../../components/form-field/FormFileUpload";
import { createSlug } from "../../shared/utils/slug";
import { useApiMutation } from "../../lib/use-api-mutation";
import { ApiError } from "../../lib/api-client";
import { useApiQuery } from "../../lib/use-api-query";
import {
  EventVersionStatus,
  type FlagshipEventVersion,
} from "../../types/version";
import toast from "react-hot-toast";
import FormCheckbox from "../../components/form-field/FormCheckbox";

import FormDateRange from "../../components/form-field/date-picker/FormDateRange";
import FormInput from "../../components/form-field/input-field/InputController";
import FormSelect from "../../components/form-field/input-select/SelectController";
import { Text } from "../../shared/design-components";

interface VersionFormValues {
  version_name: string;
  slug: string;
  version_number: string;
  start_date: string;
  end_date: string;
  status: EventVersionStatus;
  is_current: boolean;
  tagline?: string;
}

export default function VersionForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [logoCleared, setLogoCleared] = useState(false);

  // fetch the data item
  const { data: existingData, isLoading: isFetching } = useApiQuery(
    "versionDetail",
  )<{ data: FlagshipEventVersion }>({
    pathParams: { id: id as string },
    config: { enabled: isEdit },
  });

  const methods = useForm<VersionFormValues>({
    defaultValues: {
      status: EventVersionStatus.DRAFT,
      is_current: false,
    },
  });
  const { reset, watch, setValue, formState } = methods;

  const logoPreview = logoCleared
    ? null
    : (uploadedPreview ?? existingData?.data?.logo ?? null);

  useEffect(() => {
    if (existingData?.data) {
      const version = existingData.data;
      reset({
        version_name: version.version_name,
        slug: version.slug,
        version_number: String(version.version_number),
        start_date: version.start_date.split("T")[0],
        end_date: version.end_date.split("T")[0],
        status: version.status,
        is_current: version.is_current,
      });
    }
  }, [existingData, reset]);

  // Auto-fill slug from version_name on create — stop as soon as the user
  // edits the slug field themselves (dirtyFields.slug becomes true).
  const versionName = watch("version_name");
  const slugDirty = Boolean(formState.dirtyFields.slug);
  useEffect(() => {
    if (isEdit || slugDirty || !versionName) return;
    setValue("slug", createSlug(versionName), { shouldDirty: false });
  }, [versionName, isEdit, slugDirty, setValue]);

  const { execute: createVersion, isLoading: isCreating } = useApiMutation(
    "versions",
  )<FlagshipEventVersion, FormData>({
    method: "POST",
    onSuccess: () => {
      toast.success("Version created successfully");
      navigate("/home/versions");
    },
    onError: (err) => toast.error(err.message || "Failed to create version"),
  });

  const { execute: updateVersion, isLoading: isUpdating } = useApiMutation(
    "versionDetail",
  )<FlagshipEventVersion, FormData>({
    method: "PATCH",
    pathParams: { id: id as string },
    onSuccess: () => {
      toast.success("Version updated successfully");
      navigate("/home/versions");
    },
    onError: (err: ApiError) =>
      toast.error(err.message || "Failed to update version"),
  });

  const onSubmit = async (data: VersionFormValues) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, String(value));
    });

    if (logoFile) {
      formData.append("logo", logoFile);
    }

    if (isEdit) {
      await updateVersion(formData);
    } else {
      await createVersion(formData);
    }
  };

  const handleLogoChange = (file: File | null) => {
    if (file === null) {
      setUploadedPreview(null);
      setLogoFile(null);
      setLogoCleared(true);
      return;
    }
    setLogoFile(file);
    setLogoCleared(false);
    const reader = new FileReader();
    reader.onloadend = () => setUploadedPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  //fetch options from the api and put them into option for react select

  const statusOptions = [
    { label: "Draft", value: EventVersionStatus.DRAFT },
    { label: "Active", value: EventVersionStatus.ACTIVE },
    { label: "Archived", value: EventVersionStatus.ARCHIVED },
  ];

  const isLoading = isCreating || isUpdating || isFetching;

  return (
    <div className="bg-surface border border-border rounded-lg w-full shadow-sm">
      <div className="flex justify-between p-6 shrink-0">
        <div className="flex flex-col items-start gap-1">
          <h1 className="text-xl font-bold ">
            {isEdit ? "Edit Version" : "Create New Version"}
          </h1>
          <Text size="sm" variant="muted">
            Spin up a new edition of the conference. You can save as draft and
            publish later.
          </Text>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; Back
        </button>
      </div>

      <Divider />

      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
        >
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                name="version_name"
                label="Version Name"
                placeholder="ICT Meetup 2026"
                rules={{ required: "Version name is required" }}
              />

              <FormInput
                name="slug"
                label="Slug"
                placeholder="ict-meetup-2026"
                rules={{ required: "Slug is required" }}
              />

              <FormInput
                name="version_number"
                label="Version Number"
                type="number"
                step="0.1"
                placeholder="1.0"
                rules={{ required: "Version number is required" }}
              />

              <FormSelect
                name="status"
                label="Status"
                options={statusOptions}
                rules={{ required: "Status is required" }}
              />
            </div>

            <Divider />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormDateRange
                control={methods.control}
                startName="start_date"
                endName="end_date"
                label="Event Date Range"
                rules={{ required: "Start and end dates are required" }}
                error={
                  methods.formState.errors.start_date?.message ||
                  methods.formState.errors.end_date?.message
                }
                isRequired
                placeholder="Start date → End date"
              />
            </div>

            <Divider />

            <div className="space-y-6">
              <FormFileUpload
                name="logo"
                label="Event Logo"
                accept="image/*"
                preview={logoPreview}
                onFileChange={handleLogoChange}
                title="Drop your logo here"
                hint="SVG, PNG, or JPG · max 2 MB · 512×512 recommended"
              />

              <FormCheckbox
                name="is_current"
                label="Mark as the current version"
              />
            </div>
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
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                <Save size={16} />
              )}
              <span>{isEdit ? "Update Version" : "Create Version"}</span>
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
