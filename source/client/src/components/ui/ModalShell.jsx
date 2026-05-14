import { X } from "lucide-react";
import Panel from "./Panel";
import { cn } from "../../lib/cn";

const ModalShell = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  children,
  footer,
  className = "",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-end justify-center bg-[color:var(--overlay)] p-3 backdrop-blur-sm sm:items-center sm:p-6">
      <Panel
        elevated
        className={cn(
          "flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-[var(--radius-xl)]",
          className
        )}
      >
        <div className="flex items-start justify-between border-b border-[color:var(--border-soft)] px-5 py-4 sm:px-6">
          <div className="flex min-w-0 items-start gap-3">
            {Icon && (
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--surface-2)] text-[color:var(--text-muted)]">
                <Icon className="h-4 w-4" />
              </div>
            )}
            <div className="min-w-0">
              <h2 className="text-[17px] font-semibold leading-6 text-[color:var(--text-strong)]">
                {title}
              </h2>
              {subtitle && (
                <p className="mt-1 text-[13px] leading-6 text-[color:var(--text-muted)]">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="icon-button ghost-button"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="scrollbar-subtle flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {children}
        </div>

        {footer && (
          <div className="border-t border-[color:var(--border-soft)] px-5 py-4 sm:px-6">
            {footer}
          </div>
        )}
      </Panel>
    </div>
  );
};

export default ModalShell;
