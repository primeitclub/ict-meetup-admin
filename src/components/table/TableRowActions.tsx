import { Edit2, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import Tooltip from "../../shared/design-components/tooltip/Tooltip";

interface TableRowActionsProps {
  editHref?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

const TableRowActions = ({ editHref, onEdit, onDelete }: TableRowActionsProps) => (
  <div className="flex items-center space-x-2">
    {(editHref || onEdit) && (
      <Tooltip content="Edit">
        {editHref ? (
          <Link
            to={editHref}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-foreground/10 rounded-lg transition-all"
          >
            <Edit2 size={16} />
          </Link>
        ) : (
          <button
            onClick={onEdit}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-foreground/10 rounded-lg transition-all"
          >
            <Edit2 size={16} />
          </button>
        )}
      </Tooltip>
    )}
    {onDelete && (
      <Tooltip content="Delete">
        <button
          onClick={onDelete}
          className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
        >
          <Trash2 size={16} />
        </button>
      </Tooltip>
    )}
  </div>
);

export default TableRowActions;
