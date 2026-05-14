import { cn } from "../../lib/cn";

const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  className = "",
  compact = false,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "gap-3 px-4 py-6" : "gap-4 px-6 py-10",
        className
      )}
    >
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[color:var(--surface-2)] text-[color:var(--text-muted)]">
          <Icon className="h-5 w-5" />
        </div>
      )}
      <div className="space-y-1.5">
        <h3 className="text-[16px] font-semibold leading-6 text-[color:var(--text-strong)]">
          {title}
        </h3>
        <p className="max-w-md text-[13px] leading-6 text-[color:var(--text-muted)]">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
};

export default EmptyState;
