import { useRef, useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  const { sendMessage, selectedUser } = useChatStore();
  const { socket } = useAuthStore();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ✅ THÊM: Xử lý typing indicator
  const handleInputChange = (e) => {
    setText(e.target.value);

    if (!socket || !selectedUser) return;

    // Emit "typing" event nếu chưa typing
    if (!isTyping && e.target.value.trim()) {
      setIsTyping(true);
      socket.emit("typing", { receiverId: selectedUser._id });
    }

    // Clear timeout cũ và tạo timeout mới
    clearTimeout(typingTimeoutRef.current);
    
    // Emit "stop-typing" sau 2 giây không gõ
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit("stop-typing", { receiverId: selectedUser._id });
    }, 2000);
  };

  // ✅ THÊM: Cleanup khi unmount hoặc chuyển chat
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTyping && socket && selectedUser) {
        socket.emit("stop-typing", { receiverId: selectedUser._id });
      }
    };
  }, [selectedUser, isTyping, socket]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    // ✅ THÊM: Emit stop-typing khi gửi tin nhắn
    if (isTyping && socket && selectedUser) {
      clearTimeout(typingTimeoutRef.current);
      setIsTyping(false);
      socket.emit("stop-typing", { receiverId: selectedUser._id });
    }

    try {
      await sendMessage({ text: text.trim(), image: imagePreview });
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="p-4 w-full bg-[#FDFCF5] border-t-4 border-black">
      {/* Image Preview */}
      {imagePreview && (
        <div className="mb-3 flex items-center gap-3">
          <div
            className="
              relative border-2 border-black rounded-lg shadow-[3px_3px_0_#000]
              overflow-hidden bg-white
            "
          >
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover"
            />
            <button
              onClick={removeImage}
              type="button"
              className="
                absolute -top-2 -right-2 w-6 h-6 bg-red-400 border-2 border-black
                rounded-full flex items-center justify-center 
                hover:translate-y-[1px] hover:shadow-none transition-all
                shadow-[2px_2px_0_#000]
              "
            >
              <X size={14} className="text-black" />
            </button>
          </div>
        </div>
      )}

      {/* Input form */}
      <form
        onSubmit={handleSendMessage}
        className="
          flex items-center gap-3 bg-white border-4 border-black rounded-lg 
          px-3 py-2 shadow-[4px_4px_0_#000] 
          focus-within:translate-y-[2px] focus-within:shadow-none transition-all
        "
      >
        <input
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={handleInputChange}
          className="
            flex-1 bg-transparent outline-none text-black placeholder-gray-500
            font-medium
          "
        />

        {/* Hidden image input */}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleImageChange}
        />

        {/* Image Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`
            w-10 h-10 flex items-center justify-center rounded-md border-2 border-black 
            bg-[#FFF2AC] shadow-[2px_2px_0_#000] transition-all 
            hover:translate-y-[1px] hover:shadow-none
            ${imagePreview ? "bg-[#B9E6C9]" : ""}
          `}
        >
          <Image size={20} />
        </button>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!text.trim() && !imagePreview}
          className="
            w-10 h-10 flex items-center justify-center rounded-md border-2 border-black 
            bg-[#74C0FC] shadow-[2px_2px_0_#000] 
            hover:translate-y-[1px] hover:shadow-none transition-all
            disabled:opacity-60 disabled:cursor-not-allowed
          "
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;