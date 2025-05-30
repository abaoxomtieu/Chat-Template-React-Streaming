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

// Custom styles for arena combat theme
const arenaStyles = `
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @keyframes glow {
    0%, 100% { text-shadow: 0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor; }
    50% { text-shadow: 0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor; }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-2px); }
    75% { transform: translateX(2px); }
  }
  
  .animate-spin-slow { animation: spin-slow 8s linear infinite; }
  .animate-glow { animation: glow 2s ease-in-out infinite; }
  .animate-float { animation: float 3s ease-in-out infinite; }
  .animate-shake { animation: shake 0.5s ease-in-out infinite; }
  
  .arena-border {
    border-image: linear-gradient(45deg, #ffd700, #ff4500, #8b00ff, #ffd700) 1;
  }
  
  .combat-glow {
    box-shadow: 
      0 0 20px rgba(255, 215, 0, 0.3),
      0 0 40px rgba(255, 69, 0, 0.2),
      0 0 60px rgba(139, 0, 255, 0.1);
  }
`;

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
  // Inject custom styles
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = arenaStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [leftChatbot, setLeftChatbot] = useState<string | null>(null);
  const [rightChatbot, setRightChatbot] = useState<string | null>(null);
  const [messages, setMessages] = useState<StructuredMessage[]>([]);
  const messagesRef = useRef<StructuredMessage[]>([]);
  const [isConversationStarted, setIsConversationStarted] = useState(false);
  const [agent_ask, setAgentAsk] = useState<"left" | "right">("left");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConversationActive, setIsConversationActive] = useState(true);
  const [leftConversationId, setLeftConversationId] = useState<string>("");
  const [rightConversationId, setRightConversationId] = useState<string>("");
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

    // Generate new conversation IDs
    const newLeftConversationId = uuidv4();
    const newRightConversationId = uuidv4();
    setLeftConversationId(newLeftConversationId);
    setRightConversationId(newRightConversationId);

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
    const firstConversationId = agent_ask === "left" ? newLeftConversationId : newRightConversationId;

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
              const nextConversationId = agent_ask === "left" ? newRightConversationId : newLeftConversationId;
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
      <div 
        className="h-screen flex flex-col relative overflow-hidden"
        style={{
          background: `
            radial-gradient(circle at 20% 80%, rgba(255, 69, 0, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 215, 0, 0.3) 0%, transparent 50%),
            linear-gradient(135deg, 
              #1a1a2e 0%, 
              #16213e 25%, 
              #0f3460 50%, 
              #533483 75%, 
              #e94560 100%
            )
          `
        }}
      >
        {/* Arena Background Effects */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full">
            {/* Lightning effects */}
            <div className="absolute top-10 left-10 w-8 h-8 animate-pulse">⚡</div>
            <div className="absolute top-20 right-20 w-8 h-8 animate-pulse delay-300">⚡</div>
            <div className="absolute bottom-20 left-1/4 w-8 h-8 animate-pulse delay-700">⚡</div>
            <div className="absolute bottom-10 right-1/3 w-8 h-8 animate-pulse delay-1000">⚡</div>
            
            {/* Swords */}
            <div className="absolute top-1/4 left-5 text-4xl animate-bounce delay-500">⚔️</div>
            <div className="absolute top-1/3 right-5 text-4xl animate-bounce delay-1500 transform rotate-45">⚔️</div>
            
            {/* Fire effects */}
            <div className="absolute bottom-1/4 left-10 text-2xl animate-pulse delay-200">🔥</div>
            <div className="absolute bottom-1/3 right-10 text-2xl animate-pulse delay-800">🔥</div>
          </div>
        </div>
        
        {/* Animated arena border */}
        <div className="absolute inset-0 border-4 border-gradient-to-r from-yellow-400 via-red-500 to-purple-600 opacity-30 animate-pulse"></div>

        {/* Header */}
        <div className="bg-black/80 backdrop-blur-lg shadow-2xl border-b-4 border-gradient-to-r from-red-500 to-yellow-500 p-4 relative">
          {/* Header glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-transparent to-yellow-500/20 animate-pulse"></div>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <Button
                type="text"
                icon={<LeftOutlined />}
                onClick={handleBackToSelection}
                className="text-yellow-400 hover:text-red-400 transition-colors duration-200 font-bold border border-yellow-400/30 hover:border-red-400/50 bg-black/50"
              >
                Back to Selection
              </Button>
              <div className="flex items-center gap-12">
                <div className="text-center transform hover:scale-105 transition-transform duration-200 relative">
                  {/* Left fighter glow */}
                  <div className="absolute inset-0 bg-blue-500/20 rounded-lg blur-lg animate-pulse"></div>
                  <div className="flex items-center justify-center mb-2">
                    <div className="text-3xl mr-2 animate-bounce">🤖</div>
                    <Title level={4} className="m-0 text-cyan-300 font-bold shadow-lg">
                      {leftBot?.name}
                    </Title>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Tag 
                      className="px-4 py-1 text-sm font-bold border-2 border-cyan-400 bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg"
                    >
                      Left AI
                    </Tag>
                    <Select
                      className="w-full bg-black/50 border-cyan-400"
                      value={leftModelName}
                      onChange={setLeftModelName}
                      style={{ width: 180 }}
                      options={modelOptions}
                    />
                  </div>
                </div>
                <div className="text-6xl font-bold text-yellow-400 animate-pulse shadow-2xl relative">
                  <div className="absolute inset-0 text-red-500 animate-ping opacity-50">⚔️</div>
                  VS
                </div>
                <div className="text-center transform hover:scale-105 transition-transform duration-200 relative">
                  {/* Right fighter glow */}
                  <div className="absolute inset-0 bg-red-500/20 rounded-lg blur-lg animate-pulse delay-500"></div>
                  <div className="flex items-center justify-center mb-2">
                    <div className="text-3xl mr-2 animate-bounce delay-300">🤖</div>
                    <Title level={4} className="m-0 text-red-300 font-bold shadow-lg">
                      {rightBot?.name}
                    </Title>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Tag 
                      className="px-4 py-1 text-sm font-bold border-2 border-red-400 bg-gradient-to-r from-red-600 to-pink-500 text-white shadow-lg"
                    >
                      Right AI
                    </Tag>
                    <Select
                      className="w-full bg-black/50 border-red-400"
                      value={rightModelName}
                      onChange={setRightModelName}
                      style={{ width: 180 }}
                      options={modelOptions}
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
                className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 border-2 border-red-400 shadow-xl font-bold text-lg px-6 py-2 h-auto animate-pulse"
              >
                Stop Conversation
              </Button>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-hidden relative">
          {/* Chat area background effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/30"></div>
          
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
    <div 
      className="min-h-screen p-8 relative overflow-hidden"
      style={{
        background: `
          radial-gradient(circle at 30% 70%, rgba(255, 69, 0, 0.2) 0%, transparent 50%),
          radial-gradient(circle at 70% 30%, rgba(255, 215, 0, 0.2) 0%, transparent 50%),
          linear-gradient(135deg, 
            #0c0c0c 0%, 
            #1a1a2e 25%, 
            #16213e 75%, 
            #533483 100%
          )`
      }}
    >
      {/* Floating combat elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 text-6xl animate-spin-slow">⚔️</div>
        <div className="absolute top-20 right-20 text-4xl animate-pulse">🛡️</div>
        <div className="absolute bottom-20 left-20 text-5xl animate-bounce">⚡</div>
        <div className="absolute bottom-10 right-10 text-6xl animate-spin-slow">🏆</div>
        <div className="absolute top-1/2 left-5 text-3xl animate-pulse delay-500">🔥</div>
        <div className="absolute top-1/3 right-5 text-3xl animate-pulse delay-1000">💥</div>
      </div>
      
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600 mb-4 animate-glow">
            ⚔️ AI COMBAT ARENA ⚔️
          </h1>
          <p className="text-xl text-yellow-300 font-semibold shadow-lg">
            Watch two AI agents engage in an intelligent conversation
          </p>
          <div className="mt-4 text-4xl animate-float">🏟️</div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Left Side */}
          <div className="space-y-4 transform hover:scale-105 transition-transform duration-200 relative">
            {/* Fighter card glow effect */}
            <div className="absolute inset-0 bg-blue-500/10 rounded-lg blur-xl animate-pulse combat-glow"></div>
            <Card
              title={
                <div className="flex items-center">
                  <div className="text-2xl mr-2 animate-float">🤖</div>
                  <span className="text-cyan-300 font-bold text-xl">Left Fighter</span>
                  <div className="text-2xl ml-2 animate-shake">⚔️</div>
                </div>
              }
              className="shadow-2xl hover:shadow-cyan-500/50 transition-shadow duration-200 bg-gradient-to-br from-blue-900/80 to-cyan-800/80 border-2 border-cyan-400/50 backdrop-blur-sm combat-glow"
              bodyStyle={{ background: 'rgba(0, 0, 0, 0.3)' }}
            >
              <div className="space-y-4">
                <Select
                  className="w-full bg-black/50 border-cyan-400"
                  placeholder="Select a chatbot"
                  value={leftChatbot}
                  onChange={setLeftChatbot}
                  options={chatbots.map((bot) => ({
                    label: bot.name,
                    value: bot.id,
                  }))}
                />
                <Select
                  className="w-full bg-black/50 border-cyan-400"
                  value={leftModelName}
                  onChange={setLeftModelName}
                  options={modelOptions}
                />
              </div>
            </Card>
          </div>

          {/* Right Side */}
          <div className="space-y-4 transform hover:scale-105 transition-transform duration-200 relative">
            {/* Fighter card glow effect */}
            <div className="absolute inset-0 bg-red-500/10 rounded-lg blur-xl animate-pulse delay-500 combat-glow"></div>
            <Card
              title={
                <div className="flex items-center">
                  <div className="text-2xl mr-2 animate-float delay-300">🤖</div>
                  <span className="text-red-300 font-bold text-xl">Right Fighter</span>
                  <div className="text-2xl ml-2 animate-shake delay-500">⚔️</div>
                </div>
              }
              className="shadow-2xl hover:shadow-red-500/50 transition-shadow duration-200 bg-gradient-to-br from-red-900/80 to-pink-800/80 border-2 border-red-400/50 backdrop-blur-sm combat-glow"
              bodyStyle={{ background: 'rgba(0, 0, 0, 0.3)' }}
            >
              <div className="space-y-4">
                <Select
                  className="w-full bg-black/50 border-red-400"
                  placeholder="Select a chatbot"
                  value={rightChatbot}
                  onChange={setRightChatbot}
                  options={chatbots.map((bot) => ({
                    label: bot.name,
                    value: bot.id,
                  }))}
                />
                <Select
                  className="w-full bg-black/50 border-red-400"
                  value={rightModelName}
                  onChange={setRightModelName}
                  options={modelOptions}
                />
              </div>
            </Card>
          </div>
        </div>

        {/* First Ask Switch */}
        <Card 
          className="mb-8 shadow-2xl hover:shadow-yellow-500/30 transition-shadow duration-200 bg-gradient-to-r from-purple-900/80 to-indigo-900/80 border-2 border-yellow-400/50 backdrop-blur-sm combat-glow"
          bodyStyle={{ background: 'rgba(0, 0, 0, 0.3)' }}
        >
          <div className="flex items-center justify-center gap-4">
            <Text strong className="text-xl text-yellow-300 font-bold">
              ⚔️
            </Text>
            <Text strong className="text-xl text-yellow-300 font-bold">
              First Asking Agent:
            </Text>
            <Space className="bg-black/50 p-4 rounded-lg border border-yellow-400/30">
              <Text
                className={`text-lg font-bold ${
                  agent_ask === "left" ? "text-cyan-400" : "text-gray-400"
                }`}
              >
                🤖
                Left AI
              </Text>
              <Switch
                checked={agent_ask === "right"}
                onChange={(checked) => setAgentAsk(checked ? "right" : "left")}
                className="scale-125 bg-yellow-600"
              />
              <Text
                className={`text-lg font-bold ${
                  agent_ask === "right" ? "text-red-400" : "text-gray-400"
                }`}
              >
                Right AI
                🤖
              </Text>
            </Space>
            <Text strong className="text-xl text-yellow-300 font-bold">
              ⚔️
            </Text>
          </div>
        </Card>

        <div className="text-center">
          <Button
            type="primary"
            size="large"
            disabled={!leftChatbot || !rightChatbot}
            className="bg-gradient-to-r from-yellow-500 via-red-500 to-purple-600 hover:from-yellow-600 hover:via-red-600 hover:to-purple-700 text-white text-xl font-bold px-12 py-6 h-auto shadow-2xl hover:shadow-yellow-500/50 transition-all duration-200 border-2 border-yellow-400 animate-glow combat-glow"
            onClick={startConversation}
          >
            ⚔️ 
            Start Conversation
            🏟️
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AICombat;
