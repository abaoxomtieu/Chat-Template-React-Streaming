import React, { useEffect, useState, useRef } from "react";
import { Button, Avatar } from "antd";
import { RobotOutlined } from "@ant-design/icons";
import ReactMarkdown from "react-markdown";
import CombatMessage, { StructuredMessage } from "./CombatMessage";

interface CombatChatMessagesProps {
  messages: StructuredMessage[];
  streamingMessage: string;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  agent_ask: "left" | "right";
}

const CombatChatMessages: React.FC<CombatChatMessagesProps> = ({
  messages,
  streamingMessage,
  messagesEndRef,
  agent_ask,
}) => {
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Check if user is at the bottom of the scroll container
  const checkIfAtBottom = () => {
    const container = scrollContainerRef.current;
    if (!container) return true;

    const threshold = 50; // 50px threshold for "near bottom"
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <=
      threshold;

    setIsAtBottom(isNearBottom);
    setShowScrollButton(!isNearBottom && messages.length > 0);

    return isNearBottom;
  };

  // Smooth scroll to bottom
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      setIsAtBottom(true);
      setShowScrollButton(false);
    }
  };

  // Handle scroll events
  const handleScroll = () => {
    checkIfAtBottom();
  };

  // Auto-scroll only when user is at bottom
  useEffect(() => {
    if (isAtBottom) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [messages, streamingMessage]);

  // Initial check and scroll event listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Add scroll event listener
    container.addEventListener("scroll", handleScroll, { passive: true });

    // Initial check
    setTimeout(() => {
      checkIfAtBottom();
    }, 100);

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [messages.length]);

  // Track which bot is speaking based on the message sequence
  const getMessageBot = (index: number) => {
    // For the first message, it's always from the agent_ask bot
    if (index === 0) {
      return agent_ask;
    }

    const isEvenIndex = index % 2 === 0;

    if (isEvenIndex) {
      // Even indices (0, 2, 4, ...) are from the starting bot
      return agent_ask;
    } else {
      // Odd indices (1, 3, 5, ...) are from the other bot
      return agent_ask === "left" ? "right" : "left";
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col">
      {/* Scrollable container */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-4"
        style={{
          scrollBehavior: "smooth",
          maxHeight: "100%",
        }}
      >
        <div className="max-w-4xl mx-auto space-y-2">
          {messages.map((msg: StructuredMessage, index: number) => {
            const botSide = getMessageBot(index);
            const isLeftBot = botSide === "left";

            // Debug logging
            console.log(`Message ${index}:`, {
              role: msg.role,
              type: msg.type,
              botSide,
              isLeftBot,
              agent_ask,
              content: msg.displayContent?.substring(0, 50) + "...",
            });

            return (
              <CombatMessage key={index} message={msg} isLeftBot={isLeftBot} />
            );
          })}

          {/* Streaming Message */}
          {streamingMessage && (
            <div className="flex justify-center mb-4">
              <div className="py-4 w-2/3 rounded-2xl backdrop-blur-sm bg-gradient-to-r from-purple-900/80 to-indigo-900/80 border-l-4 border-yellow-400 animate-pulse">
                <div className="max-w-3xl mx-auto flex gap-4 px-4">
                  <div className="flex flex-col items-center">
                    <Avatar
                      icon={<RobotOutlined />}
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg"
                      size={40}
                    />
                    <span className="text-xs text-gray-300 mt-1 font-semibold">
                      ⚡ Thinking...
                    </span>
                  </div>
                  <div className="flex-1 text-white text-sm leading-relaxed">
                    <div className="w-full">
                      <ReactMarkdown>{streamingMessage}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <div className="absolute bottom-6 right-6 z-50">
          <Button
            type="primary"
            shape="circle"
            size="large"
            onClick={scrollToBottom}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 border-2 border-yellow-400 shadow-2xl animate-bounce"
            style={{
              width: "50px",
              height: "50px",
              boxShadow: "0 0 20px rgba(255, 193, 7, 0.5)",
            }}
          >
            <span className="text-white text-lg font-bold">↓</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default CombatChatMessages;
