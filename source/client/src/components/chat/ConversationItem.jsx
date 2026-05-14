import { UsersRound } from "lucide-react";
import { cn } from "../../lib/cn";

const ConversationItem = ({
  title,
  subtitle,
  meta,
  unreadCount = 0,
  active = false,
  avatar,
  isOnline = false,
  isGroup = false,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex w-full cursor-pointer items-center gap-3 rounded-[var(--radius-md)] border px-3 py-2.5 text-left transition-colors duration-200",
        active
          ? "border-[color:var(--brand-100)] bg-[color:var(--surface-selected)]"
          : "border-transparent bg-transparent hover:border-[color:var(--border-soft)] hover:bg-white/70"
      )}
    >
      <div className="relative shrink-0">
        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[color:var(--surface-3)]">
          {avatar ? (
            <img src={avatar} alt={title} className="h-full w-full object-cover" />
          ) : (
            <UsersRound className="h-4 w-4 text-[color:var(--text-muted)]" />
          )}
        </div>
        {!isGroup && (
          <span
            className={cn(
              "absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white",
              isOnline ? "bg-[color:var(--success-500)]" : "bg-[color:var(--surface-3)]"
            )}
            aria-hidden="true"
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-[13px] font-medium text-[color:var(--text-strong)]">
            {title}
          </p>
          {meta && (
            <span className="shrink-0 text-[10px] font-medium text-[color:var(--text-faint)]">
              {meta}
            </span>
          )}
        </div>
        <p className="truncate text-[11px] text-[color:var(--text-muted)]">{subtitle}</p>
      </div>

      {unreadCount > 0 && (
        <span className="inline-flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-[color:var(--brand-500)] px-1.5 text-[10px] font-semibold text-white">
          {unreadCount}
        </span>
      )}
    </button>
  );
};

export default ConversationItem;
