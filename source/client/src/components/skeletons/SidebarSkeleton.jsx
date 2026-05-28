import { Users } from "lucide-react";

const SidebarSkeleton = () => {
  const skeletonContacts = Array(8).fill(null);

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-gray-200 bg-white flex flex-col transition-all duration-200">
      {/* Header */}
      <div className="border-b border-gray-200 w-full p-5">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gray-200 animate-pulse flex items-center justify-center">
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          <span className="font-semibold text-gray-900 hidden lg:block">
            Contacts
          </span>
        </div>

        {/* Skeleton filter toggle */}
        <div className="mt-4 hidden lg:flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-11 h-6 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="h-4 w-28 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Skeleton Contacts */}
      <div className="overflow-y-auto w-full py-2">
        {skeletonContacts.map((_, idx) => (
          <div
            key={idx}
            className="w-full p-3 flex items-center gap-3"
            style={{ animationDelay: `${idx * 0.05}s` }}
          >
            {/* Avatar skeleton */}
            <div className="relative mx-auto lg:mx-0">
              <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
            </div>

            {/* User info skeleton - only visible on larger screens */}
            <div className="hidden lg:block text-left min-w-0 flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default SidebarSkeleton;
