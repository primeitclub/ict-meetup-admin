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
import type { Sponsor, SponsorCategory } from "../../types/sponsor";
import Divider from "../../shared/design-components/divider/Divider";
import { Text } from "../../shared/design-components";

interface SponsorFormValues {
  name: string;
  versionId: string;
  categoryId: string;
  link: string;
  displayOrder: string;
}

const LIST_PATH = "/sponsors/all-sponsors";

const httpsRule = {
  pattern: { value: /^https?:\/\/.+/, message: "Must be a valid URL" },
  maxLength: { value: 255, message: "Max 255 characters" },
};

export default function SponsorForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [imageCleared, setImageCleared] = useState(false);

  // Sponsors have no archive guard, so any version can receive them.
  const { options: versionOptions, isLoading: versionsLoading, activeVersionId } =
    useGetVersionOptions({ status: null });

  const { data: categoriesData, isLoading: categoriesLoading } = useApiQuery(
    "sponsorCategories",
  )<{ data: { items: SponsorCategory[] } }>();

  const { data: existingData, isLoading: isFetching } = useApiQuery(
    "sponsorDetail",
  )<{ data: Sponsor }>({
    pathParams: { sponsorId: id as string },
    enabled: isEdit,
  });

  const methods = useForm<SponsorFormValues>({
    defaultValues: {
      name: "",
      versionId: "",
      categoryId: "",
      link: "",
      displayOrder: "",
    },
  });
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, dirtyFields },
  } = methods;

  const selectedCategoryId = watch("categoryId");

  const categoryOptions = useMemo(
    () =>
      (categoriesData?.data?.items ?? []).map((category) => ({
        label: category.displayName || category.name,
        value: category.id,
      })),
    [categoriesData],
  );

  // displayOrder is unique per category (including 0). Look up the sponsors
  // already in the chosen category so we can suggest the next free order and
  // dodge the "Display order N is already taken" error.
  const { data: categorySponsors } = useApiQuery("sponsors")<{
    data: { items: Sponsor[] };
  }>({
    queryParams: { categoryId: selectedCategoryId, limit: 100 },
    enabled: !isEdit && !!selectedCategoryId,
  });

  const imagePreview = imageCleared
    ? null
    : (uploadedPreview ?? existingData?.data?.imageUrl ?? null);

  useEffect(() => {
    if (existingData?.data) {
      const sponsor = existingData.data;
      reset({
        name: sponsor.name ?? "",
        versionId: sponsor.versionId ?? "",
        categoryId: sponsor.categoryId ?? "",
        link: sponsor.link ?? "",
        displayOrder: sponsor.displayOrder?.toString() ?? "",
      });
    }
  }, [existingData, reset]);

  // Auto-select current version on create
  useEffect(() => {
    if (!isEdit && activeVersionId) {
      setValue("versionId", activeVersionId);
    }
  }, [isEdit, activeVersionId, setValue]);

  // Auto-fill the next free display order for the picked category (create only,
  // and only until the user edits the field themselves).
  useEffect(() => {
    if (isEdit || dirtyFields.displayOrder || !selectedCategoryId) return;
    const orders = (categorySponsors?.data?.items ?? []).map(
      (s) => s.displayOrder,
    );
    const next = orders.length ? Math.max(...orders) + 1 : 1;
    setValue("displayOrder", String(next), { shouldDirty: false });
  }, [
    isEdit,
    selectedCategoryId,
    categorySponsors,
    dirtyFields.displayOrder,
    setValue,
  ]);

  const { execute: createSponsor, isLoading: isCreating } = useApiMutation(
    "sponsors",
  )<Sponsor, FormData>({
    method: "POST",
    invalidateRoutes: ["sponsors"],
    onSuccess: () => {
      toast.success("Sponsor created successfully");
      navigate(LIST_PATH);
    },
    onError: (err) => toast.error(err.message || "Failed to create sponsor"),
  });

  const { execute: updateSponsor, isLoading: isUpdating } = useApiMutation(
    "sponsorDetail",
  )<Sponsor, FormData>({
    method: "PUT",
    pathParams: { sponsorId: id as string },
    invalidateRoutes: ["sponsors", "sponsorDetail"],
    onSuccess: () => {
      toast.success("Sponsor updated successfully");
      navigate(LIST_PATH);
    },
    onError: (err: ApiError) =>
      toast.error(err.message || "Failed to update sponsor"),
  });

  const onSubmit = async (data: SponsorFormValues) => {
    // Image is required on create; on edit the existing logo is kept if omitted.
    if (!isEdit && !imageFile) {
      toast.error("Image is required");
      return;
    }

    const formData = new FormData();
    formData.append("name", data.name.trim());
    formData.append("versionId", data.versionId);
    formData.append("categoryId", data.categoryId);
    if (data.link.trim()) formData.append("link", data.link.trim());
    if (data.displayOrder.trim()) {
      formData.append("displayOrder", data.displayOrder.trim());
    }
    if (imageFile) {
      formData.append("image", imageFile);
    }

    if (isEdit) {
      await updateSponsor(formData);
    } else {
      await createSponsor(formData);
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
            {isEdit ? "Edit Sponsor" : "Create New Sponsor"}
          </h1>
          <Text size="sm" variant="muted">
            Add or update a sponsor logo for a flagship version.
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
                placeholder="Acme Corp"
                rules={{
                  required: "Name is required",
                  maxLength: { value: 150, message: "Max 150 characters" },
                }}
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
                  categoriesLoading
                    ? "Loading categories…"
                    : "Select a category"
                }
                searchPlaceholder="Search categories…"
                emptyText="No categories found"
                disabled={categoriesLoading}
                rules={{ required: "Please select a category" }}
                error={errors.categoryId?.message}
                action={{
                  label: "Add new category",
                  onSelect: () => navigate("/sponsors/categories/add"),
                }}
              />
              <FormInput
                name="displayOrder"
                label="Display Order"
                type="number"
                placeholder="1"
                rules={{
                  required: "Display order is required",
                  min: { value: 1, message: "Must be at least 1" },
                  max: { value: 100, message: "Must be 100 or less" },
                }}
                isRequired
              />
              <FormInput
                name="link"
                label="Link"
                placeholder="https://acme.com"
                rules={httpsRule}
              />
            </div>

            <Divider />

            {/* Logo */}
            <FormFileUpload
              name="image"
              label="Logo"
              isRequired
              accept="image/*"
              preview={imagePreview}
              onFileChange={handleImageChange}
              title="Drop the sponsor logo here"
              hint="SVG, PNG, or JPG · max 150 KB"
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
              <span>{isEdit ? "Update Sponsor" : "Create Sponsor"}</span>
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
