import { CheckCheck } from "lucide-react";
import { cn } from "../../lib/cn";
import { formatMessageTime } from "../../lib/utils";
import AttachmentCard from "./AttachmentCard";

const MessageBubble = ({
  message,
  isOwn,
  avatar,
  senderName,
  showSender = false,
  showAvatar = true,
  showSeen = false,
  seenLabel,
  onDownload,
}) => {
  return (
    <div className={cn("flex w-full", isOwn ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "flex w-full max-w-[min(70%,46rem)] items-end gap-3",
          isOwn ? "flex-row-reverse" : ""
        )}
      >
        <div className={cn("h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[color:var(--surface-2)]", !showAvatar && "opacity-0")}>
          <img src={avatar} alt={senderName || "avatar"} className="h-full w-full object-cover" />
        </div>

        <div className={cn("min-w-0", isOwn ? "items-end" : "items-start")}>
          {showSender && (
            <p className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[color:var(--text-faint)]">
              {senderName}
            </p>
          )}

          <div
            className={cn(
              "rounded-[16px] border px-3 py-2.5",
              isOwn
                ? "rounded-br-md border-[color:var(--brand-100)] bg-[color:var(--brand-50)]"
                : "rounded-bl-md border-[color:var(--border-soft)] bg-[color:var(--surface-2)]"
            )}
          >
            {message.image && (
              <img
                src={message.image}
                alt="Attachment"
                className="mb-3 max-h-80 w-full rounded-[14px] object-contain"
                loading="lazy"
              />
            )}

            {message.file && (
              <div className="mb-3">
                <AttachmentCard file={message.file} onDownload={onDownload} compact />
              </div>
            )}

            {message.text && (
              <p className="whitespace-pre-wrap break-words text-[13px] leading-6 text-[color:var(--text-strong)]">
                {message.text}
              </p>
            )}
          </div>

          <div
            className={cn(
              "mt-1.5 flex items-center gap-1.5 px-1 text-[10px] font-medium text-[color:var(--text-faint)]",
              isOwn ? "justify-end" : "justify-start"
            )}
          >
            <span>{formatMessageTime(message.createdAt)}</span>
            {showSeen && seenLabel && (
              <>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <CheckCheck className="h-3.5 w-3.5" />
                  {seenLabel}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
