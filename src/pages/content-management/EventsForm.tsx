import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { ChevronRight, Upload, X } from "lucide-react";
import FormInput from "../../components/form-field/input-field/InputController";
import FormSelect from "../../components/form-field/input-select/SelectController";
import useGetVersions from "../../lib/hooks/use-get-versions";
import { EventVersionStatus } from "../../types/version";
import { useApiQuery } from "../../lib";
import { useApiMutation } from "../../lib/use-api-mutation";
import type { Event, CreateEventPayload } from "../../types/event";
import toast from "react-hot-toast";

const feeTypeOptions = [
  { label: "Free", value: "free" },
  { label: "Paid", value: "paid" },
];

const statusOptions = [
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
  { label: "Archived", value: "archived" },
];

const locationOptions = [
  { label: "Prithvi Hall", value: "Prithvi Hall" },
  { label: "Sagarmatha Hall", value: "Sagarmatha Hall" },
  { label: "Online", value: "Online" },
];

export default function EventsForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { data: versionsData, isLoading: versionsLoading } = useGetVersions();
  
  const { execute: createEvent, isLoading: isCreating } = useApiMutation("events")<
    { data: Event },
    FormData
  >({ method: "POST", invalidateRoutes: ["events"] });

  const { execute: updateEvent, isLoading: isUpdating } = useApiMutation("eventDetail")<
    { data: Event },
    FormData
  >({ method: "PATCH", invalidateRoutes: ["events"] });

  const { data: editData } = useApiQuery("eventDetail")<{ data: Event }>({
    pathParams: { eventId: id! },
    enabled: isEditMode,
  });

  const { data: categoriesData, isLoading: categoriesLoading } = useApiQuery("eventCategories")<{ data: { items: any[] } }>();

  const categoryOptions = categoriesData?.data.items.map((cat) => ({
    label: cat.name,
    value: cat.id,
  }));

  const versionOptions = versionsData?.data.items
    .filter((item) => item.status === EventVersionStatus.DRAFT || item.status === EventVersionStatus.PUBLISHED)
    .map((item) => ({ label: item.version_name, value: item.id }));

  const methods = useForm<CreateEventPayload>({
    defaultValues: {
      title: "",
      subtitle: "",
      description: "",
      date: "",
      startTime: "",
      endTime: "",
      totalSeats: 0,
      registrationDeadline: "",
      displayOrder: 1,
      versionId: "",
      categoryId: "",
      speakerName: "", // Note: backend uses speakerId, but form uses speakerName? Let's check.
      feeType: "free",
      location: "",
      status: "draft",
    },
  });

  const {
    handleSubmit,
    reset,
    setValue,
  } = methods;

  useEffect(() => {
    if (editData?.data) {
      const event = editData.data;
      reset({
        title: event.title,
        subtitle: event.subtitle || "",
        description: event.description || "",
        date: event.date ? new Date(event.date).toISOString().split('T')[0] : "",
        startTime: event.startTime,
        endTime: event.endTime,
        totalSeats: event.totalSeats,
        registrationDeadline: event.registrationDeadline ? new Date(event.registrationDeadline).toISOString().split('T')[0] : "",
        displayOrder: event.displayOrder,
        versionId: event.versionId,
        categoryId: event.categoryId || "",
        speakerName: event.speakerName,
        feeType: event.feeType,
        location: event.location,
        status: event.status || "draft",
      });
      if (event.image) setImagePreview(event.image);
    }
  }, [editData, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const isSubmitting = isCreating || isUpdating;

  const onSubmit = async (formData: CreateEventPayload) => {
    const data = new FormData();
    
    // Append all form fields except image to FormData
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== "image" && value !== undefined && value !== null) {
        data.append(key, String(value));
      }
    });

    // Append the image file if selected
    if (imageFile) {
      data.append("image", imageFile);
    }

    try {
      if (isEditMode) {
        await updateEvent(data, { pathParams: { eventId: id! } });
        toast.success("Event updated successfully");
      } else {
        await createEvent(data);
        toast.success("Event created successfully");
      }
      navigate(-1);
    } catch (error: any) {
      toast.error(error.message || (isEditMode ? "Failed to update event" : "Failed to create event"));
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-sm">
        <Link to="/content-management" className="text-[#CCCCCC] hover:text-white transition-colors font-medium">
          Content management
        </Link>
        <ChevronRight size={14} className="text-[#666666]" />
        <Link to="/content-management/events" className="text-[#CCCCCC] hover:text-white transition-colors font-medium">
          Events
        </Link>
        <ChevronRight size={14} className="text-[#666666]" />
        <span className="text-white font-bold">Add events</span>
      </nav>

      <div className="space-y-1">
        <h2 className="text-[32px] font-bold text-white">Fill below fields</h2>
        <p className="text-[#999999] text-sm max-w-2xl">
          Provide the details below to add new event content. Please ensure all information is accurate before submitting the form.
        </p>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6">
            {/* Left Column */}
            <div className="space-y-6">
              <FormInput
                name="title"
                label="Title"
                placeholder="Enter event title"
                rules={{ required: "Title is required" }}
              />

              <div className="space-y-2">
                <label className="block text-base text-[#E6E6E6]">Attach Image File (.jpg, .png, .pdf)</label>
                <div className="relative border-2 border-dashed border-[#1A2B44] rounded-xl bg-[#010B14] h-[280px] flex flex-col items-center justify-center p-10 text-center group hover:border-[#3571F0] transition-colors overflow-hidden">
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => { setImagePreview(null); setImageFile(null); }}
                        className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white z-10"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center mb-4">
                        <Upload size={24} className="text-white" />
                      </div>
                      <p className="text-white text-lg font-medium">Click to upload or drag and drop</p>
                      <p className="text-[#999999] text-sm mt-1">SVG, PNG, JPG or GIF (max. 5MB)</p>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              <FormInput
                name="date"
                label="Event Date"
                type="date"
                placeholder="Select event date"
                rules={{ required: "Event date is required" }}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  name="startTime"
                  label="Start & End Time"
                  type="time"
                  placeholder="Select event time"
                  rules={{ required: "Start time is required" }}
                />
                <div className="pt-8">
                  <FormInput
                    name="endTime"
                    label=""
                    type="time"
                    placeholder="Select event time"
                    rules={{ required: "End time is required" }}
                  />
                </div>
              </div>

              <FormInput
                name="totalSeats"
                label="Total Seat"
                type="number"
                placeholder="Enter total seat occupied"
                rules={{ required: "Total seats required", min: 0 }}
              />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <FormInput
                name="registrationDeadline"
                label="Registration Closed Deadline"
                type="date"
                placeholder="Select registration closed date"
                rules={{ required: "Registration deadline is required" }}
              />

              <FormInput
                name="displayOrder"
                label="Display Order"
                type="number"
                placeholder="Enter display order"
                rules={{ required: "Display order is required", min: 1 }}
              />

              <FormSelect
                name="versionId"
                label="Flagship Version"
                options={versionOptions ?? []}
                rules={{ required: "Please select a flagship version" }}
                isLoading={versionsLoading}
                placeholder="Select flagship version"
              />

              <FormSelect
                name="categoryId"
                label="Category"
                options={categoryOptions ?? []}
                rules={{ required: "Please select a category" }}
                isLoading={categoriesLoading}
                placeholder="Select category"
              />

              <FormSelect
                name="status"
                label="Status"
                options={statusOptions}
                rules={{ required: "Please select a status" }}
                placeholder="Select status"
              />

              <FormInput
                name="speakerName"
                label="Speaker Name"
                placeholder="Enter speaker name"
                rules={{ required: "Speaker name is required" }}
              />

              <FormSelect
                name="feeType"
                label="Fee Type"
                options={feeTypeOptions}
                placeholder="Select fee Type"
                rules={{ required: "Fee type is required" }}
              />

              <FormSelect
                name="location"
                label="Location"
                options={locationOptions}
                placeholder="Select Location"
                rules={{ required: "Location is required" }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-10 py-2.5 rounded-xl border border-gray-700 text-white hover:bg-white/5 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-14 py-2.5 rounded-xl bg-[#3571F0] text-white hover:bg-[#3571F0]/90 focus:ring-2 focus:ring-offset-2 focus:ring-[#3571F0] transition-colors font-medium disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}


