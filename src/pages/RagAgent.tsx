import React, { useState, useRef, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Avatar, Button, message, Select } from "antd";
import {
  DeleteOutlined,
  RobotOutlined,
  EditOutlined,
  LeftOutlined,
  ApiOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import {
  RagAgentPayload,
  sendRagAgentMessage,
  sendStreamingRagAgentMessage,
} from "../services/ragAgentService";
import { fetchChatbotDetail, Chatbot } from "../services/chatbotService";
import ChatbotEditModal from "../components/ChatbotEditModal";
import { v4 as uuidv4 } from "uuid";
import ApiDocs from "../components/ApiDocs";
import ConversationList from "../components/ConversationList";
import ChatInput from "../components/ChatInput";
import ChatMessages from "../components/ChatMessages";
import ImageSelectionModal from "../components/ImageSelectionModal";

const CHAT_HISTORY_KEY = "rag_agent_chat_history";
const CONVERSATION_LIST_KEY = "rag_agent_conversation_list";

interface ConversationMeta {
  conversation_id: string;
  name: string;
  created_at: number;
}

const modelOptions = [
  { label: "Gemini 2.5 Flash", value: "gemini-2.5-flash-preview-05-20" },
  { label: "Gemini 2.0 Flash", value: "gemini-2.0-flash" },
];

const RagAgent: React.FC = () => {
  const { t } = useTranslation();
  interface StructuredMessage {
    role: string;
    content:
      | string
      | Array<{
          type: string;
          text?: string;
          source_type?: string;
          url?: string;
        }>;
    type?: string;
    displayContent?: string;
  }

  const [messages, setMessages] = useState<StructuredMessage[]>(() => {
    return [];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(true);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [selectedDocuments, setSelectedDocuments] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [availableImages, setAvailableImages] = useState<any[]>([]);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [botId, setBotId] = useState<string>("1");
  const [chatbotDetails, setChatbotDetails] = useState<Chatbot | null>(null);
  const [loadingChatbot, setLoadingChatbot] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<any>(null);
  const [conversationId, setConversationId] = useState<string>("");
  const [conversations, setConversations] = useState<ConversationMeta[]>([]);
  const [modelName, setModelName] = useState<string>(
    "gemini-2.5-flash-preview-05-20"
  );
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isApiDocsVisible, setIsApiDocsVisible] = useState(false);

  useEffect(() => {
    const botIdFromUrl = searchParams.get("botId");
    if (botIdFromUrl) {
      setBotId(botIdFromUrl);
      setMessages([]);

      const fetchDetails = async () => {
        try {
          setLoadingChatbot(true);
          const chatbot = await fetchChatbotDetail(botIdFromUrl);
          setChatbotDetails(chatbot);
        } catch (error) {
          console.error(
            `Error fetching chatbot details for ID ${botIdFromUrl}:`,
            error
          );
          message.error(t("chatbotEditor.loadError"));
        } finally {
          setLoadingChatbot(false);
        }
      };

      fetchDetails();
    }
  }, [searchParams, t]);

  useEffect(() => {
    if (!botId) return;
    const listKey = `${CONVERSATION_LIST_KEY}_${botId}`;
    const savedList = localStorage.getItem(listKey);
    if (savedList) {
      setConversations(JSON.parse(savedList));
    } else {
      setConversations([]);
    }
  }, [botId]);

  useEffect(() => {
    if (!botId || !conversationId) return;
    const storageKey = `${CHAT_HISTORY_KEY}_${botId}_${conversationId}`;
    const savedMessages = localStorage.getItem(storageKey);
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (error) {
        setMessages([]);
      }
    } else {
      setMessages([]);
    }
  }, [botId, conversationId]);

  useEffect(() => {
    if (!botId || !conversationId) return;
    const storageKey = `${CHAT_HISTORY_KEY}_${botId}_${conversationId}`;
    localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages, botId, conversationId]);

  useEffect(() => {
    if (!botId) return;
    const listKey = `${CONVERSATION_LIST_KEY}_${botId}`;
    localStorage.setItem(listKey, JSON.stringify(conversations));
  }, [conversations, botId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  const createConversation = () => {
    const newId = uuidv4();
    const newMeta: ConversationMeta = {
      conversation_id: newId,
      name: `${t("chat.newConversation")} ${conversations.length + 1}`,
      created_at: Date.now(),
    };
    setConversations((prev) => [newMeta, ...prev]);
    setConversationId(newId);
    setMessages([]);
  };

  const deleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.conversation_id !== id));
    localStorage.removeItem(`${CHAT_HISTORY_KEY}_${botId}_${id}`);
    if (conversationId === id) {
      if (conversations.length > 1) {
        const next = conversations.find((c) => c.conversation_id !== id);
        if (next) setConversationId(next.conversation_id);
      } else {
        setConversationId("");
        setMessages([]);
      }
    }
  };

  const selectConversation = (id: string) => {
    setConversationId(id);
  };

  useEffect(() => {
    if (conversations.length > 0) {
      setConversationId(conversations[0].conversation_id);
    } else {
      setConversationId("");
    }
  }, [conversations]);

  useEffect(() => {
    const images = selectedDocuments
      .filter(
        (doc) =>
          doc.metadata &&
          doc.metadata.public_url &&
          doc.metadata.type === "image"
      )
      .map((doc) => ({
        id: doc.id,
        url: doc.metadata.public_url,
        content: doc.page_content,
      }));

    setAvailableImages(images);
  }, [selectedDocuments]);

  const handleStreamingChat = async (payload: RagAgentPayload) => {
    try {
      setStreamingMessage("");
      setSelectedDocuments([]);

      await sendStreamingRagAgentMessage(
        { ...payload, model_name: modelName },
        (message: string) => {
          setStreamingMessage(message);
        },
        (finalData: {
          final_response: string;
          selected_ids: number[];
          selected_documents: any[];
        }) => {
          setStreamingMessage("");
          if (typeof finalData === "object" && "final_response" in finalData) {
            let responseContent = finalData.final_response;
            let contentForApi = responseContent;

            const imageDocuments = (finalData.selected_documents || []).filter(
              (doc) =>
                doc.metadata &&
                doc.metadata.public_url &&
                doc.metadata.type === "image"
            );

            const contentItems = [];

            if (responseContent) {
              contentItems.push({ type: "text", text: responseContent });
            }

            if (imageDocuments.length > 0) {
              if (
                responseContent.includes("[Image]") ||
                responseContent.includes("[image]")
              ) {
                imageDocuments.forEach((doc) => {
                  responseContent = responseContent.replace(
                    /\[Image\]/i,
                    `![image]\n(${doc.metadata.public_url})`
                  );

                  contentItems.push({
                    type: "image",
                    source_type: "url",
                    url: doc.metadata.public_url,
                  });
                });
              }
            }

            const aiMessage: StructuredMessage = {
              role: "assistant",
              content: contentItems.length > 1 ? contentItems : contentForApi,
              type: "ai",
              displayContent: responseContent,
            };

            setMessages((prev) => [...prev, aiMessage] as StructuredMessage[]);
            setSelectedDocuments(finalData.selected_documents || []);
            setLoading(false);

            setTimeout(() => {
              inputRef.current?.focus();
            }, 100);
          }
        },
        (error: string) => {
          console.error("Streaming error:", error);
          setLoading(false);
          setStreamingMessage("");
          const errorMessage: StructuredMessage = {
            role: "assistant",
            content: `${t("chat.error")}: ${error}`,
            type: "ai",
            displayContent: `${t("chat.error")}: ${error}`,
          };
          setMessages((prev) => [...prev, errorMessage] as StructuredMessage[]);
        }
      );
    } catch (error) {
      console.error("Error in streaming chat:", error);
      setLoading(false);
    }
  };

  const handleNonStreamingChat = async (payload: RagAgentPayload) => {
    try {
      const response = await sendRagAgentMessage({
        ...payload,
        model_name: modelName,
      });

      let responseContent = response.final_response;
      let contentForApi = responseContent;

      const imageDocuments = (response.selected_documents || []).filter(
        (doc) =>
          doc.metadata &&
          doc.metadata.public_url &&
          doc.metadata.type === "image"
      );

      const contentItems = [];

      if (responseContent) {
        contentItems.push({ type: "text", text: responseContent });
      }

      if (imageDocuments.length > 0) {
        if (
          responseContent.includes("[Image]") ||
          responseContent.includes("[image]")
        ) {
          imageDocuments.forEach((doc) => {
            responseContent = responseContent.replace(
              /\[Image\]/i,
              `![image]\n(${doc.metadata.public_url})`
            );

            contentItems.push({
              type: "image",
              source_type: "url",
              url: doc.metadata.public_url,
            });
          });
        }
      }

      const aiMessage: StructuredMessage = {
        role: "assistant",
        content: contentItems.length > 1 ? contentItems : contentForApi,
        type: "ai",
        displayContent: responseContent,
      };

      setMessages((prev) => [...prev, aiMessage] as StructuredMessage[]);
      setSelectedDocuments(response.selected_documents || []);
      setLoading(false);

      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } catch (error) {
      console.error("Error in non-streaming chat:", error);
      setLoading(false);

      const errorMessage: StructuredMessage = {
        role: "assistant",
        content: `${t("chat.error")}: ${
          error instanceof Error ? error.message : t("errors.unknownError")
        }`,
        type: "ai",
        displayContent: `${t("chat.error")}: ${
          error instanceof Error ? error.message : t("errors.unknownError")
        }`,
      };
      setMessages((prev) => [...prev, errorMessage] as StructuredMessage[]);
    }
  };

  const openImageModal = () => {
    setIsImageModalVisible(true);
  };

  const closeImageModal = () => {
    setIsImageModalVisible(false);
  };

  const selectImage = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    closeImageModal();
  };

  const clearSelectedImage = () => {
    setSelectedImage(null);
  };

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || loading) return;

    const queryText =
      input || (selectedImage ? t("chat.imageInputPlaceholder") : "");
    clearSelectedImage();
    const userMessage: StructuredMessage = {
      role: "user",
      content: selectedImage
        ? [
            { type: "text", text: queryText },
            { type: "image", source_type: "url", url: selectedImage },
          ]
        : queryText,
      type: "human",
      displayContent: selectedImage
        ? `${queryText}\n![image](${selectedImage})`
        : queryText,
    };

    setMessages((prev) => [...prev, userMessage] as StructuredMessage[]);
    setInput("");
    setLoading(true);

    const payload: RagAgentPayload = {
      query: {
        role: "user",
        content: selectedImage
          ? [
              { type: "text", text: queryText },
              { type: "image", source_type: "url", url: selectedImage },
            ]
          : queryText,
      },
      bot_id: botId,
      conversation_id: conversationId,
    };

    if (isStreaming) {
      await handleStreamingChat(payload);
    } else {
      await handleNonStreamingChat(payload);
    }

    clearSelectedImage();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearHistory = () => {
    setMessages([]);
    setSelectedDocuments([]);
  };

  const openEditModal = () => {
    setIsEditModalVisible(true);
  };

  const closeEditModal = () => {
    setIsEditModalVisible(false);
  };

  const handleChatbotUpdate = (updatedChatbot: Chatbot) => {
    setChatbotDetails(updatedChatbot);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Conversation Sidebar */}
      <div
        className={`flex-none bg-white/90 backdrop-blur-sm border-r border-gray-100 transition-all duration-300 ${
          isSidebarCollapsed ? "w-16" : "w-64"
        }`}
      >
        <ConversationList
          conversations={conversations}
          currentConversationId={conversationId}
          isSidebarCollapsed={isSidebarCollapsed}
          onSelectConversation={selectConversation}
          onDeleteConversation={deleteConversation}
          onCreateConversation={createConversation}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
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
                  {chatbotDetails?.name || t("chatbotEditor.defaultName")}
                </h1>
                <p className="text-sm text-gray-500">
                  {chatbotDetails?.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={openEditModal}
                className="bg-blue-600 hover:bg-blue-700 border-none"
              >
                {t("common.edit")}
              </Button>
              <Button
                type="primary"
                icon={<ApiOutlined />}
                onClick={() => setIsApiDocsVisible(true)}
                className="bg-green-600 hover:bg-green-700 border-none"
              >
                {t("chatbotEditor.apiDocs")}
              </Button>
              <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
                onClick={clearHistory}
                className="bg-red-500 hover:bg-red-600 border-none"
              >
                {t("chat.clearHistory")}
              </Button>
              <Select
                value={modelName}
                onChange={setModelName}
                style={{ width: 180 }}
                options={modelOptions}
                className="mr-2"
              />
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <ChatMessages
          messages={messages}
          streamingMessage={streamingMessage}
          selectedDocuments={selectedDocuments}
          loadingChatbot={loadingChatbot}
          chatbotDetails={chatbotDetails}
          messagesEndRef={messagesEndRef}
          onRecommendationClick={(recommendation) => setInput(recommendation)}
        />

        {/* Chat Input */}
        <ChatInput
          input={input}
          loading={loading}
          isStreaming={isStreaming}
          selectedImage={selectedImage}
          availableImages={availableImages}
          botId={botId}
          onInputChange={setInput}
          onSend={handleSend}
          onKeyPress={handleKeyPress}
          onStreamingToggle={() => setIsStreaming(!isStreaming)}
          onImageClear={clearSelectedImage}
          onImageModalOpen={openImageModal}
          onUploadSuccess={(result) => {
            message.success(
              t("chat.fileUploadSuccess", {
                file_path: result.file_path,
                chunks_count: result.chunks_count,
              })
            );
          }}
        />
      </div>

      {/* Modals */}
      <ImageSelectionModal
        isVisible={isImageModalVisible}
        onClose={closeImageModal}
        availableImages={availableImages}
        onImageSelect={selectImage}
      />

      <ChatbotEditModal
        isVisible={isEditModalVisible}
        onClose={closeEditModal}
        chatbot={chatbotDetails}
        onSuccess={handleChatbotUpdate}
      />

      <ApiDocs
        isVisible={isApiDocsVisible}
        onClose={() => setIsApiDocsVisible(false)}
        botId={botId}
      />
    </div>
  );
};

export default RagAgent;
