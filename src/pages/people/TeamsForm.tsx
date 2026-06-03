import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FormProvider, useForm } from "react-hook-form";
import { Save } from "lucide-react";
import toast from "react-hot-toast";
import FormInput from "../../components/form-field/input-field/InputController";
import FormSelect from "../../components/form-field/input-select/SelectController";
import FormComboBox from "../../components/form-field/combobox/FormComboBox";
import FormFileUpload from "../../components/form-field/FormFileUpload";
import useGetVersionOptions from "../../lib/hooks/use-get-version-options";
import { useApiQuery } from "../../lib";
import { useApiMutation } from "../../lib/use-api-mutation";
import { ApiError } from "../../lib/api-client";
import type { TeamMember, TeamCategory, Designation } from "../../types/team";
import Divider from "../../shared/design-components/divider/Divider";
import { Text } from "../../shared/design-components";

interface TeamFormValues {
  name: string;
  versionId: string;
  categoryId: string;
  designationId: string;
  displayOrder: string;
  instagram: string;
  linkedin: string;
  portfolio: string;
}

const LIST_PATH = "/people/teams";

// Social links must be absolute https URLs (matches the backend schema).
const httpsRule = {
  pattern: {
    value: /^https:\/\/.+/,
    message: "Must start with https://",
  },
};

