import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { ImageUp, X } from "lucide-react";
import FormSelect from "../../components/form-field/input-select/SelectController";
import FormInput from "../../components/form-field/input-field/InputController";
import Textarea from "../../components/form-field/Textarea";
import { useApiQuery } from "../../lib";
import { useApiMutation } from "../../lib/use-api-mutation";
import useGetVersions from "../../lib/hooks/use-get-versions";
import { EventVersionStatus } from "../../types/version";
import type { AboutSection } from "../../types/about";
import toast from "react-hot-toast";

type AboutFormValues = {
  flagship_versions: string;
  title: string;
  content: string;
  image: FileList | null;
};

export default function AboutForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { data: versionsData, isLoading: versionsLoading } = useGetVersions();
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const versionOptions = versionsData?.data.items
    ?.filter((item) => item.status === EventVersionStatus.DRAFT)
    .map((item) => ({ label: item.version_name, value: item.id }));

  const { execute: createAboutSection, isLoading: isCreating } = useApiMutation(
    "about",
  )<{ data: AboutSection }, FormData>({
    method: "POST",
    invalidateRoutes: ["about"],
  });

  const { execute: updateAboutSection, isLoading: isUpdating } = useApiMutation(
    "aboutDetail",
  )<{ data: AboutSection }, FormData>({
    method: "PUT",
    invalidateRoutes: ["about"],
  });

  const { data: editData } = useApiQuery("aboutDetail")<{ data: AboutSection }>(
    {
      pathParams: { id: id! },
      enabled: isEditMode,
    },
  );

  const methods = useForm<AboutFormValues>({
    defaultValues: {
      title: "",
      content: "",
      flagship_versions: "",
      image: null,
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = methods;

  const imageField = watch("image");

  useEffect(() => {
    if (imageField && imageField.length > 0) {
      const file = imageField[0];
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [imageField]);

  useEffect(() => {
    if (editData?.data) {
      const section = editData.data;

      reset({
        flagship_versions: section.versionId,
        title: section.title,
        content: section.content,
        image: null,
      });
      if (section.image) setPreview(section.image);
    }
  }, [editData, reset]);

  const isSubmitting = isCreating || isUpdating;

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && fileInputRef.current) {
      const dt = new DataTransfer();
      dt.items.add(file);
      fileInputRef.current.files = dt.files;
      fileInputRef.current.dispatchEvent(
        new Event("change", { bubbles: true }),
      );
    }
  };

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (formData: AboutFormValues) => {
    const payload = new FormData();

    payload.append("title", formData.title);
    payload.append("content", formData.content);
    payload.append("versionId", formData.flagship_versions);
    if (formData.image && formData.image.length > 0) {
      payload.append("image", formData.image[0]);
    }

    try {
      if (isEditMode) {
        await updateAboutSection(payload, { pathParams: { id: id! } });
        toast.success("About section updated successfully");
      } else {
        await createAboutSection(payload);
        toast.success("About section created successfully");
      }
      navigate(-1);
    } catch {
      toast.error(
        isEditMode
          ? "Failed to update about section"
          : "Failed to create about section",
      );
    }
  };

  const { ref: rhfImageRef, ...imageRegisterProps } = register("image");

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
          {isEditMode ? "Edit About Section" : "Fill below fields"}
        </h2>
        <p className="text-gray-400 mt-1">
          Provide the details below to {isEditMode ? "update the" : "add new"}{" "}
          about content. Please ensure all information is accurate before
          submitting the form.
        </p>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <FormInput
            name="title"
            label="Title"
            placeholder="Enter About title"
            rules={{ required: "Title is required" }}
          />
          {/* Content */}
          <Textarea
            label="Description"
            placeholder="About 100 words"
            {...register("content", { required: "Content is required" })}
            error={errors.content?.message}
          />

          {/* Image upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Attach Image File (.jpg, .png, .pdf)
            </label>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => !preview && fileInputRef.current?.click()}
              className={[
                "relative flex flex-col items-center justify-center rounded-lg border transition-colors min-h-[180px]",
                isDragging
                  ? "border-admin-secondary bg-admin-secondary/10 cursor-copy"
                  : "border-gray-700 bg-[#02111F]/40 hover:border-gray-500",
                preview ? "cursor-default" : "cursor-pointer",
              ].join(" ")}
            >
              {preview ? (
                <>
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-48 max-w-full rounded-md object-contain p-2"
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute top-2 right-2 p-1 rounded-full bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                    aria-label="Remove image"
                  >
                    <X size={16} />
                  </button>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full border border-gray-600 flex items-center justify-center mb-3">
                    <ImageUp size={22} className="text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-300 font-medium">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    SVG, PNG, JPG or GIF (max. 5MB)
                  </p>
                </>
              )}

              <input
                type="file"
                accept=".jpg,.jpeg,.png,.gif,.svg,.pdf"
                className="hidden"
                {...imageRegisterProps}
                ref={(e) => {
                  rhfImageRef(e);
                  fileInputRef.current = e;
                }}
              />
            </div>

            {errors.image && (
              <p className="mt-1 text-sm text-red-400">
                {errors.image.message as string}
              </p>
            )}
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

          {/* Actions */}
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
              {isSubmitting ? "Saving..." : isEditMode ? "Update" : "Submit"}
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
