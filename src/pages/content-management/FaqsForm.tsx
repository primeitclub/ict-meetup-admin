import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import FormInput from "../../components/form-field/input-field/InputController";
import FormSelect from "../../components/form-field/input-select/SelectController";
import Textarea from "../../components/form-field/Textarea";
import useGetVersions from "../../lib/hooks/use-get-versions";
import useCreateFaqSection from "../../lib/hooks/use-create-faq-section";
import { EventVersionStatus } from "../../types/version";
import { useApiQuery } from "../../lib";
import { useApiMutation } from "../../lib/use-api-mutation";
import type { faqSection } from "../../types/faq";
import toast from "react-hot-toast";

type FaqFormValues = {
  title: string;
  description: string;
  flagship_versions: string;
};

export default function FaqsForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const { data: versionsData, isLoading: versionsLoading } = useGetVersions();
  const { execute: createfaqSection, isLoading: isCreating } =
    useCreateFaqSection();
  const { execute: updatefaqSection, isLoading: isUpdating } = useApiMutation(
    "faqDetail",
  )<
    { data: faqSection },
    Omit<
      faqSection,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "createdById"
      | "modifiedById"
      | "flagshipEventVersion"
    >
  >({ method: "PUT", invalidateRoutes: ["faqs"] });

  const { data: editData } = useApiQuery("faqDetail")<{
    data: faqSection;
  }>({
    pathParams: { id: id! },
    enabled: isEditMode,
  });

  const versionOptions = versionsData?.data.items
    .filter((item) => item.status === EventVersionStatus.DRAFT)
    .map((item) => ({ label: item.version_name, value: item.id }));

  const methods = useForm<FaqFormValues>({
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
    formState: { errors },
  } = methods;

  useEffect(() => {
    if (editData?.data) {
      const section = editData.data;
      reset({
        title: section.title,
        description: section.description,
        flagship_versions: section.versionId,
      });
    }
  }, [editData, reset]);

  const isSubmitting = isCreating || isUpdating;

  const onSubmit = async (formData: FaqFormValues) => {
    const payload = {
      title: formData.title,
      description: formData.description,
      versionId: formData.flagship_versions,
    };

    try {
      if (isEditMode) {
        await updatefaqSection(payload, { pathParams: { id: id! } });
        toast.success("FAQ section updated successfully");
      } else {
        await createfaqSection(payload);
        toast.success("FAQ section created successfully");
      }
      navigate(-1);
    } catch {
      toast.error(
        isEditMode
          ? "Failed to update FAQ section"
          : "Failed to create FAQ section",
      );
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          &larr; Back
        </button>
      </div>

      <div>
        <h2 className="text-2xl font-bold">
          {isEditMode ? "Edit FAQ Section" : "Fill below fields"}
        </h2>
        <p className="text-gray-400 mt-1">
          Provide the details below to {isEditMode ? "update the" : "add new"}{" "}
          FAQ content. Please ensure all information is accurate before
          submitting the form.
        </p>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
              <FormInput
                name="title"
                label="Title"
                placeholder="Enter FAQ title"
                rules={{ required: "Title is required" }}
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <Textarea
                label="Description"
                placeholder="Enter FAQ description"
                {...register("description", {
                  required: "Description is required",
                })}
                error={errors.description?.message}
              />
            </div>
          </div>

          <div className="col-span-1">
            <FormSelect
              name="flagship_versions"
              label="Flagship Version"
              options={versionOptions ?? []}
              rules={{ required: "Please select a flagship version" }}
              isLoading={versionsLoading}
            />
          </div>

          <div className="pt-6 flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 rounded-md border border-gray-800 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 rounded-md bg-admin-secondary text-white hover:bg-admin-secondary/80 focus:ring-2 focus:ring-offset-2 focus:ring-offset-admin-primary focus:ring-admin-secondary transition-colors font-medium disabled:opacity-50"
            >
              {isSubmitting
                ? "Saving..."
                : isEditMode
                  ? "Update"
                  : "Save Default"}
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