export default function TeamsForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [imageCleared, setImageCleared] = useState(false);

  const { options: versionOptions, isLoading: versionsLoading } =
    useGetVersionOptions();

  const { data: categoriesData, isLoading: categoriesLoading } = useApiQuery(
    "teamCategories",
  )<{ data: { items: TeamCategory[] } }>();

  const { data: designationsData, isLoading: designationsLoading } =
    useApiQuery("designations")<{ data: { items: Designation[] } }>();

  const { data: existingData, isLoading: isFetching } = useApiQuery(
    "teamDetail",
  )<{ data: TeamMember }>({
    pathParams: { teamId: id as string },
    config: { enabled: isEdit },
  });

  const methods = useForm<TeamFormValues>({
    defaultValues: {
      name: "",
      versionId: "",
      categoryId: "",
      designationId: "",
      displayOrder: "",
      instagram: "",
      linkedin: "",
      portfolio: "",
    },
  });
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = methods;

  const categoryOptions = useMemo(
    () =>
      (categoriesData?.data?.items ?? []).map((category) => ({
        label: category.displayName || category.name,
        value: category.id,
      })),
    [categoriesData],
  );

  const designationOptions = useMemo(
    () =>
      (designationsData?.data?.items ?? []).map((d) => ({
        label: d.name,
        value: d.id,
      })),
    [designationsData],
  );

  const imagePreview = imageCleared
    ? null
    : (uploadedPreview ?? existingData?.data?.imageUrl ?? null);

  useEffect(() => {
    if (existingData?.data) {
      const team = existingData.data;
      reset({
        name: team.name ?? "",
        versionId: team.versionId ?? "",
        categoryId: team.categoryId ?? "",
        designationId: team.designationId ?? "",
        displayOrder: team.displayOrder?.toString() ?? "",
        instagram: team.socialLinks?.instagram ?? "",
        linkedin: team.socialLinks?.linkedin ?? "",
        portfolio: team.socialLinks?.portfolio ?? "",
      });
    }
  }, [existingData, reset]);

  const { execute: createTeam, isLoading: isCreating } = useApiMutation(
    "teams",
  )<TeamMember, FormData>({
    method: "POST",
    onSuccess: () => {
      toast.success("Team member created successfully");
      navigate(LIST_PATH);
    },
    onError: (err) =>
      toast.error(err.message || "Failed to create team member"),
  });

  const { execute: updateTeam, isLoading: isUpdating } = useApiMutation(
    "teamDetail",
  )<TeamMember, FormData>({
    method: "PATCH",
    pathParams: { teamId: id as string },
    onSuccess: () => {
      toast.success("Team member updated successfully");
      navigate(LIST_PATH);
    },
    onError: (err: ApiError) =>
      toast.error(err.message || "Failed to update team member"),
  });

  const onSubmit = async (data: TeamFormValues) => {
    // Image is required on create; on edit the existing image may already be set.
    if (!isEdit && !imageFile) {
      toast.error("Image is required");
      return;
    }

    const socialLinks: Record<string, string> = {};
    if (data.instagram.trim()) socialLinks.instagram = data.instagram.trim();
    if (data.linkedin.trim()) socialLinks.linkedin = data.linkedin.trim();
    if (data.portfolio.trim()) socialLinks.portfolio = data.portfolio.trim();

    const formData = new FormData();
    formData.append("name", data.name.trim());
    formData.append("versionId", data.versionId);
    formData.append("categoryId", data.categoryId);
    formData.append("designationId", data.designationId);
    if (data.displayOrder.trim()) {
      formData.append("displayOrder", data.displayOrder.trim());
    }
    // FormData values are strings, so socialLinks goes as a JSON string —
    // the backend schema JSON.parses it.
    if (Object.keys(socialLinks).length > 0) {
      formData.append("socialLinks", JSON.stringify(socialLinks));
    }
    if (imageFile) {
      formData.append("image", imageFile);
    }

    if (isEdit) {
      await updateTeam(formData);
    } else {
      await createTeam(formData);
    }
  };

  const handleImageChange = (file: File | null) => {
    if (file === null) {
      setUploadedPreview(null);
      setImageFile(null);
      setImageCleared(true);
      return;
    }
    setImageFile(file);
    setImageCleared(false);
    const reader = new FileReader();
    reader.onloadend = () => setUploadedPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const isLoading = isCreating || isUpdating || isFetching;

  return (
    <div className="bg-surface border border-border rounded-lg w-full shadow-sm">
      {/* Header */}
      <div className="flex justify-between p-6 shrink-0">
        <div className="flex flex-col items-start gap-1">
          <h1 className="text-xl font-bold">
            {isEdit ? "Edit Team Member" : "Create New Team Member"}
          </h1>
          <Text size="sm" variant="muted">
            Add or update a team member profile for a flagship version.
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
            {/* Basics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                name="name"
                label="Name"
                placeholder="Ada Lovelace"
                rules={{ required: "Name is required" }}
                isRequired
              />
              <FormSelect
                name="versionId"
                label="Version"
                options={versionOptions}
                rules={{ required: "Please select a version" }}
                isLoading={versionsLoading}
              />
              <FormComboBox
                control={control}
                name="categoryId"
                label="Category"
                options={categoryOptions}
                placeholder={
                  categoriesLoading ? "Loading categories…" : "Select a category"
                }
                searchPlaceholder="Search categories…"
                emptyText="No categories found"
                disabled={categoriesLoading}
                rules={{ required: "Please select a category" }}
                error={errors.categoryId?.message}
                action={{
                  label: "Add new category",
                  onSelect: () => navigate("/people/teams/categories/add"),
                }}
              />
              <FormComboBox
                control={control}
                name="designationId"
                label="Designation"
                options={designationOptions}
                placeholder={
                  designationsLoading
                    ? "Loading designations…"
                    : "Select a designation"
                }
                searchPlaceholder="Search designations…"
                emptyText="No designations found"
                disabled={designationsLoading}
                rules={{ required: "Please select a designation" }}
                error={errors.designationId?.message}
                action={{
                  label: "Add new designation",
                  onSelect: () => navigate("/people/teams/designations/add"),
                }}
              />
              <FormInput
                name="displayOrder"
                label="Display Order"
                type="number"
                placeholder="1"
                rules={{ min: { value: 1, message: "Must be at least 1" } }}
              />
            </div>

            <Divider />

            {/* Social links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormInput
                name="instagram"
                label="Instagram"
                placeholder="https://instagram.com/…"
                rules={httpsRule}
              />
              <FormInput
                name="linkedin"
                label="LinkedIn"
                placeholder="https://linkedin.com/in/…"
                rules={httpsRule}
              />
              <FormInput
                name="portfolio"
                label="Portfolio"
                placeholder="https://…"
                rules={httpsRule}
              />
            </div>

            <Divider />

            {/* Image */}
            <FormFileUpload
              name="image"
              label="Image"
              isRequired
              accept="image/*"
              preview={imagePreview}
              onFileChange={handleImageChange}
              title="Drop your team member image here"
              hint="SVG, PNG, or JPG · max 2 MB"
            />
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
              <span>{isEdit ? "Update Team Member" : "Create Team Member"}</span>
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
