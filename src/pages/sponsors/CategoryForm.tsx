import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FormProvider, useForm } from "react-hook-form";
import { Save } from "lucide-react";
import toast from "react-hot-toast";
import FormInput from "../../components/form-field/input-field/InputController";
import { useApiQuery } from "../../lib";
import { useApiMutation } from "../../lib/use-api-mutation";
import { ApiError } from "../../lib/api-client";
import type { SponsorCategory } from "../../types/sponsor";
import Divider from "../../shared/design-components/divider/Divider";
import { Text } from "../../shared/design-components";

interface CategoryFormValues {
  name: string;
  displayName: string;
  displayOrder: string;
}

type CategoryPayload = {
  name: string;
  displayName: string;
  displayOrder?: number;
};

const LIST_PATH = "/sponsors/categories";

export default function CategoryForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const { data: existingData, isLoading: isFetching } = useApiQuery(
    "sponsorCategoryDetail",
  )<{ data: SponsorCategory }>({
    pathParams: { categoryId: id as string },
    enabled: isEdit,
  });

  const methods = useForm<CategoryFormValues>({
    defaultValues: {
      name: "",
      displayName: "",
      displayOrder: "",
    },
  });
  const { handleSubmit, reset } = methods;

  useEffect(() => {
    if (existingData?.data) {
      const category = existingData.data;
      reset({
        name: category.name ?? "",
        displayName: category.displayName ?? "",
        displayOrder: category.displayOrder?.toString() ?? "",
      });
    }
  }, [existingData, reset]);

  const { execute: createCategory, isLoading: isCreating } = useApiMutation(
    "sponsorCategories",
  )<SponsorCategory, CategoryPayload>({
    method: "POST",
    onSuccess: () => {
      toast.success("Category created successfully");
      navigate(LIST_PATH);
    },
    onError: (err) => toast.error(err.message || "Failed to create category"),
  });

  const { execute: updateCategory, isLoading: isUpdating } = useApiMutation(
    "sponsorCategoryDetail",
  )<SponsorCategory, CategoryPayload>({
    method: "PUT",
    pathParams: { categoryId: id as string },
    onSuccess: () => {
      toast.success("Category updated successfully");
      navigate(LIST_PATH);
    },
    onError: (err: ApiError) =>
      toast.error(err.message || "Failed to update category"),
  });

  const onSubmit = async (data: CategoryFormValues) => {
    const payload: CategoryPayload = {
      name: data.name.trim(),
      displayName: data.displayName.trim(),
      // displayOrder is optional — omit when left blank.
      ...(data.displayOrder.trim() === ""
        ? {}
        : { displayOrder: Number(data.displayOrder) }),
    };

    if (isEdit) {
      await updateCategory(payload);
    } else {
      await createCategory(payload);
    }
  };

  const isLoading = isCreating || isUpdating || isFetching;

  return (
    <div className="bg-surface border border-border rounded-lg w-full shadow-sm">
      {/* Header */}
      <div className="flex justify-between p-6 shrink-0">
        <div className="flex flex-col items-start gap-1">
          <h1 className="text-xl font-bold">
            {isEdit ? "Edit Category" : "Create New Category"}
          </h1>
          <Text size="sm" variant="muted">
            Sponsor categories are shared across every event version.
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                name="name"
                label="Name"
                placeholder="platinum"
                rules={{
                  required: "Name is required",
                  maxLength: { value: 150, message: "Max 150 characters" },
                }}
                isRequired
              />
              <FormInput
                name="displayName"
                label="Display Name"
                placeholder="Platinum Sponsors"
                rules={{
                  required: "Display name is required",
                  maxLength: { value: 150, message: "Max 150 characters" },
                }}
                isRequired
              />
              <FormInput
                name="displayOrder"
                label="Display Order"
                type="number"
                placeholder="1"
                rules={{ min: { value: 1, message: "Must be at least 1" } }}
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
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                <Save size={16} />
              )}
              <span>{isEdit ? "Update Category" : "Create Category"}</span>
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
