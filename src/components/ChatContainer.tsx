import React, { useState, useRef, useEffect } from "react";
import { Avatar, Input, Switch } from "antd";
import {
  SendOutlined,
  DeleteOutlined,
  ThunderboltOutlined,
  RobotOutlined,
} from "@ant-design/icons";
import ChatMessage from "./ChatMessage";
import {
  ChatMessage as ChatMessageType,
  PrimaryChatPayload,
  sendPrimaryChatMessage,
  sendStreamingChatMessage,
} from "../services/chatService";
import ReactMarkdown from "react-markdown";

const { TextArea } = Input;
const CHAT_HISTORY_KEY = "chat_history";
const LESSON_DATA_KEY = "lesson_data";

const ChatContainer: React.FC = () => {
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
  const [input, setInput] = useState(
    'Soạn giáo án cho bài 4 "Tỉ Số", toán lớp 5'
  );
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(true);
  const [streamingMessage, setStreamingMessage] = useState("");

  // Load lesson data from localStorage on initial render
  const [lessonName, setLessonName] = useState<string | null>(() => {
    const savedLessonData = localStorage.getItem(LESSON_DATA_KEY);
    if (savedLessonData) {
      try {
        const data = JSON.parse(savedLessonData);
        return data.lesson_name || null;
      } catch (error) {
        return null;
      }
    }
    return null;
  });

  const [subjectName, setSubjectName] = useState<string | null>(() => {
    const savedLessonData = localStorage.getItem(LESSON_DATA_KEY);
    if (savedLessonData) {
      try {
        const data = JSON.parse(savedLessonData);
        return data.subject_name || null;
      } catch (error) {
        return null;
      }
    }
    return null;
  });

  const [classNumber, setClassNumber] = useState<number | null>(() => {
    const savedLessonData = localStorage.getItem(LESSON_DATA_KEY);
    if (savedLessonData) {
      try {
        const data = JSON.parse(savedLessonData);
        return data.class_number ? parseInt(data.class_number) : null;
      } catch (error) {
        return null;
      }
    }
    return null;
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // console.log("stream", streamingMessage)
  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
  }, [messages]);

  // Save lesson data to localStorage whenever it changes
  useEffect(() => {
    const lessonData = {
      lesson_name: lessonName,
      subject_name: subjectName,
      class_number: classNumber,
    };
    localStorage.setItem(LESSON_DATA_KEY, JSON.stringify(lessonData));
  }, [lessonName, subjectName, classNumber]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleStreamingChat = async (payload: PrimaryChatPayload) => {
    try {
      setStreamingMessage("");
      await sendStreamingChatMessage(
        payload,
        (message: string) => {
          setStreamingMessage(message);
        },
        (finalData: {
          final_response: string;
          lesson_name?: string;
          subject_name?: string;
          class_number?: string;
        }) => {
          setStreamingMessage("");
          if (typeof finalData === "object" && "final_response" in finalData) {
            const aiMessage: ChatMessageType = {
              content: finalData.final_response,
              type: "ai",
            };
            setMessages((prev) => [...prev, aiMessage]);
            setLoading(false);

            // Update lesson details if provided
            if (finalData.lesson_name) setLessonName(finalData.lesson_name);
            if (finalData.subject_name) setSubjectName(finalData.subject_name);
            if (finalData.class_number) {
              setClassNumber(parseInt(finalData.class_number));
            }
          }
        },
        (error: string) => {
          console.error("Streaming error:", error);
          setStreamingMessage("");
          setMessages((prev) => [
            ...prev,
            { content: `Error: ${error}`, type: "ai" },
          ]);
          setLoading(false);
        }
      );
    } catch (error) {
      console.error("Error in streaming chat:", error);
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessageType = { content: input, type: "human" };
    setStreamingMessage("");
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Create a payload for the primary chat API
      const payload: PrimaryChatPayload = {
        history: [...messages],
        query: input,
        lesson_name: lessonName,
        subject_name: subjectName,
        class_number: classNumber,
      };

      if (isStreaming) {
        await handleStreamingChat(payload);
      } else {
        const response = await sendPrimaryChatMessage(payload);

        // The response could contain updated lesson details
        if (response) {
          console.log("Response from primary chat:", response);

          // If the response includes lesson details, update state
          if (response.lesson_name) {
            setLessonName(response.lesson_name);
          }

          if (response.subject_name) {
            setSubjectName(response.subject_name);
          }

          if (response.class_number) {
            setClassNumber(
              typeof response.class_number === "string"
                ? parseInt(response.class_number)
                : response.class_number
            );
          }
        }

        // Create AI message from response content
        const aiMessage: ChatMessageType = {
          content:
            typeof response === "string"
              ? response
              : response.final_response || response.content || response,
          type: "ai",
        };

        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      // Add error message to chat
      const errorMessage: ChatMessageType = {
        content:
          "Sorry, I encountered an error processing your request. Please try again.",
        type: "ai",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      setStreamingMessage("");
      e.preventDefault();
      handleSend();
    }
  };

  const clearHistory = () => {
    localStorage.removeItem(CHAT_HISTORY_KEY);
    localStorage.removeItem(LESSON_DATA_KEY);
    setMessages([]);
    setLessonName(null);
    setSubjectName(null);
    setStreamingMessage("");
    setClassNumber(null);
  };

  return (
    <>
      <>
        <div className="bg-purple-50 p-3 rounded-lg border border-purple-100 mb-4">
          <h3 className="text-sm font-medium text-purple-800 mb-2">
            Current Lesson Information:
          </h3>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <span className="font-medium">Class:</span>{" "}
              {classNumber ? classNumber : "Not set"}
            </div>
            <div>
              <span className="font-medium">Subject:</span>{" "}
              {subjectName ? subjectName : "Not set"}
            </div>
            <div>
              <span className="font-medium">Lesson:</span>{" "}
              {lessonName ? lessonName : "Not set"}
            </div>
          </div>
        </div>

        {messages.length > 0 && (
          <div className="flex justify-end p-2">
            <button
              onClick={clearHistory}
              className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-150"
            >
              <DeleteOutlined className="text-sm" />
              <span>Clear History</span>
            </button>
          </div>
        )}
      </>
      <div className="flex flex-col h-screen max-w-5xl mx-auto px-4">
        {/* Fixed Header */}
        <div className="flex-none py-4 bg-white/80 backdrop-blur-sm border-b border-purple-100">
          {/* Display current lesson information */}
          <div className="flex items-center justify-between gap-4 mb-2">
            <div className="flex-1">
              {lessonName && (
                <h2 className="text-lg font-semibold text-gray-900">
                  {lessonName}
                </h2>
              )}
              {(subjectName || classNumber) && (
                <p className="text-sm text-gray-600">
                  {subjectName} {classNumber && `- Lớp ${classNumber}`}
                </p>
              )}
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
            <div className="flex items-center justify-end gap-2 mb-2">
              <span className="text-sm text-gray-600 flex items-center gap-1">
                <ThunderboltOutlined
                  className={isStreaming ? "text-yellow-500" : "text-gray-400"}
                />
                Streaming
              </span>
              <Switch
                checked={isStreaming}
                onChange={setIsStreaming}
                size="small"
                className={isStreaming ? "bg-yellow-500" : ""}
              />
            </div>
            <div className="flex items-center gap-2 bg-white rounded-2xl shadow-sm border border-purple-100 p-2">
              <TextArea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here..."
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

export default ChatContainer;
