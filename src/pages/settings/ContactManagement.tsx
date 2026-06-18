import { useEffect, useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { Plus, Save, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import FormInput from "../../components/form-field/input-field/InputController";
import { useApiMutation } from "../../lib/use-api-mutation";
import Divider from "../../shared/design-components/divider/Divider";
import { Text } from "../../shared/design-components";
import ConfirmDialog from "../../shared/design-components/dialog/ConfirmDialog";
import { useSettingsForVersion, useSaveSettings } from "./use-settings";
import SettingsVersionBar from "./SettingsVersionBar";

interface ContactPerson {
  name: string;
  phone: string;
}

interface ContactDepartment {
  department: string;
  contacts: ContactPerson[];
}

interface ContactFormValues {
  email: string;
  phoneNumber: string;
  teamName: string;
  contactDepartments: ContactDepartment[];
}

export default function ContactManagement() {
  const {
    versionOptions,
    selectedVersionId,
    setVersion,
    settings,
    exists,
    isArchived,
    isDraft,
    refetchSettings,
  } = useSettingsForVersion();

  const methods = useForm<ContactFormValues>({
    defaultValues: {
      email: "",
      phoneNumber: "",
      teamName: "",
      contactDepartments: [],
    },
  });
  const { control, handleSubmit, reset } = methods;

  const {
    fields: deptFields,
    append: appendDept,
    remove: removeDept,
  } = useFieldArray({ control, name: "contactDepartments" });

  useEffect(() => {
    reset({
      email: settings?.email ?? "",
      phoneNumber: settings?.phoneNumber ?? "",
      teamName: settings?.teamName ?? "",
      contactDepartments: settings?.contactDepartments ?? [],
    });
  }, [settings, reset]);

  const { save, isSaving } = useSaveSettings({
    exists,
    settingsId: settings?.id,
    onSaved: refetchSettings,
  });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const { execute: deleteSettings, isLoading: isDeleting } = useApiMutation(
    "settingDetail",
  )<void, never>({
    method: "DELETE",
    invalidateRoutes: ["settings"],
    onSuccess: () => {
      toast.success("Settings deleted");
      refetchSettings();
    },
    onError: (err) => toast.error(err.message || "Failed to delete settings"),
  });

  const onSubmit = async (data: ContactFormValues) => {
    await save(selectedVersionId, (fd) => {
      fd.append("email", data.email.trim());
      fd.append("phoneNumber", data.phoneNumber.trim());
      fd.append("teamName", data.teamName.trim());
      fd.append("contactDepartments", JSON.stringify(data.contactDepartments));
    });
  };

  const handleConfirmDelete = async () => {
    if (!settings?.id) return;
    try {
      await deleteSettings(undefined, { pathParams: { id: settings.id } });
    } finally {
      setConfirmOpen(false);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-lg w-full shadow-sm">
      <div className="p-6">
        <SettingsVersionBar
          title="Contact Management"
          description="General contact info and department contacts shown for this version."
          versionOptions={versionOptions}
          selectedVersionId={selectedVersionId}
          onVersionChange={(v) => setVersion(v)}
          isArchived={isArchived}
        />
      </div>

      <Divider />

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6 space-y-6">
            {/* ── General Info ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                name="email"
                label="Email"
                type="email"
                placeholder="hello@ictmeetup.com"
                rules={{
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email",
                  },
                }}
              />
              <FormInput
                name="phoneNumber"
                label="Phone Number"
                placeholder="+977 98XXXXXXXX"
                rules={{
                  maxLength: { value: 20, message: "Max 20 characters" },
                }}
              />
              <FormInput
                name="teamName"
                label="Team Name"
                placeholder="ICT Meetup Organizing Team"
                rules={{
                  maxLength: { value: 255, message: "Max 255 characters" },
                }}
              />
            </div>

            <Divider />

            {/* ── Contact Departments ── */}
            <div className="space-y-4">
              {deptFields.length === 0 && (
                <Text size="sm" variant="muted">
                  No departments yet. Add one below.
                </Text>
              )}

              {deptFields.map((deptField, deptIndex) => (
                <DeptBlock
                  key={deptField.id}
                  control={control}
                  deptIndex={deptIndex}
                  onRemoveDept={() => removeDept(deptIndex)}
                />
              ))}

              <button
                type="button"
                onClick={() =>
                  appendDept({ department: "", contacts: [] })
                }
                className="inline-flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:border-accent hover:text-foreground transition-colors"
              >
                <Plus size={16} />
                Add department
              </button>
            </div>
          </div>

          <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-border bg-surface px-6 py-4">
            <div>
              {exists && isDraft && (
                <button
                  type="button"
                  onClick={() => setConfirmOpen(true)}
                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 size={16} />
                  Delete settings
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={isSaving || isArchived || !selectedVersionId}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                <Save size={16} />
              )}
              <span>Save</span>
            </button>
          </div>
        </form>
      </FormProvider>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete settings?"
        description="This permanently deletes this version's settings (contact, social links, and QR code). Only allowed while the version is a draft."
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

// ── Sub-component: one department block ──────────────────────────────────────

function DeptBlock({
  control,
  deptIndex,
  onRemoveDept,
}: {
  control: ReturnType<typeof useForm<ContactFormValues>>["control"];
  deptIndex: number;
  onRemoveDept: () => void;
}) {
  const {
    fields: contactFields,
    append: appendContact,
    remove: removeContact,
  } = useFieldArray({
    control,
    name: `contactDepartments.${deptIndex}.contacts`,
  });

  return (
    <div className="rounded-lg border border-border p-4 space-y-4">
      {/* Department header row */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-start">
        <FormInput
          name={`contactDepartments.${deptIndex}.department`}
          label="Department Name"
          placeholder="e.g. Events Department"
          rules={{ required: "Department name is required" }}
        />
        <button
          type="button"
          onClick={onRemoveDept}
          className="mt-7 inline-flex items-center justify-center rounded-lg p-2 text-red-500 hover:bg-red-500/10 transition-colors"
          aria-label="Remove department"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Contact persons */}
      <div className="space-y-3 pl-0">
        {contactFields.length === 0 && (
          <Text size="sm" variant="muted">
            No contacts yet. Add one below.
          </Text>
        )}

        {contactFields.map((contactField, contactIndex) => (
          <div
            key={contactField.id}
            className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 items-start"
          >
            <FormInput
              name={`contactDepartments.${deptIndex}.contacts.${contactIndex}.name`}
              label="Name"
              placeholder="Full name"
              rules={{ required: "Name is required" }}
            />
            <FormInput
              name={`contactDepartments.${deptIndex}.contacts.${contactIndex}.phone`}
              label="Phone"
              placeholder="+977 98XXXXXXXX"
              rules={{ required: "Phone is required" }}
            />
            <button
              type="button"
              onClick={() => removeContact(contactIndex)}
              className="mt-7 inline-flex items-center justify-center rounded-lg p-2 text-red-500 hover:bg-red-500/10 transition-colors"
              aria-label="Remove contact"
            >
              <X size={16} />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => appendContact({ name: "", phone: "" })}
          className="inline-flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-accent hover:text-foreground transition-colors"
        >
          <Plus size={14} />
          Add contact person
        </button>
      </div>
    </div>
  );
}
