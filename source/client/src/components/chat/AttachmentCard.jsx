import { Download, FileText } from "lucide-react";
import { cn } from "../../lib/cn";
import { formatFileSize } from "../../lib/utils";

const AttachmentCard = ({ file, onDownload, compact = false }) => {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-[var(--radius-md)] border border-[color:var(--border-soft)] bg-[color:var(--surface-1)]",
        compact ? "p-2.5" : "p-3"
      )}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-[color:var(--surface-2)] text-[color:var(--brand-500)]">
        <FileText className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12px] font-medium text-[color:var(--text-strong)]">
          {file.name}
        </p>
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[color:var(--text-muted)]">
          {file.type || "File"} {file.size ? `• ${formatFileSize(file.size)}` : ""}
        </p>
      </div>
      <button
        type="button"
        onClick={onDownload}
        className="icon-button secondary-button"
        aria-label={`Download ${file.name}`}
      >
        <Download className="h-4 w-4" />
      </button>
    </div>
  );
};

export default AttachmentCard;
