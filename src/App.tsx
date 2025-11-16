import "./App.css";
import { allMessages, type ChatMessage } from "./utils";
import React from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

const dbMessages = allMessages;
const LATEST_MESSAGES_COUNT = 100;

function App() {
  const [messages, setMessages] = React.useState<ChatMessage[]>(
    dbMessages.slice(dbMessages.length - LATEST_MESSAGES_COUNT)
  );
  const [isFetching, setIsFetching] = React.useState(false);
  const [hasNextPage, setHasNextPage] = React.useState(
    messages.length < dbMessages.length
  );

  const fetchMoreMessages = React.useCallback(() => {
    if (isFetching) return;

    setIsFetching(true);

    setTimeout(() => {
      const currentOldestMessage = messages[0];
      const oldestMessageIndex = dbMessages.findIndex(
        (msg) => msg.id === currentOldestMessage.id
      );

      const newOldestIndex = Math.max(0, oldestMessageIndex - 100);
      const newMessages = dbMessages.slice(newOldestIndex, oldestMessageIndex);

      setMessages((prev) => [...newMessages, ...prev]);

      if (newOldestIndex === 0) {
        setHasNextPage(false);
      }

      setIsFetching(false);
    }, 1000);
  }, [isFetching, messages]);

  const parentRef = React.useRef<HTMLDivElement>(null);
  const hasScrolledRef = React.useRef(false);

  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? messages.length + 1 : messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 88,
    measureElement: (element) => element.getBoundingClientRect().height,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  // Trigger fetch when scrolling to top
  React.useEffect(() => {
    const [firstItem] = virtualItems;

    if (!firstItem) return;

    if (firstItem.index === 0 && hasNextPage && !isFetching) {
      fetchMoreMessages();
    }
  }, [virtualItems, hasNextPage, isFetching, fetchMoreMessages]);

  // Auto-scroll to bottom on initial load
  React.useEffect(() => {
    if (virtualItems.length > 0 && !hasScrolledRef.current) {
      // Scroll to the last message (not the loader)
      const lastMessageIndex = hasNextPage ? messages.length : messages.length - 1;
      rowVirtualizer.scrollToIndex(lastMessageIndex, { align: "end" });
      hasScrolledRef.current = true;
    }
  }, [virtualItems, rowVirtualizer, messages.length, hasNextPage]);

  return (
    <div>
      <h1>Livestream Chat Feed</h1>
      <div ref={parentRef} className="chat-container">
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {virtualItems.map((virtualItem) => {
            const isLoaderRow = virtualItem.index === 0 && hasNextPage;
            
            const messageIndex = hasNextPage 
              ? virtualItem.index - 1 
              : virtualItem.index;
            
            const message = messages[messageIndex];

            return (
              <div
                key={isLoaderRow ? "loader" : message?.id || virtualItem.index}
                data-index={virtualItem.index}
                ref={rowVirtualizer.measureElement}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                {isLoaderRow ? (
                  <div className="chat-bubble" style={{ textAlign: "center" }}>
                    <strong>Loading older messages...</strong>
                  </div>
                ) : message ? (
                  <div className="chat-bubble">
                    <strong>{message.author}:</strong>
                    <p>{message.message}</p>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default App;