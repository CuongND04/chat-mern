import { Settings, UsersRound, X } from "lucide-react";
import { useGroupStore } from "../store/useGroupStore";

const GroupChatHeader = ({ onOpenSettings, typingLabel }) => {
  const { selectedGroup, setSelectedGroup } = useGroupStore();

  return (
    <div className="sticky top-0 z-10 border-b border-[color:var(--border-soft)] bg-white/96 px-4 py-3 backdrop-blur-md sm:px-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[color:var(--surface-3)]">
            {selectedGroup?.groupPic ? (
              <img
                src={selectedGroup.groupPic}
                alt={selectedGroup.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <UsersRound className="h-5 w-5 text-[color:var(--text-muted)]" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-[14px] font-semibold leading-5 text-[color:var(--text-strong)]">
              {selectedGroup?.name}
            </h3>
            <p className="truncate text-[11px] font-medium text-[color:var(--text-muted)]">
              {typingLabel || `${selectedGroup?.members?.length || 0} members`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenSettings}
            className="icon-button secondary-button"
            aria-label="Group settings"
          >
            <Settings className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setSelectedGroup(null)}
            className="icon-button ghost-button lg:hidden"
            aria-label="Close group conversation"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {selectedGroup?.description && (
        <p className="mt-2 max-w-3xl text-[12px] leading-5 text-[color:var(--text-muted)]">
          {selectedGroup.description}
        </p>
      )}
    </div>
  );
};

export default GroupChatHeader;
