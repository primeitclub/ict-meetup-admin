import { useEffect, useMemo, useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { Plus, Save, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import FormInput from "../../components/form-field/input-field/InputController";
import { useApiMutation } from "../../lib/use-api-mutation";
import { useApiQuery } from "../../lib";
import Divider from "../../shared/design-components/divider/Divider";
import { Text } from "../../shared/design-components";
import ConfirmDialog from "../../shared/design-components/dialog/ConfirmDialog";
import { useSettingsForVersion, useSaveSettings } from "./use-settings";
import SettingsVersionBar from "./SettingsVersionBar";
import Table from "../../components/table/Table";
import TableRowActions from "../../components/table/TableRowActions";
import type { ColumnDef } from "@tanstack/react-table";
import type { Settings } from "../../types/settings";
import { ArrowLeft } from "lucide-react";

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
      contactDepartments: [],
    },
  });
  const { control, handleSubmit, reset } = methods;

  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: allSettingsData, isLoading: isLoadingAll, refetch: refetchAll } = useApiQuery("settings")<{
    data: { items: Settings[] };
  }>({
    enabled: !isFormOpen,
  });

  const tableData = allSettingsData?.data?.items ?? [];

  const columns: ColumnDef<Settings>[] = useMemo(
    () => [
      {
        id: "sn",
        header: "S.N",
        cell: ({ row }) => row.index + 1,
      },
      {
        header: "Version",
        accessorKey: "flagshipEventVersion.version_number",
        cell: ({ row }) => {
          const version = row.original.flagshipEventVersion;
          if (!version) return <span className="text-muted-foreground">—</span>;
          return (
            <div>
              {version.version_number}
              {version.is_current && (
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full ml-2" />
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => row.original.email || "—",
      },
      {
        accessorKey: "phoneNumber",
        header: "Phone",
        cell: ({ row }) => row.original.phoneNumber || "—",
      },
      {
        header: "Departments",
        cell: ({ row }) => {
          const depts = row.original.contactDepartments;
          if (!depts || depts.length === 0) return "—";
          return `${depts.length} dept${depts.length > 1 ? "s" : ""}`;
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <TableRowActions
            onEdit={() => {
              setVersion(row.original.versionId);
              setIsFormOpen(true);
            }}
          />
        ),
      },
    ],
    [setVersion]
  );

  const {
    fields: deptFields,
    append: appendDept,
    remove: removeDept,
  } = useFieldArray({ control, name: "contactDepartments" });

  // Populate the form with existing settings so the user can update them.
  useEffect(() => {
    if (settings) {
      reset({
        email: settings.email || "",
        phoneNumber: settings.phoneNumber || "",
        contactDepartments: settings.contactDepartments || [],
      });
    } else {
      reset({
        email: "",
        phoneNumber: "",
        contactDepartments: [],
      });
    }
  }, [settings, reset, selectedVersionId]);


  const { save, isSaving } = useSaveSettings({
    exists,
    settingsId: settings?.id,
    onSaved: refetchSettings,
  });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const { execute: deleteSettings, isLoading: isDeleting } = useApiMutation("settingDetail")<void, never>({
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
      fd.append("contactDepartments", JSON.stringify(data.contactDepartments));
    });

    // Clear the form inputs immediately after submit.
    reset({
      email: "",
      phoneNumber: "",
      contactDepartments: [],
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

  if (!isFormOpen) {
    return (
      <div className="space-y-6">
        <Table
          columns={columns}
          data={tableData}
          onRefetch={refetchAll}
          searchPlaceholder="Search contact management..."
          actionRight={
            <button
              onClick={() => {
                setVersion(versionOptions[0]?.value);
                setIsFormOpen(true);
              }}
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus size={16} />
              Add contact
            </button>
          }
        />
        {isLoadingAll && (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-lg w-full shadow-sm">
      <div className="p-4 border-b border-border flex items-center gap-4">
        <button
          onClick={() => setIsFormOpen(false)}
          className="p-2 hover:bg-surface-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-medium">Add/Edit Contact Management</h2>
      </div>
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
                onClick={() => appendDept({ department: "", contacts: [] })}
                className="inline-flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:border-accent hover:text-foreground transition-colors"
              >
                <Plus size={16} />
                Add department
              </button>
            </div>
          </div>

          {/* Current values (saved) */}
          <div className="mt-6">
            <Divider />
            <div className="pt-4 space-y-4">
              <Text size="sm" variant="muted">
                Current values for this version
              </Text>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg border border-border p-4 space-y-1">
                  <Text size="xs" variant="muted">
                    Email
                  </Text>
                  <Text>{settings?.email ?? "—"}</Text>
                </div>
                <div className="rounded-lg border border-border p-4 space-y-1">
                  <Text size="xs" variant="muted">
                    Phone Number
                  </Text>
                  <Text>{settings?.phoneNumber ?? "—"}</Text>
                </div>
                {/* <div className="rounded-lg border border-border p-4 space-y-1">
                  <Text size="xs" variant="muted">Team Name</Text>
                  <Text>{settings?.teamName ?? "—"}</Text>
                </div> */}
              </div>

              <div className="space-y-3">
                {(settings?.contactDepartments?.length ?? 0) === 0 ? (
                  <Text size="sm" variant="muted">
                    No departments saved yet.
                  </Text>
                ) : (
                  settings?.contactDepartments?.map((d, deptIdx) => (
                    <div
                      key={`${d.department}-${deptIdx}`}
                      className="rounded-lg border border-border p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <Text size="sm" className="font-medium">
                          {d.department}
                        </Text>
                        <Text size="xs" variant="muted">
                          {d.contacts?.length ?? 0} contacts
                        </Text>
                      </div>
                      {(d.contacts?.length ?? 0) === 0 ? (
                        <Text size="sm" variant="muted">
                          No contacts
                        </Text>
                      ) : (
                        <div className="space-y-2">
                          {d.contacts.map((c, cIdx) => (
                            <div
                              key={`${c.name}-${cIdx}`}
                              className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3"
                            >
                              <Text size="sm">{c.name}</Text>
                              <Text size="xs" variant="muted">
                                {c.phone}
                              </Text>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
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
  const { fields: contactFields, append: appendContact, remove: removeContact } = useFieldArray({
    control,
    name: `contactDepartments.${deptIndex}.contacts`,
  });

  return (
    <div className="rounded-lg border border-border p-4 space-y-4">
      {/* Department name input + remove button */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-start">
        <FormInput
          name={`contactDepartments.${deptIndex}.department`}
          label="Department / Designation"
          placeholder="e.g. Technical Committee"
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
      <div className="space-y-3">
        {contactFields.length === 0 && (
          <Text size="sm" variant="muted">
            No contacts yet. Add one below.
          </Text>
        )}

        {contactFields.map((contactField, contactIndex) => (
          <div
            key={contactField.id}
            className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 items-start bg-surface-2 rounded-lg p-3"
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
          Add contact
        </button>
      </div>
    </div>
  );
}

