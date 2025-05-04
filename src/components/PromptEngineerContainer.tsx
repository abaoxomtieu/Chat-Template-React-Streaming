import React, { useState, useRef, useEffect } from "react";
import { Avatar, Input } from "antd";
import {
  SendOutlined,
  DeleteOutlined,
  RobotOutlined,
} from "@ant-design/icons";
import {
  ChatMessage as ChatMessageType,
  PrimaryChatPayload,
} from "../services/chatService";
import ChatMessage from "./ChatMessage";
import ReactMarkdown from "react-markdown";
import { sendPromptEngineerMessage } from "../services/promptEngineerService";

const { TextArea } = Input;
const CHAT_HISTORY_KEY = "prompt_engineer_history";

const PromptEngineerContainer: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>(() => {
    // Load chat history from localStorage on initial render
    const savedMessages = localStorage.getItem(CHAT_HISTORY_KEY);
    if (savedMessages) {
      try {
        return JSON.parse(savedMessages);
      } catch (error) {
        console.error("Failed to parse saved messages:", error);
        return [];
      }
    }
    return [];
  });
  
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  const handleStreamingChat = async (payload: PrimaryChatPayload) => {
    try {
      setStreamingMessage("");
      await sendPromptEngineerMessage(
        payload,
        (message: string) => {
          setStreamingMessage(message);
        },
        (finalData: { final_response: string }) => {
          setStreamingMessage("");
          if (typeof finalData === "object" && "final_response" in finalData) {
            const aiMessage: ChatMessageType = {
              content: finalData.final_response,
              type: "ai",
            };
            setMessages((prev) => [...prev, aiMessage]);
            setLoading(false);
          }
        },
        (error: string) => {
          console.error("Error in streaming chat:", error);
          setLoading(false);
          setStreamingMessage("");
          // Add error message to chat
          const errorMessage: ChatMessageType = {
            content: `Error: ${error}`,
            type: "ai",
          };
          setMessages((prev) => [...prev, errorMessage]);
        }
      );
    } catch (error) {
      console.error("Error in streaming chat:", error);
      setLoading(false);
      setStreamingMessage("");
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    // Add user message to chat
    const userMessage: ChatMessageType = {
      content: input,
      type: "human",
    };
    setMessages((prev) => [...prev, userMessage]);

    // Clear input and set loading state
    setInput("");
    setLoading(true);

    // Create payload for API
    const payload: PrimaryChatPayload = {
      query: userMessage.content,
      history: messages,
    };

    // Send message to API
    await handleStreamingChat(payload);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem(CHAT_HISTORY_KEY);
  };

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex-none bg-white/80 backdrop-blur-sm py-4 border-b border-purple-100">
          <div className="max-w-3xl mx-auto px-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Prompt Engineer Assistant
                </h1>
                <p className="text-sm text-gray-600">
                  Create and refine prompts for various AI applications
                </p>
              </div>
              <button
                onClick={clearHistory}
                className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-150"
              >
                <DeleteOutlined className="text-sm" />
                <span>Clear History</span>
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Chat Messages */}
        <div className="flex-1 overflow-y-auto custom-scrollbar py-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
            {/* Streaming message with same styling as ChatMessage */}
            {streamingMessage && (
              <div className="flex justify-center">
                <div className="py-4 w-2/3 rounded-2xl bg-gray-100">
                  <div className="max-w-3xl mx-auto flex gap-4 px-4">
                    <Avatar
                      icon={<RobotOutlined />}
                      className="bg-blue-500 text-white"
                      size={32}
                    />
                    <div className="flex-1 text-gray-800 text-sm leading-relaxed">
                      <div className="w-full">
                        <ReactMarkdown>
                          {streamingMessage.replace(/\n/g, "  \n")}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {loading && (
              <div className="flex justify-center my-6">
                <div className="flex items-center space-x-3 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-purple-100">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 animate-pulse" />
                  <div className="text-gray-600 font-medium">
                    AI is thinking
                  </div>
                  <div className="flex space-x-1">
                    {[0, 1, 2].map((dot) => (
                      <div
                        key={dot}
                        className="h-2 w-2 bg-purple-600 rounded-full animate-bounce"
                        style={{
                          animationDelay: `${dot * 0.2}s`,
                          animationDuration: "1s",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="flex-none border-t border-purple-100 bg-white/80 backdrop-blur-sm py-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 bg-white rounded-2xl shadow-sm border border-purple-100 p-2">
              <TextArea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe the prompt you want to create..."
                autoSize={{ minRows: 1, maxRows: 4 }}
                className="flex-1 focus:ring-0"
                style={{
                  borderRadius: "12px",
                  resize: "none",
                  padding: "12px 16px",
                  fontSize: "14px",
                  backgroundColor: "#ffffff",
                  color: "#1f2937",
                  border: "none",
                  boxShadow: "none",
                }}
              />
              <button
                onClick={handleSend}
                disabled={loading}
                className={`rounded-xl h-10 w-10 flex items-center justify-center transition-all duration-150 ${
                  loading
                    ? "bg-gray-100 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                }`}
              >
                <SendOutlined className="text-white text-lg" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PromptEngineerContainer;
