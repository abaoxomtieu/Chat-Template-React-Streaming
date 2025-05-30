import { useRef, useState } from "react";
import { message } from "antd";
import { v4 as uuidv4 } from "uuid";
import {
  sendStreamingRagAgentMessage,
  RagAgentPayload,
} from "../services/ragAgentService";

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

interface UseAICombatProps {
  leftChatbot: string | null;
  rightChatbot: string | null;
  leftModelName: string;
  rightModelName: string;
  agent_ask: "left" | "right";
}

export const useAICombat = ({
  leftChatbot,
  rightChatbot,
  leftModelName,
  rightModelName,
  agent_ask,
}: UseAICombatProps) => {
  const [messages, setMessages] = useState<StructuredMessage[]>([]);
  const messagesRef = useRef<StructuredMessage[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isConversationActiveRef = useRef<boolean>(true);
  const timeoutIdsRef = useRef<NodeJS.Timeout[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConversationActive, setIsConversationActive] = useState(true);
  const [leftConversationId, setLeftConversationId] = useState<string>("");
  const [rightConversationId, setRightConversationId] = useState<string>("");
  const [streamingMessage, setStreamingMessage] = useState("");
  const [selectedDocuments, setSelectedDocuments] = useState<any[]>([]);

  // Sync ref with state
  const updateConversationActive = (active: boolean) => {
    setIsConversationActive(active);
    isConversationActiveRef.current = active;
  };

  const addMessage = (message: StructuredMessage) => {
    const updatedMessages = [...messagesRef.current, message];
    messagesRef.current = updatedMessages;
    setMessages(updatedMessages);
    return updatedMessages;
  };

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

    if (!isConversationActiveRef.current || !leftChatbot || !rightChatbot) {
      console.log("Conversation not active or missing chatbots:", {
        isConversationActive: isConversationActiveRef.current,
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

      // Create new AbortController for this request
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      console.log("Calling RAG agent with payload:", payload);

      await sendStreamingRagAgentMessage(
        payload,
        (message: string) => {
          if (
            isConversationActiveRef.current &&
            !abortController.signal.aborted
          ) {
            setStreamingMessage(message);
          }
        },
        async (finalData: any) => {
          console.log("Received final data:", finalData);

          if (
            !isConversationActiveRef.current ||
            abortController.signal.aborted
          ) {
            console.log(
              "Conversation stopped or aborted, aborting AI response processing"
            );
            setStreamingMessage("");
            setIsProcessing(false);
            return;
          }

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
            console.log(
              "isConversationActive 2",
              isConversationActiveRef.current
            );
            if (
              isConversationActiveRef.current &&
              !abortController.signal.aborted
            ) {
              const nextBotId = isLeft ? rightChatbot : leftChatbot;
              const nextConversationId = isLeft
                ? rightConversationId
                : leftConversationId;
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

                console.log(
                  "Calling RAG agent with next payload:",
                  nextPayload
                );

                await sendStreamingRagAgentMessage(
                  nextPayload,
                  (message: string) => {
                    if (isConversationActiveRef.current) {
                      setStreamingMessage(message);
                    }
                  },
                  async (nextFinalData: any) => {
                    console.log(
                      "Received final data from next AI:",
                      nextFinalData
                    );

                    if (!isConversationActiveRef.current) {
                      console.log(
                        "Conversation stopped, aborting next AI response processing"
                      );
                      setStreamingMessage("");
                      setIsProcessing(false);
                      return;
                    }

                    setStreamingMessage("");
                    if (
                      typeof nextFinalData === "object" &&
                      "final_response" in nextFinalData
                    ) {
                      let nextResponseContent = nextFinalData.final_response;
                      let nextContentForApi = nextResponseContent;

                      const nextImageDocuments = (
                        nextFinalData.selected_documents || []
                      ).filter(
                        (doc: any) =>
                          doc.metadata &&
                          doc.metadata.public_url &&
                          doc.metadata.type === "image"
                      );

                      const nextContentItems = [];

                      if (nextResponseContent) {
                        nextContentItems.push({
                          type: "text",
                          text: nextResponseContent,
                        });
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
                        content:
                          nextContentItems.length > 1
                            ? nextContentItems
                            : nextContentForApi,
                        type: !isLeft ? "ai" : "human",
                        displayContent: nextResponseContent,
                      };

                      console.log(
                        "Adding next AI message to conversation:",
                        nextAiMessage
                      );
                      addMessage(nextAiMessage);
                      setSelectedDocuments(
                        nextFinalData.selected_documents || []
                      );
                      setIsProcessing(false);

                      // Continue the conversation loop
                      if (isConversationActiveRef.current) {
                        console.log(
                          "Setting timeout for next conversation round..."
                        );
                        const timeoutId = setTimeout(async () => {
                          if (isConversationActiveRef.current) {
                            console.log(
                              "Timeout complete, continuing with messages:",
                              nextFinalData
                            );
                            await handleAIResponse(
                              botId,
                              conversationId,
                              isLeft
                            );
                          } else {
                            console.log(
                              "Conversation stopped during timeout, not continuing"
                            );
                          }
                        }, 3000);
                        timeoutIdsRef.current.push(timeoutId);
                      } else {
                        console.log(
                          "Conversation not active, not setting timeout"
                        );
                      }
                    }
                  },
                  (error: string) => {
                    console.error("Error in next AI response:", error);
                    message.error(
                      `Error from ${!isLeft ? "Left" : "Right"} AI: ${error}`
                    );
                    setIsProcessing(false);
                    setStreamingMessage("");
                  },
                  abortController.signal
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
        },
        abortController.signal
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

    // Generate new conversation IDs
    const newLeftConversationId = uuidv4();
    const newRightConversationId = uuidv4();
    setLeftConversationId(newLeftConversationId);
    setRightConversationId(newRightConversationId);

    console.log("Starting conversation with bots:", {
      leftChatbot,
      rightChatbot,
      agent_ask,
    });

    // Set all states first
    setIsProcessing(true);
    updateConversationActive(true);

    // Start with the first AI's question
    const firstBotId = agent_ask === "left" ? leftChatbot : rightChatbot;
    const firstConversationId =
      agent_ask === "left" ? newLeftConversationId : newRightConversationId;

    console.log("Initiating first AI response:", {
      firstBotId,
      firstConversationId,
      agent_ask,
    });

    // Create the initial message
    const initialMessage: StructuredMessage = {
      role: agent_ask === "left" ? "assistant" : "user",
      content: "Mày là ai",
      type: agent_ask === "left" ? "ai" : "human",
      displayContent: "Mày là ai",
    };

    // Add the initial message to the conversation
    addMessage(initialMessage);

    // Create the initial payload
    const initialPayload: RagAgentPayload = {
      query: {
        role: "user",
        content: "Mày là ai",
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
          if (isConversationActiveRef.current) {
            setStreamingMessage(message);
          }
        },
        async (finalData: any) => {
          console.log("Received final data:", finalData);

          if (!isConversationActiveRef.current) {
            console.log(
              "Conversation stopped, aborting startConversation processing"
            );
            setStreamingMessage("");
            setIsProcessing(false);
            return;
          }

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
            console.log(
              "isConversationActive 2",
              isConversationActiveRef.current
            );
            if (
              isConversationActiveRef.current &&
              !abortControllerRef.current?.signal.aborted
            ) {
              const nextBotId =
                agent_ask === "left" ? rightChatbot : leftChatbot;
              const nextConversationId =
                agent_ask === "left"
                  ? newRightConversationId
                  : newLeftConversationId;
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
                model_name:
                  agent_ask === "left" ? rightModelName : leftModelName,
              };

              try {
                console.log("Setting up for next AI response");
                setStreamingMessage("");
                setSelectedDocuments([]);
                setIsProcessing(true);

                console.log(
                  "Calling RAG agent with next payload:",
                  nextPayload
                );

                await sendStreamingRagAgentMessage(
                  nextPayload,
                  (message: string) => {
                    if (isConversationActiveRef.current) {
                      setStreamingMessage(message);
                    }
                  },
                  async (nextFinalData: any) => {
                    console.log(
                      "Received final data from next AI:",
                      nextFinalData
                    );

                    if (!isConversationActiveRef.current) {
                      console.log(
                        "Conversation stopped, aborting next AI response processing"
                      );
                      setStreamingMessage("");
                      setIsProcessing(false);
                      return;
                    }

                    setStreamingMessage("");
                    if (
                      typeof nextFinalData === "object" &&
                      "final_response" in nextFinalData
                    ) {
                      let nextResponseContent = nextFinalData.final_response;
                      let nextContentForApi = nextResponseContent;

                      const nextImageDocuments = (
                        nextFinalData.selected_documents || []
                      ).filter(
                        (doc: any) =>
                          doc.metadata &&
                          doc.metadata.public_url &&
                          doc.metadata.type === "image"
                      );

                      const nextContentItems = [];

                      if (nextResponseContent) {
                        nextContentItems.push({
                          type: "text",
                          text: nextResponseContent,
                        });
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
                        content:
                          nextContentItems.length > 1
                            ? nextContentItems
                            : nextContentForApi,
                        type: agent_ask === "left" ? "human" : "ai",
                        displayContent: nextResponseContent,
                      };

                      console.log(
                        "Adding next AI message to conversation:",
                        nextAiMessage
                      );
                      addMessage(nextAiMessage);
                      setSelectedDocuments(
                        nextFinalData.selected_documents || []
                      );
                      setIsProcessing(false);

                      // Continue the conversation loop
                      if (isConversationActiveRef.current) {
                        console.log(
                          "Setting timeout for next conversation round..."
                        );
                        const timeoutId = setTimeout(async () => {
                          if (isConversationActiveRef.current) {
                            console.log(
                              "Timeout complete, continuing with messages:",
                              nextFinalData
                            );
                            await handleAIResponse(
                              firstBotId,
                              firstConversationId,
                              agent_ask === "left"
                            );
                          } else {
                            console.log(
                              "Conversation stopped during timeout, not continuing"
                            );
                          }
                        }, 3000);
                        timeoutIdsRef.current.push(timeoutId);
                      } else {
                        console.log(
                          "Conversation not active, not setting timeout"
                        );
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
                  },
                  abortControllerRef.current?.signal
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
        },
        abortControllerRef.current?.signal
      );
    } catch (error) {
      console.error("Error in startConversation:", error);
      message.error("Failed to start conversation");
      setIsProcessing(false);
      setStreamingMessage("");
    }
  };

  const stopConversation = () => {
    console.log("Stopping conversation...");
    updateConversationActive(false);
    setIsProcessing(false);
    setStreamingMessage("");

    // Clear all timeouts
    timeoutIdsRef.current.forEach((timeoutId) => {
      console.log("Clearing timeout:", timeoutId);
      clearTimeout(timeoutId);
    });
    timeoutIdsRef.current = [];

    // Cancel any ongoing requests
    if (abortControllerRef.current) {
      console.log("Aborting ongoing request...");
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    message.success("Conversation stopped successfully");
  };

  const resetConversation = () => {
    setMessages([]);
    messagesRef.current = [];
    setIsProcessing(false);
    updateConversationActive(true);
    setStreamingMessage("");
    setSelectedDocuments([]);
    setLeftConversationId("");
    setRightConversationId("");

    // Clear all timeouts
    timeoutIdsRef.current.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    timeoutIdsRef.current = [];

    // Reset abort controller
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  return {
    // States
    messages,
    isProcessing,
    isConversationActive,
    streamingMessage,
    selectedDocuments,
    leftConversationId,
    rightConversationId,
    messagesRef,

    // Actions
    startConversation,
    stopConversation,
    resetConversation,
    handleAIResponse,
    addMessage,
  };
};
