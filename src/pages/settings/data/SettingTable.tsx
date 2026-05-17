import type { ColumnDef } from "@tanstack/react-table";
import Table from "../../../components/table/Table";

type Props<TData> = {
  title: string;
  description: string;
  buttonText: string;
  columns: ColumnDef<TData>[];
  data: TData[];
  searchPlaceholder: string;
  onAdd: () => void;
};

export default function SettingsTable<TData>({
  title,
  description,
  buttonText,
  columns,
  data,
  searchPlaceholder,
  onAdd,
}: Props<TData>) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="text-gray-400 text-sm mt-1">{description}</p>
        </div>

        <button
          onClick={onAdd}
          className="bg-admin-secondary hover:bg-admin-secondary/80 text-white px-4 py-2 rounded-md transition-colors font-medium"
        >
          {buttonText}
        </button>
      </div>

      <Table
        columns={columns}
        data={data}
        searchPlaceholder={searchPlaceholder}
      />
    </div>
  );
}