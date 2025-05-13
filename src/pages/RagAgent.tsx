import React, { useState, useRef, useEffect } from "react";
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
} from "antd";
import {
  SendOutlined,
  DeleteOutlined,
  ThunderboltOutlined,
  RobotOutlined,
  InfoCircleOutlined,
  PictureOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import ChatMessage from "../components/ChatMessage";
import { ChatMessage as ChatMessageType } from "../services/chatService";
import {
  RagAgentPayload,
  sendRagAgentMessage,
  sendStreamingRagAgentMessage,
} from "../services/ragAgentService";
import ReactMarkdown from "react-markdown";

const { TextArea } = Input;
const { Panel } = Collapse;
const CHAT_HISTORY_KEY = "rag_agent_chat_history";

const RagAgent: React.FC = () => {
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
  const [isStreaming, setIsStreaming] = useState(true);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [selectedDocuments, setSelectedDocuments] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [availableImages, setAvailableImages] = useState<any[]>([]);
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

            // Check for images in selected documents and include them in the response
            const imageDocuments = (finalData.selected_documents || []).filter(
              (doc) =>
                doc.metadata &&
                doc.metadata.public_url &&
                doc.metadata.type === "image"
            );

            // Append image URLs to the response if they exist
            if (imageDocuments.length > 0) {
              // If there's a reference to [Image] without a URL in the response, replace it
              if (
                responseContent.includes("[Image]") ||
                responseContent.includes("[image]")
              ) {
                imageDocuments.forEach((doc) => {
                  // Replace both [Image] and [image] with proper markdown image syntax
                  responseContent = responseContent.replace(
                    /\[Image\]/i,
                    `\n![image](${doc.metadata.public_url})`
                  );
                });
              }
            }

            const aiMessage: ChatMessageType = {
              content: responseContent,
              type: "ai",
            };
            setMessages((prev) => [...prev, aiMessage]);
            setSelectedDocuments(finalData.selected_documents || []);
            setLoading(false);
          }
        },
        (error: string) => {
          console.error("Streaming error:", error);
          setLoading(false);
          setStreamingMessage("");
          // Add error message
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
    }
  };

  const handleNonStreamingChat = async (payload: RagAgentPayload) => {
    try {
      const response = await sendRagAgentMessage(payload);

      // Process response to include image URLs from selected documents
      let responseContent = response.final_response;

      // Check for images in selected documents and include them in the response
      const imageDocuments = (response.selected_documents || []).filter(
        (doc) =>
          doc.metadata &&
          doc.metadata.public_url &&
          doc.metadata.type === "image"
      );

      // Append image URLs to the response if they exist
      if (imageDocuments.length > 0) {
        // If there's a reference to [Image] without a URL in the response, replace it
        if (
          responseContent.includes("[Image]") ||
          responseContent.includes("[image]")
        ) {
          imageDocuments.forEach((doc) => {
            // Replace both [Image] and [image] with proper markdown image syntax
            responseContent = responseContent.replace(
              /\[Image\]/i,
              `\n![image](${doc.metadata.public_url})`
            );
          });
        }
      }

      const aiMessage: ChatMessageType = {
        content: responseContent,
        type: "ai",
      };

      setMessages((prev) => [...prev, aiMessage]);
      setSelectedDocuments(response.selected_documents || []);
      setLoading(false);
    } catch (error) {
      console.error("Error in non-streaming chat:", error);
      setLoading(false);

      // Add error message
      const errorMessage: ChatMessageType = {
        content: `Error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        type: "ai",
      };
      setMessages((prev) => [...prev, errorMessage]);
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

    // Add user message to chat
    const userMessage: ChatMessageType = {
      content: selectedImage
        ? `${input || "Hình này là gì?"}\n![image](${selectedImage})`
        : input,
      type: "human",
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Prepare payload
    const payload: RagAgentPayload = {
      query: input || (selectedImage ? "Hình này là gì?" : ""),
      history: messages,
    };

    // Add image URL if an image is selected
    if (selectedImage) {
      payload.image_url = selectedImage;
    }

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
    localStorage.removeItem(CHAT_HISTORY_KEY);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      {/* Header */}
      <div className="flex-none bg-white/80 backdrop-blur-sm shadow-sm border-b border-purple-100 py-4">
        <div className="max-w-3xl mx-auto flex justify-between items-center px-4">
          <div className="flex items-center gap-3">
            <Avatar
              icon={<RobotOutlined />}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
              size={40}
            />
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                Travel Guide RAG Agent
              </h1>
              <p className="text-sm text-gray-500">
                Ask me anything about travel destinations
              </p>
            </div>
          </div>
          <button
            onClick={clearHistory}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-red-200 text-red-500 hover:bg-red-50 transition-colors duration-150"
          >
            <DeleteOutlined />
            <span className="text-sm">Clear</span>
          </button>
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
                <RobotOutlined className="text-4xl text-purple-500 mb-2" />
                <h3 className="text-lg font-medium text-gray-800 mb-1">
                  Travel Guide RAG Agent
                </h3>
                <p className="text-gray-600 mb-4">
                  Ask me anything about travel destinations, plan your trips, or
                  inquire about images of places.
                </p>
                <div className="grid grid-cols-1 gap-2 text-left">
                  <div
                    className="bg-purple-50 p-3 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors duration-150"
                    onClick={() => {
                      setInput("What are popular destinations in Vietnam?");
                    }}
                  >
                    <p className="text-purple-800 font-medium">
                      What are popular destinations in Vietnam?
                    </p>
                  </div>
                  <div
                    className="bg-purple-50 p-3 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors duration-150"
                    onClick={() => {
                      setInput("How to plan a 3-day trip to Quy Nhon?");
                    }}
                  >
                    <p className="text-purple-800 font-medium">
                      How to plan a 3-day trip to Quy Nhon?
                    </p>
                  </div>
                  <div
                    className="bg-purple-50 p-3 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors duration-150"
                    onClick={() => {
                      setInput("What's the best time to visit Ky Co beach?");
                    }}
                  >
                    <p className="text-purple-800 font-medium">
                      What's the best time to visit Ky Co beach?
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <></>
          )}

          {/* Streaming message */}
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
