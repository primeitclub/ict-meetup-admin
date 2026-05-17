import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FormProvider, useForm } from "react-hook-form";
import toast from "react-hot-toast";

import FormInput from "../../components/form-field/input-field/InputController";
import FormSelect from "../../components/form-field/input-select/SelectController";
import useGetVersions from "../../lib/hooks/use-get-versions";
import { useContactDetail, useContactMutations } from "../../lib/hooks/use-settings-data";
import { EventVersionStatus } from "../../types/version";

type ContactFormValues = {
  name: string;
  email: string;
  phone: string;
  versionId: string;
};

export default function ContactForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const { data: versionsData, isLoading: versionsLoading } = useGetVersions();
  const { data: editData, isLoading: isFetching } = useContactDetail(id);
  const { create, update } = useContactMutations();

  const versionOptions =
    versionsData?.data.items
      .filter((item) => item.status === EventVersionStatus.DRAFT)
      .map((item) => ({ label: item.version_name, value: item.id })) ?? [];

  const methods = useForm<ContactFormValues>({
    defaultValues: { name: "", email: "", phone: "", versionId: "" },
  });

  const { handleSubmit, reset } = methods;

  useEffect(() => {
    if (editData) {
      reset({
        name: editData.name,
        email: editData.email,
        phone: editData.phone,
        versionId: editData.versionId ?? "",
      });
    }
  }, [editData, reset]);

  const isSubmitting = create.isPending || update.isPending;

  const onSubmit = async (formData: ContactFormValues) => {
    try {
      if (isEditMode) {
        await update.mutateAsync({
          id: id!,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        });
        toast.success("Contact updated successfully");
      } else {
        await create.mutateAsync(formData);
        toast.success("Contact created successfully");
      }
      navigate(-1);
    } catch {
      toast.error(isEditMode ? "Failed to update contact" : "Failed to create contact");
    }
  };

  if (isEditMode && isFetching) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center space-x-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          &larr; Back
        </button>
      </div>

      <div>
        <h2 className="text-2xl font-bold">{isEditMode ? "Edit Contact" : "Add Contact"}</h2>
        <p className="text-gray-400 mt-1">Manage contact information for the event.</p>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormInput
            name="name"
            label="Team Name"
            placeholder="Enter team or contact name"
            rules={{ required: "Name is required" }}
          />
          <FormInput
            name="email"
            label="Email"
            type="email"
            placeholder="contact@example.com"
            rules={{ required: "Email is required" }}
          />
          <FormInput
            name="phone"
            label="Phone"
            placeholder="+977-9812345678"
            rules={{ required: "Phone is required" }}
          />

          {!isEditMode && (
            <FormSelect
              name="versionId"
              label="Flagship Version"
              options={versionOptions}
              rules={{ required: "Please select a version" }}
              isLoading={versionsLoading}
            />
          )}

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
              className="px-6 py-2 rounded-md bg-admin-secondary text-white hover:bg-admin-secondary/80 transition-colors font-medium disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : isEditMode ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
