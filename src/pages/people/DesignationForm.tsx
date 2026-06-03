import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FormProvider, useForm } from "react-hook-form";
import { Save } from "lucide-react";
import toast from "react-hot-toast";
import FormInput from "../../components/form-field/input-field/InputController";
import { useApiQuery } from "../../lib";
import { useApiMutation } from "../../lib/use-api-mutation";
import { ApiError } from "../../lib/api-client";
import type { Designation } from "../../types/team";
import Divider from "../../shared/design-components/divider/Divider";
import { Text } from "../../shared/design-components";

interface DesignationFormValues {
  name: string;
}

type DesignationPayload = {
  name: string;
};

const LIST_PATH = "/people/teams/designations";

export default function DesignationForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const { data: existingData, isLoading: isFetching } = useApiQuery(
    "designationDetail",
  )<{ data: Designation }>({
    pathParams: { id: id as string },
    config: { enabled: isEdit },
  });

  const methods = useForm<DesignationFormValues>({
    defaultValues: {
      name: "",
    },
  });
  const { handleSubmit, reset } = methods;

  useEffect(() => {
    if (existingData?.data) {
      const designation = existingData.data;
      reset({
        name: designation.name ?? "",
      });
    }
  }, [existingData, reset]);

  const { execute: createDesignation, isLoading: isCreating } = useApiMutation(
    "designations",
  )<Designation, DesignationPayload>({
    method: "POST",
    onSuccess: () => {
      toast.success("Designation created successfully");
      navigate(LIST_PATH);
    },
    onError: (err) =>
      toast.error(err.message || "Failed to create designation"),
  });

  const { execute: updateDesignation, isLoading: isUpdating } = useApiMutation(
    "designationDetail",
  )<Designation, DesignationPayload>({
    method: "PATCH",
    pathParams: { id: id as string },
    onSuccess: () => {
      toast.success("Designation updated successfully");
      navigate(LIST_PATH);
    },
    onError: (err: ApiError) =>
      toast.error(err.message || "Failed to update designation"),
  });

  const onSubmit = async (data: DesignationFormValues) => {
    const payload: DesignationPayload = {
      name: data.name.trim(),
    };

    if (isEdit) {
      await updateDesignation(payload);
    } else {
      await createDesignation(payload);
    }
  };

  const isLoading = isCreating || isUpdating || isFetching;

  return (
    <div className="bg-surface border border-border rounded-lg w-full shadow-sm">
      {/* Header */}
      <div className="flex justify-between p-6 shrink-0">
        <div className="flex flex-col items-start gap-1">
          <h1 className="text-xl font-bold">
            {isEdit ? "Edit Designation" : "Create New Designation"}
          </h1>
          <Text size="sm" variant="muted">
            Designations are roles assigned to team members.
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
          {/* Scrollable body */}
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                name="name"
                label="Name"
                placeholder="President"
                rules={{
                  required: "Name is required",
                  maxLength: { value: 100, message: "Max 100 characters" },
                }}
                isRequired
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
              <span>
                {isEdit ? "Update Designation" : "Create Designation"}
              </span>
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
