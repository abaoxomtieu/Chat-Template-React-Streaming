import React, { useState, useRef, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Avatar,
  Input,
  Switch,
  Card,
  Collapse,
  Tag,
  Button,
  Image,
  Modal,
  List,
  message,
  Skeleton,
} from "antd";
import {
  SendOutlined,
  DeleteOutlined,
  ThunderboltOutlined,
  RobotOutlined,
  InfoCircleOutlined,
  PictureOutlined,
  CloseCircleOutlined,
  EditOutlined,
  LeftOutlined,
} from "@ant-design/icons";
import FileUploadButton from "../components/FileUploadButton";
// import ChatMessage from "../components/ChatMessage";
import ChatMessageAgent from "../components/ChatMessageAgent";
import RecommendationContainer, {
  travelGuideRecommendations,
} from "../components/RecommendationContainer";
import {
  RagAgentPayload,
  sendRagAgentMessage,
  sendStreamingRagAgentMessage,
} from "../services/ragAgentService";
import { fetchChatbotDetail, Chatbot } from "../services/chatbotService";
import ChatbotEditModal from "../components/ChatbotEditModal";
import ReactMarkdown from "react-markdown";
import { v4 as uuidv4 } from "uuid";

const { TextArea } = Input;
const { Panel } = Collapse;
const CHAT_HISTORY_KEY = "rag_agent_chat_history";
const CONVERSATION_LIST_KEY = "rag_agent_conversation_list";

interface ConversationMeta {
  conversation_id: string;
  name: string;
  created_at: number;
}

