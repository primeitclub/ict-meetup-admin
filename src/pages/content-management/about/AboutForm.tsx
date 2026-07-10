import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FormProvider, useForm } from "react-hook-form";
import { Save } from "lucide-react";
import toast from "react-hot-toast";
import FormInput from "../../../components/form-field/input-field/InputController";
import FormSelect from "../../../components/form-field/input-select/SelectController";
import FormRichText from "../../../components/form-field/rich-text/RichTextController";
import FormFileUpload from "../../../components/form-field/FormFileUpload";
import useGetVersionOptions from "../../../lib/hooks/use-get-version-options";
import { useApiQuery } from "../../../lib";
import { useApiMutation } from "../../../lib/use-api-mutation";
import { ApiError } from "../../../lib/api-client";
import type { AboutSection } from "./types";
import Divider from "../../../shared/design-components/divider/Divider";
import { Text } from "../../../shared/design-components";

interface AboutFormValues {
  title: string;
  content: string;
  versionId: string;
  imageUrl: string;
}

export default function AboutForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [imageCleared, setImageCleared] = useState(false);

  const { options: versionOptions, isLoading: versionsLoading, activeVersionId } =
    useGetVersionOptions();

  const { data: existingData, isLoading: isFetching } = useApiQuery(
    "aboutDetail",
  )<{ data: AboutSection }>({
    pathParams: { id: id as string },
    config: { enabled: isEdit },
  });

  const methods = useForm<AboutFormValues>({
    defaultValues: {
      title: "",
      content: "",
      versionId: "",
    },
  });
  const { handleSubmit, reset, setValue } = methods;

  const imagePreview = imageCleared
    ? null
    : (uploadedPreview ?? existingData?.data?.imageUrl ?? null);

  useEffect(() => {
    if (existingData?.data) {
      const section = existingData.data;
      reset({
        title: section.title,
        content: section.content,
        versionId: section.versionId,
      });
    }
  }, [existingData, reset]);

  // Auto-select current version on create
  useEffect(() => {
    if (!isEdit && activeVersionId) {
      setValue("versionId", activeVersionId);
    }
  }, [isEdit, activeVersionId, setValue]);

  const { execute: createAbout, isLoading: isCreating } = useApiMutation(
    "about",
  )<AboutSection, FormData>({
    method: "POST",
    invalidateRoutes: ["about"],
    onSuccess: () => {
      toast.success("About section created successfully");
      navigate("/content-management/about");
    },
    onError: (err) =>
      toast.error(err.message || "Failed to create about section"),
  });

  const { execute: updateAbout, isLoading: isUpdating } = useApiMutation(
    "aboutDetail",
  )<AboutSection, FormData>({
    method: "PUT",
    pathParams: { id: id as string },
    invalidateRoutes: ["about", "aboutDetail"],
    onSuccess: () => {
      toast.success("About section updated successfully");
      navigate("/content-management/about");
    },
    onError: (err: ApiError) =>
      toast.error(err.message || "Failed to update about section"),
  });

  const onSubmit = async (data: AboutFormValues) => {
    if (!isEdit && !imageFile) {
      toast.error("Image is required");
      return;
    }

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
    if (imageFile) {
      formData.append("image", imageFile);
    }

    if (isEdit) {
      await updateAbout(formData);
    } else {
      await createAbout(formData);
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
            {isEdit ? "Edit About" : "Create New About"}
          </h1>
          <Text size="sm" variant="muted">
            Add or update the About section for a flagship version.
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
                placeholder="About the event"
                rules={{ required: "Title is required" }}
              />

              <FormRichText
                name="content"
                label="Content"
                placeholder="Describe the about section content"
                isRequired
                rules={{ required: "Content is required" }}
              />

              <FormSelect
                name="versionId"
                label="Version"
                options={versionOptions}
                rules={{ required: "Please select a version" }}
                isLoading={versionsLoading}
              />
            </div>

            <Divider />

            {/* Image */}
            <FormFileUpload
              name="image"
              label="Image"
              isRequired={!isEdit}
              accept="image/*"
              preview={imagePreview}
              onFileChange={handleImageChange}
              title="Drop your image here"
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
              <span>{isEdit ? "Update About" : "Create About"}</span>
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
