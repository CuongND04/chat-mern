import Panel from "../ui/Panel";

const SidebarSkeleton = () => {
  const skeletonContacts = Array(8).fill(null);

  return (
    <aside className="h-full bg-[color:var(--surface-2)] p-3">
      <Panel className="mb-3 p-3">
        <div className="space-y-3">
          <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
          <div className="h-10 w-full animate-pulse rounded-[var(--radius-md)] bg-slate-100" />
        </div>
      </Panel>

      <div className="space-y-1.5">
        {skeletonContacts.map((_, idx) => (
          <Panel key={idx} className="p-2.5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-3.5 w-28 animate-pulse rounded bg-slate-200" />
                <div className="h-3 w-16 animate-pulse rounded bg-slate-100" />
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </aside>
  );
};

export default SidebarSkeleton;
