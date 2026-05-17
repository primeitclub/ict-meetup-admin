import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FormProvider, useForm } from "react-hook-form";
import toast from "react-hot-toast";

import FormSelect from "../../components/form-field/input-select/SelectController";
import useGetVersions from "../../lib/hooks/use-get-versions";
import { usePaymentDetail, usePaymentMutations } from "../../lib/hooks/use-settings-data";
import { EventVersionStatus } from "../../types/version";

type PaymentFormValues = {
  versionId: string;
};

export default function PaymentForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [qrFile, setQrFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const { data: versionsData, isLoading: versionsLoading } = useGetVersions();
  const { data: editData, isLoading: isFetching } = usePaymentDetail(id);
  const { create, update } = usePaymentMutations();

  const versionOptions =
    versionsData?.data.items
      .filter((item) => item.status === EventVersionStatus.DRAFT)
      .map((item) => ({ label: item.version_name, value: item.id })) ?? [];

  const methods = useForm<PaymentFormValues>({
    defaultValues: { versionId: "" },
  });

  const { handleSubmit, reset } = methods;

  useEffect(() => {
    if (editData) {
      reset({ versionId: editData.versionId ?? "" });
      setPreview(editData.qr);
    }
  }, [editData, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setQrFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const isSubmitting = create.isPending || update.isPending;

  const onSubmit = async (formData: PaymentFormValues) => {
    if (!isEditMode && !qrFile) {
      toast.error("Please upload a QR image");
      return;
    }

    try {
      if (isEditMode) {
        if (!qrFile) {
          toast.error("Select a new QR image to update");
          return;
        }
        await update.mutateAsync({ id: id!, file: qrFile });
        toast.success("Payment QR updated successfully");
      } else {
        await create.mutateAsync({ versionId: formData.versionId, file: qrFile! });
        toast.success("Payment QR created successfully");
      }
      navigate(-1);
    } catch {
      toast.error(isEditMode ? "Failed to update QR" : "Failed to create QR");
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
        <h2 className="text-2xl font-bold">{isEditMode ? "Edit Payment QR" : "Add Payment QR"}</h2>
        <p className="text-gray-400 mt-1">Upload a payment QR code image.</p>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {!isEditMode && (
            <FormSelect
              name="versionId"
              label="Flagship Version"
              options={versionOptions}
              rules={{ required: "Please select a version" }}
              isLoading={versionsLoading}
            />
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">QR Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-admin-secondary file:text-white hover:file:bg-admin-secondary/80"
            />
            {preview && (
              <img
                src={preview}
                alt="QR preview"
                className="mt-4 w-40 h-40 object-cover rounded-md border border-gray-700"
              />
            )}
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
