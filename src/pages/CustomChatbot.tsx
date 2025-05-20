import React, { useState, useRef, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Avatar, Input, Button, Select } from "antd";
import {
  SendOutlined,
  DeleteOutlined,
  RobotOutlined,
  LeftOutlined,
} from "@ant-design/icons";
import ChatMessageAgent from "../components/ChatMessageAgent";
import ReactMarkdown from "react-markdown";
import { ApiDomain } from "../constants";

const { TextArea } = Input;
const CHAT_HISTORY_KEY = "custom_chatbot_chat_history";

interface StructuredMessage {
  role: string;
  content: string;
  type?: string;
  displayContent?: string;
}

const modelOptions = [
  { label: "Gemini 2.0 Flash", value: "gemini-2.0-flash" },
  { label: "GPT-4o", value: "gpt-4o" },
  { label: "GPT-4o Mini", value: "gpt-4o-mini" },
];

const CustomChatbot: React.FC = () => {
  const [messages, setMessages] = useState<StructuredMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [conversationId, setConversationId] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<any>(null);
  const [modelName, setModelName] = useState<string>(modelOptions[0].value);

  useEffect(() => {
    const existingId = searchParams.get("conversationId");
    if (existingId) {
      setConversationId(existingId);
    } else {
      const newId = `conv_${Date.now()}`;
      setConversationId(newId);
      navigate(`?conversationId=${newId}`, { replace: true });
    }
  }, [searchParams, navigate]);

  useEffect(() => {
    const storageKey = `${CHAT_HISTORY_KEY}_${conversationId}`;
    localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages, conversationId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  useEffect(() => {
    const storageKey = `${CHAT_HISTORY_KEY}_${conversationId}`;
    const savedMessages = localStorage.getItem(storageKey);
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (error) {
        console.error("Failed to parse saved messages:", error);
        setMessages([]);
      }
    } else {
      setMessages([]);
    }
  }, [conversationId]);

  const handleStreamingChat = async (query: string) => {
    try {
      setStreamingMessage("");
      const response = await fetch(ApiDomain + "/ai/custom_chatbot/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          conversation_id: conversationId,
          model_name: modelName,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No reader available");
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = new TextDecoder().decode(value);
        const lines = text.split("\n").filter(Boolean);

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.type === "message") {
              setStreamingMessage(data.content);
            } else if (data.type === "final") {
              const aiMessage: StructuredMessage = {
                role: "assistant",
                content: data.content.final_response,
                type: "ai",
                displayContent: data.content.final_response,
              };
              setMessages((prev) => [...prev, aiMessage]);
              setStreamingMessage("");
              setLoading(false);
            } else if (data.type === "error") {
              throw new Error(data.content);
            }
          } catch (e) {
            console.error("Error parsing stream data:", e);
          }
        }
      }
    } catch (error) {
      console.error("Error in streaming chat:", error);
      setLoading(false);
      setStreamingMessage("");
      const errorMessage: StructuredMessage = {
        role: "assistant",
        content: `Error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        type: "ai",
        displayContent: `Error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: StructuredMessage = {
      role: "user",
      content: input,
      type: "human",
      displayContent: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    await handleStreamingChat(input);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearHistory = () => {
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      <div className="flex-none bg-white/80 backdrop-blur-sm shadow-sm border-b border-purple-100 py-4">
        <div className="max-w-3xl mx-auto flex justify-between items-center px-4">
          <div className="flex items-center gap-3">
            <Button
              type="text"
              icon={<LeftOutlined />}
              onClick={() => navigate("/")}
              className="mr-1"
            >
              Back
            </Button>
            <Avatar
              icon={<RobotOutlined />}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
              size={40}
            />
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                Custom AI Assistant
              </h1>
              <p className="text-sm text-gray-500">
                Chat with your custom AI assistant
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={modelName}
              onChange={setModelName}
              style={{ width: 180 }}
              options={modelOptions}
              className="mr-2"
            />
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              onClick={clearHistory}
            >
              Clear
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <div className="text-center py-10">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-purple-100">
                <RobotOutlined className="text-4xl text-purple-500 mb-2" />
                <h3 className="text-lg font-medium text-gray-800 mb-1">
                  Custom AI Assistant
                </h3>
                <p className="text-gray-600 mb-4">
                  Start a conversation with your custom AI assistant. Ask any
                  questions or discuss any topic.
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg: StructuredMessage, index: number) => {
              const displayMessage = {
                role: msg.role,
                content: msg.displayContent || msg.content,
              };
              return <ChatMessageAgent key={index} message={displayMessage} />;
            })
          )}

          {streamingMessage && (
            <div className="flex justify-center">
              <div className="bg-gray-100 rounded-2xl py-4 w-2/3 animate-pulse">
                <div className="max-w-3xl mx-auto flex gap-4 px-4">
                  <Avatar
                    icon={<RobotOutlined />}
                    className="bg-blue-500 text-white"
                    size={32}
                  />
                  <div className="flex-1 text-gray-800 text-sm leading-relaxed">
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

      {/* Input Area */}
      <div className="flex-none p-4 border-t border-purple-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <TextArea
                ref={inputRef}
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                autoSize={{ minRows: 1, maxRows: 4 }}
                disabled={loading}
                className="rounded-xl border-gray-300 focus:border-purple-400 focus:ring focus:ring-purple-200 focus:ring-opacity-50 resize-none"
              />
            </div>
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className={`p-2 rounded-full ${
                loading || !input.trim()
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md hover:shadow-lg transition-shadow duration-200"
              }`}
            >
              <SendOutlined className="text-lg" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomChatbot;
