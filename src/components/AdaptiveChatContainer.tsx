import React, { useState, useRef, useEffect } from "react";
import { Avatar, Input, Switch, Tag } from "antd";
import {
  SendOutlined,
  DeleteOutlined,
  ThunderboltOutlined,
  RobotOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import ReactMarkdown from "react-markdown";

import {
  ChatMessage as ChatMessageType,
  AdaptiveChatPayload,
  sendAdaptiveChatMessage,
  sendStreamingAdaptiveChatMessage,
} from "../services/adaptiveChatService";

// Simple chat message display component
const SimpleMessage: React.FC<{ 
  message: string; 
  isBot: boolean; 
  className?: string 
}> = ({ message, isBot, className = "" }) => {
  return (
    <div className={`flex justify-center ${className}`}>
      <div className={`py-4 w-2/3 rounded-2xl ${isBot ? "bg-gray-100" : "bg-white"}`}>
        <div className="max-w-3xl mx-auto flex gap-4 px-4">
          <Avatar
            icon={isBot ? <RobotOutlined /> : <SendOutlined />}
            className={`${isBot ? "bg-blue-500" : "bg-green-500"} text-white`}
            size={32}
          />
          <div className="flex-1 text-gray-800 text-sm leading-relaxed">
            {isBot ? (
              <div className="w-full">
                <ReactMarkdown>{message.replace(/\n/g, "  \n")}</ReactMarkdown>
              </div>
            ) : (
              <div className="whitespace-pre-line">{message}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const { TextArea } = Input;
const CHAT_HISTORY_KEY = "adaptive_chat_history";
const SESSION_DATA_KEY = "adaptive_session_data";

const AdaptiveChatContainer: React.FC = () => {
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
  const [sessionId, setSessionId] = useState<string | null>(() => {
    const savedSessionData = localStorage.getItem(SESSION_DATA_KEY);
    if (savedSessionData) {
      try {
        const data = JSON.parse(savedSessionData);
        return data.session_id || null;
      } catch (error) {
        return null;
      }
    }
    return null;
  });
  
  const [systemPrompt, setSystemPrompt] = useState<string | null>(() => {
    const savedSessionData = localStorage.getItem(SESSION_DATA_KEY);
    if (savedSessionData) {
      try {
        const data = JSON.parse(savedSessionData);
        return data.system_prompt || null;
      } catch (error) {
        return null;
      }
    }
    return null;
  });
  
  const [userProfile, setUserProfile] = useState<Record<string, any>>(() => {
    const savedSessionData = localStorage.getItem(SESSION_DATA_KEY);
    if (savedSessionData) {
      try {
        const data = JSON.parse(savedSessionData);
        return data.user_profile || {};
      } catch (error) {
        return {};
      }
    }
    return {};
  });
  
  const [probingQuestions, setProbingQuestions] = useState<string[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
  }, [messages]);
  
  // Save session data to localStorage whenever it changes
  useEffect(() => {
    const sessionData = {
      session_id: sessionId,
      system_prompt: systemPrompt,
      user_profile: userProfile,
    };
    localStorage.setItem(SESSION_DATA_KEY, JSON.stringify(sessionData));
  }, [sessionId, systemPrompt, userProfile]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);
  
  const handleStreamingChat = async (payload: AdaptiveChatPayload) => {
    try {
      setStreamingMessage("");
      await sendStreamingAdaptiveChatMessage(
        payload,
        (message: string) => {
          setStreamingMessage(message);
        },
        (finalData: {
          bot_message?: string;
          updated_system_prompt?: string;
          session_id?: string;
          probing_questions?: string[];
          user_profile_updates?: Record<string, any>;
        }) => {
          setStreamingMessage("");
          
          // Handle probing questions if they exist
          if (finalData.probing_questions && finalData.probing_questions.length > 0) {
            setProbingQuestions(finalData.probing_questions);
          } else if (finalData.bot_message) {
            const aiMessage: ChatMessageType = {
              content: finalData.bot_message,
              type: "ai",
            };
            setMessages((prev) => [...prev, aiMessage]);
            setProbingQuestions([]);
          }
          
          // Update session data if provided
          if (finalData.session_id) setSessionId(finalData.session_id);
          if (finalData.updated_system_prompt) setSystemPrompt(finalData.updated_system_prompt);
          if (finalData.user_profile_updates) setUserProfile(finalData.user_profile_updates);
          
          setLoading(false);
        },
        (error: string) => {
          console.error("Streaming error:", error);
          setStreamingMessage("");
          setMessages((prev) => [
            ...prev,
            { content: `Error: ${error}`, type: "ai" } as ChatMessageType,
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
    setProbingQuestions([]);
    
    try {
      // Create a payload for the adaptive chat API
      const payload: AdaptiveChatPayload = {
        query: input,
        session_id: sessionId || undefined,
        history: [...messages],
        current_system_prompt: systemPrompt || undefined,
        user_profile: Object.keys(userProfile).length > 0 ? userProfile : undefined,
      };
      
      if (isStreaming) {
        await handleStreamingChat(payload);
      } else {
        const response = await sendAdaptiveChatMessage(payload);
        
        // Handle probing questions if they exist
        if (response.probing_questions && response.probing_questions.length > 0) {
          setProbingQuestions(response.probing_questions);
        } else if (response.bot_message) {
          const aiMessage: ChatMessageType = {
            content: response.bot_message,
            type: "ai",
          };
          setMessages((prev) => [...prev, aiMessage]);
        }
        
        // Update session data
        if (response.session_id) setSessionId(response.session_id);
        if (response.updated_system_prompt) setSystemPrompt(response.updated_system_prompt);
        if (response.user_profile_updates) setUserProfile(response.user_profile_updates);
        
        setLoading(false);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      // Add error message to chat
      setMessages((prev) => [
        ...prev,
        { content: "Sorry, I encountered an error processing your request. Please try again.", type: "ai" } as ChatMessageType,
      ]);
      setLoading(false);
    }
  };
  
  const handleSelectProbingQuestion = (question: string) => {
    setInput(question);
    setProbingQuestions([]);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const clearHistory = () => {
    localStorage.removeItem(CHAT_HISTORY_KEY);
    localStorage.removeItem(SESSION_DATA_KEY);
    setMessages([]);
    setSessionId(null);
    setSystemPrompt(null);
    setUserProfile({});
    setStreamingMessage("");
    setProbingQuestions([]);
  };
  
  return (
    <>
      <div className="flex flex-col h-full">
        {/* User Profile Information */}
        {Object.keys(userProfile).length > 0 && (
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              User Profile:
            </h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(userProfile).map(([key, value]) => (
                <Tag key={key} color="blue">
                  {key}: {typeof value === 'string' ? value : JSON.stringify(value)}
                </Tag>
              ))}
            </div>
          </div>
        )}
        
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <SimpleMessage
              key={index}
              message={message.content}
              isBot={message.type === "ai"}
            />
          ))}
          
          {/* Streaming message */}
          {streamingMessage && (
            <SimpleMessage
              message={streamingMessage}
              isBot={true}
              className="animate-pulse"
            />
          )}
          
          {/* Probing questions */}
          {probingQuestions.length > 0 && (
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-3">
                <QuestionCircleOutlined className="text-purple-500" />
                <span className="font-medium text-purple-700">
                  To better assist you, please select one of the following questions:
                </span>
              </div>
              <div className="space-y-2">
                {probingQuestions.map((question, index) => (
                  <div
                    key={index}
                    onClick={() => handleSelectProbingQuestion(question)}
                    className="p-2 bg-white rounded-md border border-purple-200 hover:bg-purple-100 cursor-pointer transition-colors"
                  >
                    {question}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input area */}
        <div className="p-4 border-t">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center space-x-2">
              <Switch
                checked={isStreaming}
                onChange={setIsStreaming}
                size="small"
              />
              <span className="text-xs text-gray-500">
                {isStreaming ? "Streaming enabled" : "Streaming disabled"}
              </span>
            </div>
            <button
              onClick={clearHistory}
              className="text-red-500 hover:text-red-700 transition-colors text-sm flex items-center"
            >
              <DeleteOutlined className="mr-1" /> Clear history
            </button>
          </div>
          
          <div className="flex items-end space-x-2">
            <TextArea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message here..."
              autoSize={{ minRows: 1, maxRows: 5 }}
              disabled={loading}
              className="flex-1 resize-none"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className={`p-2 rounded-full ${
                !input.trim() || loading
                  ? "bg-gray-300 text-gray-500"
                  : "bg-purple-600 text-white hover:bg-purple-700"
              } transition-colors`}
            >
              <SendOutlined />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdaptiveChatContainer; 