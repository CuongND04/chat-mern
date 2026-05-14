import { MessageSquareMore } from "lucide-react";
import EmptyState from "./ui/EmptyState";

const NoChatSelected = () => {
  return (
    <div className="flex flex-1 items-center justify-center bg-[color:var(--surface-1)] p-8">
      <EmptyState
        icon={MessageSquareMore}
        title="Select a conversation"
        description="Choose a person or group from the left to continue your conversation."
      />
    </div>
  );
};

export default NoChatSelected;
