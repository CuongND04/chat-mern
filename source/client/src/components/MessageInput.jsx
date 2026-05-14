import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useGroupStore } from "../store/useGroupStore";
import { useAuthStore } from "../store/useAuthStore";
import { Image, Paperclip, Send, Smile, X } from "lucide-react";
import toast from "react-hot-toast";
import AttachmentCard from "./chat/AttachmentCard";

const MessageInput = ({ onSendMessage }) => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const emojiPickerRef = useRef(null);

  const { sendMessage, selectedUser } = useChatStore();
  const { selectedGroup } = useGroupStore();
  const { socket } = useAuthStore();

  const emojis = [
    "😀", "😄", "🙂", "😉", "😍", "😘", "🤔", "😴", "😎", "🥳",
    "😭", "😡", "👍", "👎", "👏", "🙏", "❤️", "🔥", "✨", "🎉",
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTyping && socket) {
        if (selectedUser) {
          socket.emit("stop-typing", { receiverId: selectedUser._id });
        } else if (selectedGroup) {
          socket.emit("groupTyping", {
            groupId: selectedGroup._id,
            isTyping: false,
          });
        }
      }
    };
  }, [selectedUser, selectedGroup, isTyping, socket]);

  const emitTyping = (isNowTyping, currentValue) => {
    if (!socket) return;

    if (!isTyping && isNowTyping && currentValue.trim()) {
      setIsTyping(true);
      if (selectedUser) {
        socket.emit("typing", { receiverId: selectedUser._id });
      } else if (selectedGroup) {
        socket.emit("groupTyping", { groupId: selectedGroup._id, isTyping: true });
      }
    }

    clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (selectedUser) {
        socket.emit("stop-typing", { receiverId: selectedUser._id });
      } else if (selectedGroup) {
        socket.emit("groupTyping", { groupId: selectedGroup._id, isTyping: false });
      }
    }, 2000);
  };

  const handleInputChange = (e) => {
    const nextValue = e.target.value;
    setText(nextValue);
    emitTyping(true, nextValue);
  };

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File size must be less than 10MB");
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/zip",
      "text/plain",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Unsupported file. Please upload PDF, DOC, DOCX, XLS, XLSX, ZIP, or TXT");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview({
        base64: reader.result,
        name: file.name,
        size: file.size,
        type: file.type,
        url: "",
      });
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const removeFile = () => {
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview && !filePreview) return;

    if (isTyping && socket) {
      clearTimeout(typingTimeoutRef.current);
      setIsTyping(false);
      if (selectedUser) {
        socket.emit("stop-typing", { receiverId: selectedUser._id });
      } else if (selectedGroup) {
        socket.emit("groupTyping", { groupId: selectedGroup._id, isTyping: false });
      }
    }

    try {
      const messageData = {
        text: text.trim(),
        image: imagePreview,
        file: filePreview,
      };

      if (onSendMessage) {
        await onSendMessage(messageData);
      } else {
        await sendMessage(messageData);
      }

      setText("");
      setImagePreview(null);
      setFilePreview(null);
      setShowEmojiPicker(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="sticky bottom-0 border-t border-[color:var(--border-soft)] bg-white/96 px-4 py-3 backdrop-blur-md sm:px-5">
      {(imagePreview || filePreview) && (
        <div className="mb-3 flex flex-wrap gap-3">
          {imagePreview && (
            <div className="relative overflow-hidden rounded-[var(--radius-md)] border border-[color:var(--border-soft)] bg-[color:var(--surface-1)] p-2 shadow-[var(--shadow-sm)]">
              <img src={imagePreview} alt="Preview" className="h-20 w-20 rounded-[12px] object-cover" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[color:var(--text-strong)] shadow-[var(--shadow-sm)]"
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {filePreview && (
            <div className="relative min-w-[240px] max-w-sm">
              <AttachmentCard file={filePreview} onDownload={() => {}} />
              <button
                type="button"
                onClick={removeFile}
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-[color:var(--text-strong)] shadow-[var(--shadow-sm)]"
                aria-label="Remove file"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}

      <form
        onSubmit={handleSendMessage}
        className="relative flex items-end gap-1.5 rounded-[var(--radius-lg)] border border-[color:var(--border-soft)] bg-[color:var(--surface-1)] p-1.5"
      >
        <div className="relative" ref={emojiPickerRef}>
          <button
            type="button"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className={`icon-button ${showEmojiPicker ? "bg-[color:var(--brand-50)] text-[color:var(--brand-500)]" : "subtle-button"}`}
            aria-label="Open emoji picker"
          >
            <Smile className="h-4 w-4" />
          </button>

          {showEmojiPicker && (
            <div className="absolute bottom-full left-0 mb-3 w-[280px] rounded-[var(--radius-lg)] border border-[color:var(--border-soft)] bg-white p-3 shadow-[var(--shadow-lg)]">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--text-muted)]">
                Quick reactions
              </p>
              <div className="grid grid-cols-5 gap-2">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      setText((prev) => prev + emoji);
                      setShowEmojiPicker(false);
                    }}
                    className="flex h-11 w-11 items-center justify-center rounded-[12px] text-xl transition hover:bg-[color:var(--surface-2)]"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

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

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`icon-button ${filePreview ? "bg-[color:var(--brand-50)] text-[color:var(--brand-500)]" : "subtle-button"}`}
          aria-label="Attach file"
        >
          <Paperclip className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          className={`icon-button ${imagePreview ? "bg-[color:var(--brand-50)] text-[color:var(--brand-500)]" : "subtle-button"}`}
          aria-label="Attach image"
        >
          <Image className="h-4 w-4" />
        </button>

        <textarea
          rows={1}
          placeholder="Write a message"
          value={text}
          onChange={handleInputChange}
          className="max-h-32 min-h-[38px] flex-1 resize-none bg-transparent px-2 py-2 text-[13px] leading-6 text-[color:var(--text-strong)] outline-none placeholder:text-[color:var(--text-faint)]"
        />

        <button
          type="submit"
          disabled={!text.trim() && !imagePreview && !filePreview}
          className="primary-button h-9 min-w-9 rounded-[10px] px-3 disabled:cursor-not-allowed disabled:opacity-45"
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
