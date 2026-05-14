import { useChatStore } from "../store/useChatStore";
import { useGroupStore } from "../store/useGroupStore";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import GroupChatContainer from "../components/GroupChatContainer";

const HomePage = () => {
  const { selectedUser } = useChatStore();
  const { selectedGroup } = useGroupStore();
  const hasActiveConversation = Boolean(selectedUser || selectedGroup);

  return (
    <div className="min-h-screen pt-14">
      <div className="grid h-[calc(100vh-3.5rem)] grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)]">
        <div className={`${hasActiveConversation ? "hidden lg:block" : "block"}`}>
          <div className="h-full border-r border-[color:var(--border-soft)] bg-[color:var(--surface-2)]/75">
            <Sidebar />
          </div>
        </div>

        <div className={`${hasActiveConversation ? "flex min-w-0" : "hidden lg:flex lg:min-w-0"} bg-[color:var(--surface-1)]`}>
            {!selectedUser && !selectedGroup && <NoChatSelected />}
            {selectedUser && <ChatContainer />}
            {selectedGroup && <GroupChatContainer />}
          </div>
      </div>
    </div>
  );
};

export default HomePage;
