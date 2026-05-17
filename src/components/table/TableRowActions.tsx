import { Edit2, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

interface TableRowActionsProps {
  editHref?: string;
  onDelete?: () => void;
}

const TableRowActions = ({ editHref, onDelete }: TableRowActionsProps) => (
  <div className="flex items-center space-x-2">
    {editHref && (
      <Link
        to={editHref}
        className="p-2 text-[#E6E6E6] hover:text-white hover:bg-gray-800 rounded-lg transition-all"
        title="Edit"
      >
        <Edit2 size={24} />
      </Link>
    )}
    {onDelete && (
      <button
        onClick={onDelete}
        className="p-2 text-[#EF4444] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
        title="Delete"
      >
        <Trash2 size={24} />
      </button>
    )}
  </div>
);

export default TableRowActions;
