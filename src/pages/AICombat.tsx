import React, { useEffect, useState, useRef } from "react";
import {
  Select,
  Card,
  Button,
  Typography,
  Tag,
  Switch,
  Space,
  message,
} from "antd";
import { Chatbot, fetchChatbots } from "../services/chatbotService";
import {
  sendStreamingRagAgentMessage,
  RagAgentPayload,
} from "../services/ragAgentService";
import ChatMessages from "../components/ChatMessages";
import { LeftOutlined, RobotOutlined, StopOutlined } from "@ant-design/icons";
import { v4 as uuidv4 } from "uuid";

const { Title, Text } = Typography;

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
  type: string;
  displayContent: string;
}

const modelOptions = [
  { label: "Gemini 2.5 Flash", value: "gemini-2.5-flash-preview-05-20" },
  { label: "Gemini 2.0 Flash", value: "gemini-2.0-flash" },
];

const AICombat: React.FC = () => {
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [leftChatbot, setLeftChatbot] = useState<string | null>(null);
  const [rightChatbot, setRightChatbot] = useState<string | null>(null);
  const [messages, setMessages] = useState<StructuredMessage[]>([]);
  const messagesRef = useRef<StructuredMessage[]>([]);
  const [isConversationStarted, setIsConversationStarted] = useState(false);
  const [agent_ask, setAgentAsk] = useState<"left" | "right">("left");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConversationActive, setIsConversationActive] = useState(true);
  const [leftConversationId] = useState(() => uuidv4());
  const [rightConversationId] = useState(() => uuidv4());
  const [streamingMessage, setStreamingMessage] = useState("");
  const [selectedDocuments, setSelectedDocuments] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [leftModelName, setLeftModelName] = useState<string>(
    "gemini-2.5-flash-preview-05-20"
  );
  const [rightModelName, setRightModelName] = useState<string>(
    "gemini-2.5-flash-preview-05-20"
  );

  useEffect(() => {
    const loadChatbots = async () => {
      try {
        const data = await fetchChatbots();
        setChatbots(data);
      } catch (error) {
        console.error("Failed to load chatbots:", error);
      }
    };
    loadChatbots();
  }, []);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const addMessage = (message: StructuredMessage) => {
    const updatedMessages = [...messagesRef.current, message];
    messagesRef.current = updatedMessages;
    setMessages(updatedMessages);
    return updatedMessages;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  const handleAIResponse = async (
    botId: string,
    conversationId: string,
    isLeft: boolean
  ) => {
    console.log("handleAIResponse called with:", {
      botId,
      conversationId,
      isLeft,
    });

    if (!isConversationActive || !leftChatbot || !rightChatbot) {
      console.log("Conversation not active or missing chatbots:", {
        isConversationActive,
        leftChatbot,
        rightChatbot,
      });
      return;
    }

    const currentMessages = messagesRef.current;
    console.log("Current messages from ref:", currentMessages);

    const lastMessage = currentMessages[currentMessages.length - 1];
    if (!lastMessage) {
      console.log("No last message found");
      return;
    }

    console.log("Sending message to AI:", {
      botId,
      conversationId,
      isLeft,
      lastMessage,
    });

    const payload: RagAgentPayload = {
      query: {
        role: "user",
        content: lastMessage.content,
      },
      bot_id: botId,
      conversation_id: conversationId,
      model_name: isLeft ? leftModelName : rightModelName,
    };

    try {
      console.log("Setting up for API call");
      setStreamingMessage("");
      setSelectedDocuments([]);
      setIsProcessing(true);

      console.log("Calling RAG agent with payload:", payload);

      await sendStreamingRagAgentMessage(
        payload,
        (message: string) => {
          setStreamingMessage(message);
        },
        async (finalData: any) => {
          console.log("Received final data:", finalData);
          setStreamingMessage("");
          if (typeof finalData === "object" && "final_response" in finalData) {
            let responseContent = finalData.final_response;
            let contentForApi = responseContent;

            const imageDocuments = (finalData.selected_documents || []).filter(
              (doc: any) =>
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
                imageDocuments.forEach((doc: any) => {
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
              role: isLeft ? "assistant" : "user",
              content: contentItems.length > 1 ? contentItems : contentForApi,
              type: isLeft ? "ai" : "human",
              displayContent: responseContent,
            };

            console.log("Adding AI message to conversation:", aiMessage);
            addMessage(aiMessage);
            setSelectedDocuments(finalData.selected_documents || []);
            setIsProcessing(false);

            // Continue the conversation with the other AI
            console.log("isConversationActive 2", isConversationActive);
            if (isConversationActive) {
              const nextBotId = isLeft ? rightChatbot : leftChatbot;
              const nextConversationId = isLeft ? rightConversationId : leftConversationId;
              console.log("Continuing conversation with next AI:", {
                nextBotId,
                nextConversationId,
                isLeft: !isLeft,
              });

              // Create the next message payload
              const nextPayload: RagAgentPayload = {
                query: {
                  role: "user",
                  content: responseContent,
                },
                bot_id: nextBotId,
                conversation_id: nextConversationId,
                model_name: !isLeft ? leftModelName : rightModelName,
              };

              try {
                console.log("Setting up for next AI response");
                setStreamingMessage("");
                setSelectedDocuments([]);
                setIsProcessing(true);

                console.log("Calling RAG agent with next payload:", nextPayload);

                await sendStreamingRagAgentMessage(
                  nextPayload,
                  (message: string) => {
                    setStreamingMessage(message);
                  },
                  async (nextFinalData: any) => {
                    console.log("Received final data from next AI:", nextFinalData);
                    setStreamingMessage("");
                    if (typeof nextFinalData === "object" && "final_response" in nextFinalData) {
                      let nextResponseContent = nextFinalData.final_response;
                      let nextContentForApi = nextResponseContent;

                      const nextImageDocuments = (nextFinalData.selected_documents || []).filter(
                        (doc: any) =>
                          doc.metadata &&
                          doc.metadata.public_url &&
                          doc.metadata.type === "image"
                      );

                      const nextContentItems = [];

                      if (nextResponseContent) {
                        nextContentItems.push({ type: "text", text: nextResponseContent });
                      }

                      if (nextImageDocuments.length > 0) {
                        if (
                          nextResponseContent.includes("[Image]") ||
                          nextResponseContent.includes("[image]")
                        ) {
                          nextImageDocuments.forEach((doc: any) => {
                            nextResponseContent = nextResponseContent.replace(
                              /\[Image\]/i,
                              `![image]\n(${doc.metadata.public_url})`
                            );

                            nextContentItems.push({
                              type: "image",
                              source_type: "url",
                              url: doc.metadata.public_url,
                            });
                          });
                        }
                      }

                      const nextAiMessage: StructuredMessage = {
                        role: !isLeft ? "assistant" : "user",
                        content: nextContentItems.length > 1 ? nextContentItems : nextContentForApi,
                        type: !isLeft ? "ai" : "human",
                        displayContent: nextResponseContent,
                      };

                      console.log("Adding next AI message to conversation:", nextAiMessage);
                      addMessage(nextAiMessage);
                      setSelectedDocuments(nextFinalData.selected_documents || []);
                      setIsProcessing(false);

                      // Continue the conversation loop
                      if (isConversationActive) {
                        setTimeout(async () => {
                          if (isConversationActive) {
                            console.log("Continuing with messages:", nextFinalData);
                            await handleAIResponse(botId, conversationId, isLeft);
                          }
                        }, 2000);
                      }
                    }
                  },
                  (error: string) => {
                    console.error("Error in next AI response:", error);
                    message.error(`Error from ${!isLeft ? "Left" : "Right"} AI: ${error}`);
                    setIsProcessing(false);
                    setStreamingMessage("");
                  }
                );
              } catch (error) {
                console.error("Error sending message to next AI:", error);
                setIsProcessing(false);
                setStreamingMessage("");
              }
            }
          }
        },
        (error: string) => {
          console.error("Error in AI response:", error);
          message.error(`Error from ${isLeft ? "Left" : "Right"} AI: ${error}`);
          setIsProcessing(false);
          setStreamingMessage("");
        }
      );
    } catch (error) {
      console.error("Error sending message to AI:", error);
      setIsProcessing(false);
      setStreamingMessage("");
    }
  };

  const startConversation = async () => {
    console.log("startConversation called");
    if (!leftChatbot || !rightChatbot) {
      console.log("Missing chatbot selection:", { leftChatbot, rightChatbot });
      return;
    }

    const leftBot = chatbots.find((bot) => bot.id === leftChatbot);
    const rightBot = chatbots.find((bot) => bot.id === rightChatbot);

    if (!leftBot || !rightBot) {
      console.log("Could not find bot details:", { leftBot, rightBot });
      return;
    }

    console.log("Starting conversation with bots:", {
      leftBot,
      rightBot,
      agent_ask,
    });

    // Set all states first
    setIsConversationStarted(true);
    setIsProcessing(true);
    setIsConversationActive(true);

    // Start with the first AI's question
    const firstBotId = agent_ask === "left" ? leftChatbot : rightChatbot;
    const firstConversationId = agent_ask === "left" ? leftConversationId : rightConversationId;

    console.log("Initiating first AI response:", {
      firstBotId,
      firstConversationId,
      agent_ask,
    });

    // Create the initial message
    const initialMessage: StructuredMessage = {
      role: agent_ask === "left" ? "assistant" : "user",
      content: "Who are you?",
      type: agent_ask === "left" ? "ai" : "human",
      displayContent: "Who are you?",
    };

    // Add the initial message to the conversation
    addMessage(initialMessage);

    // Create the initial payload
    const initialPayload: RagAgentPayload = {
      query: {
        role: "user",
        content: "Who are you?",
      },
      bot_id: firstBotId,
      conversation_id: firstConversationId,
      model_name: agent_ask === "left" ? leftModelName : rightModelName,
    };

    try {
      console.log("Setting up for initial API call");
      setStreamingMessage("");
      setSelectedDocuments([]);
      setIsProcessing(true);

      console.log("Calling RAG agent with initial payload:", initialPayload);

      await sendStreamingRagAgentMessage(
        initialPayload,
        (message: string) => {
          setStreamingMessage(message);
        },
        async (finalData: any) => {
          console.log("Received final data:", finalData);
          setStreamingMessage("");
          if (typeof finalData === "object" && "final_response" in finalData) {
            let responseContent = finalData.final_response;
            let contentForApi = responseContent;

            const imageDocuments = (finalData.selected_documents || []).filter(
              (doc: any) =>
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
                imageDocuments.forEach((doc: any) => {
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
              role: agent_ask === "left" ? "assistant" : "user",
              content: contentItems.length > 1 ? contentItems : contentForApi,
              type: agent_ask === "left" ? "ai" : "human",
              displayContent: responseContent,
            };

            console.log("Adding AI message to conversation:", aiMessage);
            addMessage(aiMessage);
            setSelectedDocuments(finalData.selected_documents || []);
            setIsProcessing(false);

            // Continue the conversation with the other AI
            console.log("isConversationActive 2", isConversationActive);
            if (isConversationActive) {
              const nextBotId = agent_ask === "left" ? rightChatbot : leftChatbot;
              const nextConversationId = agent_ask === "left" ? rightConversationId : leftConversationId;
              console.log("Continuing conversation with next AI:", {
                nextBotId,
                nextConversationId,
                agent_ask: agent_ask === "left" ? "right" : "left",
              });

              // Create the next message payload
              const nextPayload: RagAgentPayload = {
                query: {
                  role: "user",
                  content: responseContent,
                },
                bot_id: nextBotId,
                conversation_id: nextConversationId,
                model_name: agent_ask === "left" ? rightModelName : leftModelName,
              };

              try {
                console.log("Setting up for next AI response");
                setStreamingMessage("");
                setSelectedDocuments([]);
                setIsProcessing(true);

                console.log("Calling RAG agent with next payload:", nextPayload);

                await sendStreamingRagAgentMessage(
                  nextPayload,
                  (message: string) => {
                    setStreamingMessage(message);
                  },
                  async (nextFinalData: any) => {
                    console.log("Received final data from next AI:", nextFinalData);
                    setStreamingMessage("");
                    if (typeof nextFinalData === "object" && "final_response" in nextFinalData) {
                      let nextResponseContent = nextFinalData.final_response;
                      let nextContentForApi = nextResponseContent;

                      const nextImageDocuments = (nextFinalData.selected_documents || []).filter(
                        (doc: any) =>
                          doc.metadata &&
                          doc.metadata.public_url &&
                          doc.metadata.type === "image"
                      );

                      const nextContentItems = [];

                      if (nextResponseContent) {
                        nextContentItems.push({ type: "text", text: nextResponseContent });
                      }

                      if (nextImageDocuments.length > 0) {
                        if (
                          nextResponseContent.includes("[Image]") ||
                          nextResponseContent.includes("[image]")
                        ) {
                          nextImageDocuments.forEach((doc: any) => {
                            nextResponseContent = nextResponseContent.replace(
                              /\[Image\]/i,
                              `![image]\n(${doc.metadata.public_url})`
                            );

                            nextContentItems.push({
                              type: "image",
                              source_type: "url",
                              url: doc.metadata.public_url,
                            });
                          });
                        }
                      }

                      const nextAiMessage: StructuredMessage = {
                        role: agent_ask === "left" ? "user" : "assistant",
                        content: nextContentItems.length > 1 ? nextContentItems : nextContentForApi,
                        type: agent_ask === "left" ? "human" : "ai",
                        displayContent: nextResponseContent,
                      };

                      console.log("Adding next AI message to conversation:", nextAiMessage);
                      addMessage(nextAiMessage);
                      setSelectedDocuments(nextFinalData.selected_documents || []);
                      setIsProcessing(false);

                      // Continue the conversation loop
                      if (isConversationActive) {
                        setTimeout(async () => {
                          if (isConversationActive) {
                            console.log("Continuing with messages:", nextFinalData);
                            await handleAIResponse(
                              firstBotId,
                              firstConversationId,
                              agent_ask === "left"
                            );
                          }
                        }, 2000);
                      }
                    }
                  },
                  (error: string) => {
                    console.error("Error in next AI response:", error);
                    message.error(
                      `Error from ${
                        agent_ask === "left" ? "Right" : "Left"
                      } AI: ${error}`
                    );
                    setIsProcessing(false);
                    setStreamingMessage("");
                  }
                );
              } catch (error) {
                console.error("Error sending message to next AI:", error);
                setIsProcessing(false);
                setStreamingMessage("");
              }
            }
          }
        },
        (error: string) => {
          console.error("Error in AI response:", error);
          message.error(
            `Error from ${agent_ask === "left" ? "Left" : "Right"} AI: ${error}`
          );
          setIsProcessing(false);
          setStreamingMessage("");
        }
      );
    } catch (error) {
      console.error("Error in startConversation:", error);
      message.error("Failed to start conversation");
      setIsProcessing(false);
      setStreamingMessage("");
    }
  };

  const stopConversation = () => {
    setIsConversationActive(true);
    setIsProcessing(false);
    setStreamingMessage("");
    message.info("Conversation stopped");
  };

  const handleBackToSelection = () => {
    setIsConversationStarted(false);
    setMessages([]);
    setIsProcessing(false);
    setIsConversationActive(true);
    setStreamingMessage("");
    setSelectedDocuments([]);
  };

  if (isConversationStarted) {
    const leftBot = chatbots.find((bot) => bot.id === leftChatbot);
    const rightBot = chatbots.find((bot) => bot.id === rightChatbot);

    return (
      <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-gray-100 p-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <Button
                type="text"
                icon={<LeftOutlined />}
                onClick={handleBackToSelection}
                className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                Back to Selection
              </Button>
              <div className="flex items-center gap-12">
                <div className="text-center transform hover:scale-105 transition-transform duration-200">
                  <div className="flex items-center justify-center mb-2">
                    <RobotOutlined className="text-2xl text-blue-500 mr-2" />
                    <Title level={4} className="m-0 text-blue-600">
                      {leftBot?.name}
                    </Title>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Tag color="blue" className="px-4 py-1 text-sm">
                      Left AI
                    </Tag>
                    <Select
                      value={leftModelName}
                      onChange={setLeftModelName}
                      style={{ width: 180 }}
                      options={modelOptions}
                      className="text-sm"
                    />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-400 animate-pulse">
                  VS
                </div>
                <div className="text-center transform hover:scale-105 transition-transform duration-200">
                  <div className="flex items-center justify-center mb-2">
                    <RobotOutlined className="text-2xl text-green-500 mr-2" />
                    <Title level={4} className="m-0 text-green-600">
                      {rightBot?.name}
                    </Title>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Tag color="green" className="px-4 py-1 text-sm">
                      Right AI
                    </Tag>
                    <Select
                      value={rightModelName}
                      onChange={setRightModelName}
                      style={{ width: 180 }}
                      options={modelOptions}
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>
              <Button
                type="primary"
                danger
                icon={<StopOutlined />}
                onClick={stopConversation}
                disabled={!isConversationActive}
                className="bg-red-600 hover:bg-red-700"
              >
                Stop Conversation
              </Button>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-hidden">
          <ChatMessages
            messages={messages}
            streamingMessage={streamingMessage}
            selectedDocuments={selectedDocuments}
            loadingChatbot={isProcessing}
            chatbotDetails={null}
            messagesEndRef={messagesEndRef}
            onRecommendationClick={() => {}}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">AI Combat</h1>
          <p className="text-lg text-gray-600">
            Watch two AI agents engage in an intelligent conversation
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Left Side */}
          <div className="space-y-4 transform hover:scale-105 transition-transform duration-200">
            <Card
              title={
                <div className="flex items-center">
                  <RobotOutlined className="text-blue-500 mr-2" />
                  <span className="text-blue-600">Left AI</span>
                </div>
              }
              className="shadow-lg hover:shadow-xl transition-shadow duration-200"
            >
              <div className="space-y-4">
                <Select
                  className="w-full"
                  placeholder="Select a chatbot"
                  value={leftChatbot}
                  onChange={setLeftChatbot}
                  options={chatbots.map((bot) => ({
                    label: bot.name,
                    value: bot.id,
                  }))}
                />
                <Select
                  className="w-full"
                  value={leftModelName}
                  onChange={setLeftModelName}
                  options={modelOptions}
                />
              </div>
            </Card>
          </div>

          {/* Right Side */}
          <div className="space-y-4 transform hover:scale-105 transition-transform duration-200">
            <Card
              title={
                <div className="flex items-center">
                  <RobotOutlined className="text-green-500 mr-2" />
                  <span className="text-green-600">Right AI</span>
                </div>
              }
              className="shadow-lg hover:shadow-xl transition-shadow duration-200"
            >
              <div className="space-y-4">
                <Select
                  className="w-full"
                  placeholder="Select a chatbot"
                  value={rightChatbot}
                  onChange={setRightChatbot}
                  options={chatbots.map((bot) => ({
                    label: bot.name,
                    value: bot.id,
                  }))}
                />
                <Select
                  className="w-full"
                  value={rightModelName}
                  onChange={setRightModelName}
                  options={modelOptions}
                />
              </div>
            </Card>
          </div>
        </div>

        {/* First Ask Switch */}
        <Card className="mb-8 shadow-lg hover:shadow-xl transition-shadow duration-200">
          <div className="flex items-center justify-center gap-4">
            <Text strong className="text-lg">
              First Asking Agent:
            </Text>
            <Space className="bg-gray-50 p-4 rounded-lg">
              <Text
                className={`text-lg ${
                  agent_ask === "left"
                    ? "text-blue-600 font-medium"
                    : "text-gray-500"
                }`}
              >
                Left AI
              </Text>
              <Switch
                checked={agent_ask === "right"}
                onChange={(checked) => setAgentAsk(checked ? "right" : "left")}
                className="scale-125"
              />
              <Text
                className={`text-lg ${
                  agent_ask === "right"
                    ? "text-green-600 font-medium"
                    : "text-gray-500"
                }`}
              >
                Right AI
              </Text>
            </Space>
          </div>
        </Card>

        <div className="text-center">
          <Button
            type="primary"
            size="large"
            disabled={!leftChatbot || !rightChatbot}
            className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4 h-auto shadow-lg hover:shadow-xl transition-all duration-200"
            onClick={startConversation}
          >
            Start Conversation
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AICombat;
