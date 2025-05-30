import React, { useState, useRef, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Avatar, Input, Button, Select, Modal } from "antd";
import {
  SendOutlined,
  DeleteOutlined,
  RobotOutlined,
  LeftOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
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

const CustomChatbot: React.FC = () => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<StructuredMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [conversationId, setConversationId] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<any>(null);
  const [modelName, setModelName] = useState<string>("gemini-2.5-flash-preview-05-20");
  const [clearModalVisible, setClearModalVisible] = useState(false);

  const modelOptions = [
    { label: t("customChatbot.model.gemini25"), value: "gemini-2.5-flash-preview-05-20" },
    { label: t("customChatbot.model.gemini20"), value: "gemini-2.0-flash" },
  ];

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

  const handleClearConfirm = () => {
    clearHistory();
    setClearModalVisible(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="flex-none bg-white/90 backdrop-blur-sm shadow-sm border-b border-gray-100 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center px-4">
          <div className="flex items-center gap-3">
            <Button
              type="text"
              icon={<LeftOutlined />}
              onClick={() => navigate("/")}
              className="text-gray-600 hover:text-blue-600"
            >
              {t("common.back")}
            </Button>
            <Avatar
              icon={<RobotOutlined />}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
              size={40}
            />
            <div>
              <h1 className="text-xl font-semibold text-gray-800">
                {t("customChatbot.title")}
              </h1>
              <p className="text-sm text-gray-500">
                {t("customChatbot.description")}
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
              placeholder={t("customChatbot.model.title")}
            />
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              onClick={() => setClearModalVisible(true)}
              className="bg-red-500 hover:bg-red-600 border-none"
            >
              {t("customChatbot.clear")}
            </Button>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto py-4 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <div className="text-center py-10">
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                <RobotOutlined className="text-4xl text-blue-500 mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  🤖 Trợ Lý Tạo Chatbot
                </h3>
                <div className="bg-blue-50 rounded-lg p-6 mb-6 border-l-4 border-blue-500">
                  <p className="text-gray-700 text-base leading-relaxed mb-4">
                    <strong>Trợ lý AI này sẽ hỗ trợ bạn tạo ra một chatbot theo yêu cầu của bạn.</strong>
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Bạn hãy trao đổi thông tin với trợ lý này thông qua đoạn chat, nhằm thu thập đủ thông tin cho chatbot mới.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center mb-2">
                      <span className="text-lg">💡</span>
                      <h4 className="font-semibold text-green-800 ml-2">Hướng dẫn sử dụng</h4>
                    </div>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Mô tả mục đích chatbot của bạn</li>
                      <li>• Cung cấp thông tin về đối tượng người dùng</li>
                      <li>• Chia sẻ yêu cầu tính năng cụ thể</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center mb-2">
                      <span className="text-lg">🎯</span>
                      <h4 className="font-semibold text-purple-800 ml-2">Ví dụ tạo chatbot</h4>
                    </div>
                    <ul className="text-sm text-purple-700 space-y-1">
                      <li>• Chatbot hỗ trợ khách hàng</li>
                      <li>• Chatbot tư vấn sản phẩm</li>
                      <li>• Chatbot giáo dục</li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    <span className="font-semibold">💬 Bắt đầu:</span> Hãy nhập câu hỏi hoặc mô tả chatbot bạn muốn tạo vào ô chat bên dưới!
                  </p>
                </div>
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

          {/* Streaming Message */}
          {streamingMessage && (
            <div className="flex justify-center">
              <div className="bg-gray-50 rounded-2xl py-4 w-2/3 animate-pulse">
                <div className="max-w-4xl mx-auto flex gap-4 px-4">
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
      <div className="flex-none p-4 border-t border-gray-100 bg-white/90 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <TextArea
                ref={inputRef}
                placeholder={t("customChatbot.inputPlaceholder")}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                autoSize={{ minRows: 1, maxRows: 4 }}
                disabled={loading}
                className="rounded-xl border-gray-200 focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50 resize-none"
              />
            </div>
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className={`p-3 rounded-full transition-all duration-200 ${
                loading || !input.trim()
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 text-white shadow-sm hover:bg-blue-700 hover:shadow-md"
              }`}
              title={t("customChatbot.send")}
            >
              <SendOutlined className="text-lg" />
            </button>
          </div>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      <Modal
        title={t("customChatbot.clear")}
        open={clearModalVisible}
        onOk={handleClearConfirm}
        onCancel={() => setClearModalVisible(false)}
        okText={t("common.confirm")}
        cancelText={t("common.cancel")}
      >
        <p>{t("customChatbot.clearConfirm")}</p>
      </Modal>
    </div>
  );
};

export default CustomChatbot;
