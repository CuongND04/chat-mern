import { useRef, useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Image, Send, X, Paperclip, File, Smile } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); // ✅ THÊM
  const [isTyping, setIsTyping] = useState(false);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const emojiPickerRef = useRef(null); // ✅ THÊM
  
  const { sendMessage, selectedUser } = useChatStore();
  const { socket } = useAuthStore();

  // ✅ THÊM: Danh sách emoji phổ biến
  const emojis = [
    "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃",
    "😉", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗", "😚", "😙",
    "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤫", "🤔",
    "🤐", "🤨", "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "🤥",
    "😌", "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢", "🤮",
    "🤧", "🥵", "🥶", "😶‍🌫️", "😵", "🤯", "🤠", "🥳", "😎", "🤓",
    "🧐", "😕", "😟", "🙁", "☹️", "😮", "😯", "😲", "😳", "🥺",
    "😦", "😧", "😨", "😰", "😥", "😢", "😭", "😱", "😖", "😣",
    "😞", "😓", "😩", "😫", "🥱", "😤", "😡", "😠", "🤬", "👍",
    "👎", "👊", "✊", "🤛", "🤜", "🤞", "✌️", "🤟", "🤘", "👌",
    "🤏", "👈", "👉", "👆", "👇", "☝️", "✋", "🤚", "🖐️", "🖖",
    "👋", "🤙", "💪", "🦾", "🖕", "✍️", "🙏", "🦶", "🦵", "❤️",
    "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️",
    "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟", "🔥", "✨",
    "⭐", "🌟", "💫", "💥", "💯", "🎉", "🎊", "🎈", "🎁", "🏆"
  ];

  // ✅ THÊM: Đóng emoji picker khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  // ✅ THÊM: Thêm emoji vào text
  const handleEmojiClick = (emoji) => {
    setText(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  // Xử lý chọn ảnh
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

  // ✅ THÊM: Xử lý chọn file
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Kiểm tra kích thước file (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error("File size must be less than 10MB");
      return;
    }

    // Kiểm tra loại file cho phép
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/zip',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("File type not supported. Please upload PDF, DOC, DOCX, XLS, XLSX, ZIP, or TXT");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview({
        base64: reader.result,
        name: file.name,
        size: file.size,
        type: file.type
      });
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  // ✅ THÊM: Xóa file preview
  const removeFile = () => {
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleInputChange = (e) => {
    setText(e.target.value);

    if (!socket || !selectedUser) return;

    if (!isTyping && e.target.value.trim()) {
      setIsTyping(true);
      socket.emit("typing", { receiverId: selectedUser._id });
    }

    clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit("stop-typing", { receiverId: selectedUser._id });
    }, 2000);
  };

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
    if (!text.trim() && !imagePreview && !filePreview) return;

    if (isTyping && socket && selectedUser) {
      clearTimeout(typingTimeoutRef.current);
      setIsTyping(false);
      socket.emit("stop-typing", { receiverId: selectedUser._id });
    }

    try {
      await sendMessage({ 
        text: text.trim(), 
        image: imagePreview,
        file: filePreview // ✅ THÊM
      });
      setText("");
      setImagePreview(null);
      setFilePreview(null); // ✅ THÊM
      if (imageInputRef.current) imageInputRef.current.value = "";
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
          <div className="relative border-2 border-black rounded-lg shadow-[3px_3px_0_#000] overflow-hidden bg-white">
            <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover" />
            <button
              onClick={removeImage}
              type="button"
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-400 border-2 border-black rounded-full flex items-center justify-center hover:translate-y-[1px] hover:shadow-none transition-all shadow-[2px_2px_0_#000]"
            >
              <X size={14} className="text-black" />
            </button>
          </div>
        </div>
      )}

      {/* ✅ THÊM: File Preview */}
      {filePreview && (
        <div className="mb-3 flex items-center gap-3">
          <div className="relative border-2 border-black rounded-lg shadow-[3px_3px_0_#000] bg-white p-3 flex items-center gap-3 pr-10">
            <div className="w-10 h-10 bg-[#FFD43B] border-2 border-black rounded flex items-center justify-center">
              <File size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{filePreview.name}</p>
              <p className="text-xs text-gray-500">{formatFileSize(filePreview.size)}</p>
            </div>
            <button
              onClick={removeFile}
              type="button"
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-400 border-2 border-black rounded-full flex items-center justify-center hover:translate-y-[1px] hover:shadow-none transition-all shadow-[2px_2px_0_#000]"
            >
              <X size={14} className="text-black" />
            </button>
          </div>
        </div>
      )}

      {/* Input form */}
      <form onSubmit={handleSendMessage} className="flex items-center gap-3 bg-white border-4 border-black rounded-lg px-3 py-2 shadow-[4px_4px_0_#000] focus-within:translate-y-[2px] focus-within:shadow-none transition-all relative">
        <input
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={handleInputChange}
          className="flex-1 bg-transparent outline-none text-black placeholder-gray-500 font-medium"
        />

        {/* Hidden inputs */}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={imageInputRef}
          onChange={handleImageChange}
        />
        <input
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.txt"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />

        {/* ✅ THÊM: Emoji Picker Popup */}
        {showEmojiPicker && (
          <div
            ref={emojiPickerRef}
            className="absolute bottom-full left-0 mb-2 w-96 h-72 bg-white border-4 border-black rounded-lg shadow-[4px_4px_0_#000] overflow-hidden z-50"
          >
            <div className="p-3 border-b-2 border-black bg-[#FFF2AC]">
              <p className="font-bold text-sm">Select Emoji</p>
            </div>
            <div className="grid grid-cols-10 gap-2 p-4 overflow-y-auto h-56">
              {emojis.map((emoji, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleEmojiClick(emoji)}
                  className="text-2xl hover:bg-[#FFF2AC] rounded-md p-2 transition-all border-2 border-transparent hover:border-black hover:scale-110 flex items-center justify-center w-10 h-10"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ✅ THÊM: Emoji Button */}
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className={`w-10 h-10 flex items-center justify-center rounded-md border-2 border-black bg-[#FFE066] shadow-[2px_2px_0_#000] transition-all hover:translate-y-[1px] hover:shadow-none ${showEmojiPicker ? "bg-[#B9E6C9]" : ""}`}
        >
          <Smile size={20} />
        </button>

        {/* File Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`w-10 h-10 flex items-center justify-center rounded-md border-2 border-black bg-[#FFD43B] shadow-[2px_2px_0_#000] transition-all hover:translate-y-[1px] hover:shadow-none ${filePreview ? "bg-[#B9E6C9]" : ""}`}
        >
          <Paperclip size={20} />
        </button>

        {/* Image Button */}
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          className={`w-10 h-10 flex items-center justify-center rounded-md border-2 border-black bg-[#FFF2AC] shadow-[2px_2px_0_#000] transition-all hover:translate-y-[1px] hover:shadow-none ${imagePreview ? "bg-[#B9E6C9]" : ""}`}
        >
          <Image size={20} />
        </button>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!text.trim() && !imagePreview && !filePreview}
          className="w-10 h-10 flex items-center justify-center rounded-md border-2 border-black bg-[#74C0FC] shadow-[2px_2px_0_#000] hover:translate-y-[1px] hover:shadow-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;