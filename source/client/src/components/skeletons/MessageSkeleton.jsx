const MessageSkeleton = () => {
  const skeletonMessages = Array(6).fill(null);

  return (
    <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-5">
      {skeletonMessages.map((_, idx) => (
        <div
          key={idx}
          className={`flex ${idx % 2 === 0 ? "justify-start" : "justify-end"}`}
        >
          <div className={`flex max-w-[70%] items-end gap-3 ${idx % 2 === 0 ? "" : "flex-row-reverse"}`}>
            <div className="h-9 w-9 animate-pulse rounded-full bg-slate-200" />
            <div className="space-y-2">
              <div className={`h-2.5 animate-pulse rounded bg-slate-100 ${idx % 2 === 0 ? "w-16" : "ml-auto w-14"}`} />
              <div
                className={`animate-pulse rounded-[18px] bg-slate-200 ${
                  idx % 2 === 0 ? "h-16 w-[210px] rounded-bl-md" : "h-14 w-[220px] rounded-br-md"
                }`}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageSkeleton;