const RagAgent: React.FC = () => {
  // Define a new type for structured messages that includes role-based format
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
    // Keep the original type for backward compatibility with UI components
    type?: string;
    // For display purposes only
    displayContent?: string;
  }

  const [messages, setMessages] = useState<StructuredMessage[]>(() => {
    // We'll initialize this with an empty array and load the proper history after we get the botId
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
  const [botId, setBotId] = useState<string>("1"); // Default bot ID
  const [chatbotDetails, setChatbotDetails] = useState<Chatbot | null>(null);
  const [loadingChatbot, setLoadingChatbot] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<any>(null);
  const [conversationId, setConversationId] = useState<string>("");
  const [conversations, setConversations] = useState<ConversationMeta[]>([]);

  // Get botId from URL query parameters and fetch chatbot details
  useEffect(() => {
    const botIdFromUrl = searchParams.get("botId");
    if (botIdFromUrl) {
      setBotId(botIdFromUrl);
      // Clear chat history when switching bots
      setMessages([]);

      // Fetch chatbot details
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
          message.error("Failed to load chatbot details");
        } finally {
          setLoadingChatbot(false);
        }
      };

      fetchDetails();
    }
  }, [searchParams]);

  // Load conversation list for current botId
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

  // Load messages for selected conversation
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

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (!botId || !conversationId) return;
    const storageKey = `${CHAT_HISTORY_KEY}_${botId}_${conversationId}`;
    localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages, botId, conversationId]);

  // Save conversation list whenever it changes
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

  // Create a new conversation
  const createConversation = () => {
    const newId = uuidv4();
    const newMeta: ConversationMeta = {
      conversation_id: newId,
      name: `Conversation ${conversations.length + 1}`,
      created_at: Date.now(),
    };
    setConversations((prev) => [newMeta, ...prev]);
    setConversationId(newId);
    setMessages([]);
  };

  // Delete a conversation
  const deleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.conversation_id !== id));
    localStorage.removeItem(`${CHAT_HISTORY_KEY}_${botId}_${id}`);
    if (conversationId === id) {
      // If current, switch to another or clear
      if (conversations.length > 1) {
        const next = conversations.find((c) => c.conversation_id !== id);
        if (next) setConversationId(next.conversation_id);
      } else {
        setConversationId("");
        setMessages([]);
      }
    }
  };

  // Select a conversation
  const selectConversation = (id: string) => {
    setConversationId(id);
  };

  // On botId change, auto-select first conversation or create one
  useEffect(() => {
    if (conversations.length > 0) {
      setConversationId(conversations[0].conversation_id);
    } else {
      setConversationId("");
    }
  }, [conversations]);

  // Update available images whenever selected documents change
  useEffect(() => {
    // Filter documents to find those with image URLs
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
        payload,
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
            // Process response to include image URLs from selected documents
            let responseContent = finalData.final_response;
            let contentForApi = responseContent;

            // Check for images in selected documents and include them in the response
            const imageDocuments = (finalData.selected_documents || []).filter(
              (doc) =>
                doc.metadata &&
                doc.metadata.public_url &&
                doc.metadata.type === "image"
            );

            // Structure for storing images in the API format
            const contentItems = [];

            // If there's text content, add it first
            if (responseContent) {
              contentItems.push({ type: "text", text: responseContent });
            }

            // Append image URLs to the response if they exist
            if (imageDocuments.length > 0) {
              // If there's a reference to [Image] without a URL in the response, replace it
              if (
                responseContent.includes("[Image]") ||
                responseContent.includes("[image]")
              ) {
                imageDocuments.forEach((doc) => {
                  // Replace both [Image] and [image] with proper markdown image syntax for display
                  responseContent = responseContent.replace(
                    /\[Image\]/i,
                    `![image]\n(${doc.metadata.public_url})`
                  );

                  // Add image to content items for API
                  contentItems.push({
                    type: "image",
                    source_type: "url",
                    url: doc.metadata.public_url,
                  });
                });
              }
            }

            // Create a structured message with both display and API formats
            const aiMessage: StructuredMessage = {
              role: "assistant",
              content: contentItems.length > 1 ? contentItems : contentForApi,
              type: "ai",
              displayContent: responseContent,
            };

            setMessages((prev) => [...prev, aiMessage] as StructuredMessage[]);
            setSelectedDocuments(finalData.selected_documents || []);
            setLoading(false);

            // Refocus on the input field after streaming is done
            setTimeout(() => {
              inputRef.current?.focus();
            }, 100);
          }
        },
        (error: string) => {
          console.error("Streaming error:", error);
          setLoading(false);
          setStreamingMessage("");
          // Add error message
          const errorMessage: StructuredMessage = {
            role: "assistant",
            content: `Error: ${error}`,
            type: "ai",
            displayContent: `Error: ${error}`,
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
      const response = await sendRagAgentMessage(payload);

      // Process response to include image URLs from selected documents
      let responseContent = response.final_response;
      let contentForApi = responseContent;

      // Check for images in selected documents and include them in the response
      const imageDocuments = (response.selected_documents || []).filter(
        (doc) =>
          doc.metadata &&
          doc.metadata.public_url &&
          doc.metadata.type === "image"
      );

      // Structure for storing images in the API format
      const contentItems = [];

      // If there's text content, add it first
      if (responseContent) {
        contentItems.push({ type: "text", text: responseContent });
      }

      // Append image URLs to the response if they exist
      if (imageDocuments.length > 0) {
        // If there's a reference to [Image] without a URL in the response, replace it
        if (
          responseContent.includes("[Image]") ||
          responseContent.includes("[image]")
        ) {
          imageDocuments.forEach((doc) => {
            // Replace both [Image] and [image] with proper markdown image syntax for display
            responseContent = responseContent.replace(
              /\[Image\]/i,
              `![image]\n(${doc.metadata.public_url})`
            );

            // Add image to content items for API
            contentItems.push({
              type: "image",
              source_type: "url",
              url: doc.metadata.public_url,
            });
          });
        }
      }

      // Create a structured message with both display and API formats
      const aiMessage: StructuredMessage = {
        role: "assistant",
        content: contentItems.length > 1 ? contentItems : contentForApi,
        type: "ai",
        displayContent: responseContent,
      };

      setMessages((prev) => [...prev, aiMessage] as StructuredMessage[]);
      setSelectedDocuments(response.selected_documents || []);
      setLoading(false);

      // Refocus on the input field after response is received
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } catch (error) {
      console.error("Error in non-streaming chat:", error);
      setLoading(false);

      // Add error message
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
      setMessages((prev) => [...prev, errorMessage] as StructuredMessage[]);
    }
  };

  // Function to open the image selection modal
  const openImageModal = () => {
    setIsImageModalVisible(true);
  };

  // Function to close the image selection modal
  const closeImageModal = () => {
    setIsImageModalVisible(false);
  };

  // Function to select an image for chat
  const selectImage = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    closeImageModal();
  };

  // Function to clear the selected image
  const clearSelectedImage = () => {
    setSelectedImage(null);
  };

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || loading) return;

    // Format the query text
    const queryText = input || (selectedImage ? "Hình này là gì?" : "");
    clearSelectedImage();
    // Create a structured message that includes both role-based format and display format
    const userMessage: StructuredMessage = {
      // Role-based format for API
      role: "user",
      content: selectedImage
        ? [
            { type: "text", text: queryText },
            { type: "image", source_type: "url", url: selectedImage },
          ]
        : queryText,
      // Original type for backward compatibility
      type: "human",
      // Display content for UI rendering (only used for display)
      displayContent: selectedImage
        ? `${queryText}\n![image](${selectedImage})`
        : queryText,
    };

    setMessages((prev) => [...prev, userMessage] as StructuredMessage[]);
    setInput("");
    setLoading(true);

    // Prepare payload with role-based format
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

    // Handle chat based on streaming preference
    if (isStreaming) {
      await handleStreamingChat(payload);
    } else {
      await handleNonStreamingChat(payload);
    }

    // Clear the selected image after sending
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
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      {/* Conversation List Sidebar/Header */}
      <div className="flex-none bg-white/80 backdrop-blur-sm shadow-sm border-b border-purple-100 py-2">
        <div className="max-w-3xl mx-auto flex items-center gap-2 px-4">
          <Button type="primary" onClick={createConversation} size="small">+ New Conversation</Button>
          {conversations.map((conv) => (
            <div key={conv.conversation_id} className={`flex items-center gap-1 px-2 py-1 rounded cursor-pointer ${conversationId === conv.conversation_id ? 'bg-purple-100' : ''}`}
              onClick={() => selectConversation(conv.conversation_id)}>
              <span className="text-sm font-medium">{conv.name}</span>
              <Button type="text" size="small" danger onClick={e => { e.stopPropagation(); deleteConversation(conv.conversation_id); }}>
                <DeleteOutlined />
              </Button>
            </div>
          ))}
        </div>
      </div>
      {/* Edit Chatbot Modal */}
      <ChatbotEditModal
        isVisible={isEditModalVisible}
        onClose={closeEditModal}
        chatbot={chatbotDetails}
        onSuccess={handleChatbotUpdate}
      />
      {/* Header */}
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
                {chatbotDetails?.name || "AI Assistant"}
              </h1>
              <p className="text-sm text-gray-500">
                Ask me anything about travel destinations
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={openEditModal}
            >
              Edit
            </Button>
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

      {/* Image Selection Modal */}
      <Modal
        title="Select an Image to Chat About"
        open={isImageModalVisible}
        onCancel={closeImageModal}
        footer={null}
        width={700}
      >
        <List
          grid={{ gutter: 16, column: 2 }}
          dataSource={availableImages}
          renderItem={(image) => (
            <List.Item>
              <Card
                hoverable
                cover={
                  <div style={{ height: 200, overflow: "hidden" }}>
                    <Image
                      alt="Travel destination"
                      src={image.url}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                }
                onClick={() => selectImage(image.url)}
              >
                <Card.Meta
                  title={`Image ${image.id.substring(0, 8)}...`}
                  description={image.content.substring(0, 100) + "..."}
                />
              </Card>
            </List.Item>
          )}
        />
      </Modal>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto py-4 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <div className="text-center py-10">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-purple-100">
                {loadingChatbot ? (
                  <Skeleton active avatar paragraph={{ rows: 3 }} />
                ) : (
                  <>
                    <RobotOutlined className="text-4xl text-purple-500 mb-2" />
                    <h3 className="text-lg font-medium text-gray-800 mb-1">
                      {chatbotDetails?.name || "AI Assistant"}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {chatbotDetails?.prompt?.substring(0, 150) + "..." ||
                        "Ask me anything about travel destinations, plan your trips, or inquire about images of places."}
                    </p>
                  </>
                )}
                <RecommendationContainer
                  title="Example Questions"
                  recommendations={travelGuideRecommendations}
                  onRecommendationClick={(recommendation) =>
                    setInput(recommendation)
                  }
                />
              </div>
            </div>
          ) : (
            messages.map((msg: StructuredMessage, index: number) => {
              // Use the structured message directly with ChatMessageAgent
              // If displayContent is available, use it for rendering, otherwise use content
              const displayMessage = {
                role: msg.role,
                content:
                  msg.displayContent ||
                  (typeof msg.content === "string" ? msg.content : ""),
              };

              return <ChatMessageAgent key={index} message={displayMessage} />;
            })
          )}

          {/* Streaming message */}
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
                      <ReactMarkdown
                        components={{
                          img: ({ node, src, alt, ...props }) => (
                            <img
                              src={src}
                              alt={alt || "Image"}
                              className="my-2 max-w-full rounded-md"
                              {...props}
                            />
                          ),
                        }}
                      >
                        {streamingMessage}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Source documents */}
          {selectedDocuments.length > 0 && (
            <div className="mt-4">
              <Collapse
                className="bg-white/80 border border-purple-100 rounded-xl overflow-hidden"
                expandIconPosition="end"
              >
                <Panel
                  header={
                    <div className="flex items-center gap-2">
                      <InfoCircleOutlined className="text-purple-600" />
                      <span className="font-medium">
                        Sources ({selectedDocuments.length})
                      </span>
                    </div>
                  }
                  key="1"
                >
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {selectedDocuments.map((doc, index) => (
                      <div
                        key={index}
                        className="p-3 bg-gray-50 rounded-lg border border-gray-100"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Tag color="purple">{doc.id.substring(0, 8)}...</Tag>
                          {doc.metadata && doc.metadata.type && (
                            <Tag color="blue">{doc.metadata.type}</Tag>
                          )}
                        </div>
                        <p className="text-sm text-gray-700">
                          {doc.page_content}
                        </p>
                        {doc.metadata &&
                          doc.metadata.public_url &&
                          doc.metadata.type === "image" && (
                            <div className="mt-2">
                              <Image
                                src={doc.metadata.public_url}
                                alt="Source image"
                                style={{
                                  maxHeight: "150px",
                                  borderRadius: "8px",
                                }}
                              />
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                </Panel>
              </Collapse>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-none p-4 border-t border-purple-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <Switch
                checked={isStreaming}
                onChange={() => setIsStreaming(!isStreaming)}
                size="small"
              />
              <span className="text-xs text-gray-600 flex items-center gap-1">
                <ThunderboltOutlined />
                Streaming {isStreaming ? "On" : "Off"}
              </span>

              <FileUploadButton
                botId={botId}
                onUploadSuccess={(result) => {
                  // Refresh the chat or show a notification
                  message.success(
                    `Successfully processed ${result.file_path} with ${result.chunks_count} chunks`
                  );
                }}
              />
            </div>
            {availableImages.length > 0 && (
              <Button
                type="default"
                size="small"
                icon={<PictureOutlined />}
                onClick={openImageModal}
              >
                Select Image from Sources
              </Button>
            )}
          </div>

          {/* Selected Image Preview */}
          {selectedImage && (
            <div className="mb-3 relative">
              <div className="rounded-lg overflow-hidden border border-purple-200">
                <Image
                  src={selectedImage}
                  alt="Selected image"
                  style={{
                    maxHeight: "150px",
                    width: "auto",
                    margin: "0 auto",
                  }}
                  preview={false}
                />
              </div>
              <Button
                type="text"
                danger
                icon={<CloseCircleOutlined />}
                size="small"
                className="absolute top-1 right-1 bg-white/80 rounded-full"
                onClick={clearSelectedImage}
              />
            </div>
          )}

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <TextArea
                ref={inputRef}
                placeholder={
                  selectedImage
                    ? "Ask about this image..."
                    : "Ask me about travel destinations..."
                }
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
              disabled={loading || (!input.trim() && !selectedImage)}
              className={`p-2 rounded-full ${
                loading || (!input.trim() && !selectedImage)
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

export default RagAgent;
