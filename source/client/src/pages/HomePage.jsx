import { useChatStore } from "../store/useChatStore";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

const HomePage = () => {
  const { selectedUser } = useChatStore();

  return (
    <div
      className="
        w-screen h-screen bg-[#FDFCF5] 
        flex items-center justify-center p-4 
        pt-20  /*  thêm khoảng tránh Navbar fixed */
      "
    >
      <div
        className="
          flex w-full max-w-6xl h-[85vh] 
          bg-white border-4 border-black rounded-xl overflow-hidden 
          shadow-[6px_6px_0_#000]
        "
      >
        <Sidebar />
        {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
      </div>
    </div>
  );
};

export default HomePage;
