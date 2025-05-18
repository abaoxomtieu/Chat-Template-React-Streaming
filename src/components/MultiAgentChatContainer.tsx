import React, { useState, useRef, useEffect, useCallback } from "react";
import { Avatar, Input, Switch, Collapse, Spin, Tabs, Button, message } from "antd";
import {
  SendOutlined,
  DeleteOutlined,
  ThunderboltOutlined,
  RobotOutlined,
  DatabaseOutlined,
  BulbOutlined,
  CodeOutlined,
  BugOutlined,
} from "@ant-design/icons";
import ReactMarkdown from "react-markdown";

import {
  ChatMessage as ChatMessageType,
} from "../services/chatService";

import {
  MultiAgentChatPayload,
  sendMultiAgentChatMessage,
  sendStreamingMultiAgentChatMessage,
} from "../services/multiAgentService";

const { TextArea } = Input;
const { Panel } = Collapse;
const { TabPane } = Tabs;

const CHAT_HISTORY_KEY = "multi_agent_chat_history";
const SESSION_DATA_KEY = "multi_agent_session_data";

// Simple chat message component
const ChatMessage: React.FC<{ 
  message: ChatMessageType;
}> = ({ message }) => {
  const isAi = message.type === "ai";
  
  return (
    <div className="flex justify-center">
      <div className={`py-4 w-full rounded-2xl ${isAi ? "bg-gray-100" : "bg-white"}`}>
        <div className="max-w-3xl mx-auto flex gap-4 px-4">
          <Avatar
            icon={isAi ? <RobotOutlined /> : <SendOutlined />}
            className={`${isAi ? "bg-blue-500" : "bg-green-500"} text-white`}
            size={32}
          />
          <div className="flex-1 text-gray-800 text-sm leading-relaxed">
            {isAi ? (
              <div className="w-full">
                <ReactMarkdown>{message.content.replace(/\n/g, "  \n")}</ReactMarkdown>
              </div>
            ) : (
              <div className="whitespace-pre-line">{message.content}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const MultiAgentChatContainer: React.FC = () => {
  // State for chat messages
  const [messages, setMessages] = useState<ChatMessageType[]>(() => {
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
  
  // State for input and UI
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(true);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [debugLog, setDebugLog] = useState<string[]>([]);
  
  // State for multi-agent data
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [systemPrompt, setSystemPrompt] = useState<string | null>(null);
  const [collectedData, setCollectedData] = useState<Array<{ source: string; content: string }>>([]);
  const [analysisResults, setAnalysisResults] = useState<string>("");
  const [isCollectingData, setIsCollectingData] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  
  // Reference for the current cleanup function
  const cleanupFunctionRef = useRef<(() => void) | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Save messages to localStorage
  useEffect(() => {
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
  }, [messages]);
  
  // Save session data to localStorage
  useEffect(() => {
    const sessionData = {
      session_id: sessionId,
      system_prompt: systemPrompt,
      collected_data: collectedData,
      analysis_results: analysisResults,
    };
    localStorage.setItem(SESSION_DATA_KEY, JSON.stringify(sessionData));
  }, [sessionId, systemPrompt, collectedData, analysisResults]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cleanupFunctionRef.current) {
        addDebugLog("Component unmounting, cleaning up EventSource");
        cleanupFunctionRef.current();
        cleanupFunctionRef.current = null;
      }
    };
  }, []);
  
  // Scroll to bottom on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);
  
  // Debug helper
  const addDebugLog = useCallback((log: string) => {
    setDebugLog(prev => [...prev, `${new Date().toISOString().split('T')[1].split('.')[0]} - ${log}`]);
    console.log(log); // Also log to console for easier debugging
  }, []);
  
  // Handle streaming chat response
  const handleStreamingChat = useCallback(async (payload: MultiAgentChatPayload) => {
    try {
      // Clean up any existing connection
      if (cleanupFunctionRef.current) {
        addDebugLog("Cleaning up previous EventSource before starting new one");
        cleanupFunctionRef.current();
        cleanupFunctionRef.current = null;
      }
      
      setStreamingMessage("");
      addDebugLog(`Starting streaming chat with payload: ${JSON.stringify(payload)}`);
      
      // Simulate data collection starting
      setIsCollectingData(true);
      
      const cleanupFn = await sendStreamingMultiAgentChatMessage(
        payload,
        (message: string) => {
          addDebugLog(`Received message: ${message.substring(0, 50)}...`);
          setStreamingMessage(message);
        },
        (finalData) => {
          addDebugLog(`Received final data: ${JSON.stringify(finalData).substring(0, 50)}...`);
          setStreamingMessage("");
          
          // Add AI message to chat
          if (finalData.bot_message) {
            const aiMessage: ChatMessageType = {
              content: finalData.bot_message,
              type: "ai",
            };
            setMessages((prev) => [...prev, aiMessage]);
          }
          
          // Update session data if provided
          if (finalData.session_id) {
            addDebugLog(`Setting session ID: ${finalData.session_id}`);
            setSessionId(finalData.session_id);
          }
          
          if (finalData.updated_system_prompt) {
            addDebugLog(`Received system prompt of length: ${finalData.updated_system_prompt.length}`);
            setSystemPrompt(finalData.updated_system_prompt);
          }
          
          // Update collected data if provided
          if (finalData.collected_data && finalData.collected_data.length > 0) {
            addDebugLog(`Received collected data: ${finalData.collected_data.length} items`);
            setIsCollectingData(false);
            setCollectedData(finalData.collected_data);
            
            // Start analysis phase
            setIsAnalyzing(true);
          }
          
          // Update analysis results if provided
          if (finalData.analysis_results) {
            addDebugLog(`Received analysis results of length: ${finalData.analysis_results.length}`);
            setIsAnalyzing(false);
            setAnalysisResults(finalData.analysis_results);
          }
          
          setLoading(false);
          
          // Clear the cleanup function since it's done
          cleanupFunctionRef.current = null;
        },
        (error: string) => {
          console.error("Streaming error:", error);
          addDebugLog(`Error: ${error}`);
          setStreamingMessage("");
          setMessages((prev) => [
            ...prev,
            { content: `Error: ${error}`, type: "ai" } as ChatMessageType,
          ]);
          setIsCollectingData(false);
          setIsAnalyzing(false);
          setLoading(false);
          
          // Clear the cleanup function since it's done
          cleanupFunctionRef.current = null;
        }
      );
      
      // Store the cleanup function
      if (cleanupFn) {
        cleanupFunctionRef.current = cleanupFn;
      }
      
      return cleanupFn;
    } catch (error) {
      console.error("Error in streaming chat:", error);
      addDebugLog(`Exception: ${error}`);
      setIsCollectingData(false);
      setIsAnalyzing(false);
      setLoading(false);
      
      // Clear the cleanup function in case of error
      cleanupFunctionRef.current = null;
    }
  }, [addDebugLog]);
  
  // Handle sending a message
  const handleSend = useCallback(async () => {
    if (!input.trim()) return;
    
    const userMessage: ChatMessageType = { content: input, type: "human" };
    setStreamingMessage("");
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    
    try {
      // Create a payload for the multi-agent API
      const payload: MultiAgentChatPayload = {
        query: input,
        session_id: sessionId || undefined,
        history: [...messages],
        system_prompt: systemPrompt || undefined,
      };
      
      addDebugLog(`Sending message: ${input}`);
      
      if (isStreaming) {
        await handleStreamingChat(payload);
      } else {
        // Use the non-streaming service
        addDebugLog("Using non-streaming service");
        const response = await sendMultiAgentChatMessage(payload);
        addDebugLog(`Received response: ${JSON.stringify(response).substring(0, 50)}...`);
        
        // Handle the response
        if (response.bot_message) {
          const aiMessage: ChatMessageType = {
            content: response.bot_message,
            type: "ai",
          };
          setMessages((prev) => [...prev, aiMessage]);
        }
        
        // Update session data if provided
        if (response.session_id) setSessionId(response.session_id);
        if (response.updated_system_prompt) setSystemPrompt(response.updated_system_prompt);
        if (response.collected_data) setCollectedData(response.collected_data);
        if (response.analysis_results) setAnalysisResults(response.analysis_results);
        
        setLoading(false);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      addDebugLog(`Exception in handleSend: ${error}`);
      setMessages((prev) => [
        ...prev,
        { content: "Sorry, I encountered an error processing your request. Please try again.", type: "ai" } as ChatMessageType,
      ]);
      setIsCollectingData(false);
      setIsAnalyzing(false);
      setLoading(false);
      message.error("Failed to connect to the multi-agent system");
    }
  }, [input, messages, sessionId, systemPrompt, isStreaming, handleStreamingChat, addDebugLog]);
  
  // Handle keyboard input
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);
  
  // Clear chat history and data
  const clearHistory = useCallback(() => {
    // Clean up any existing connection first
    if (cleanupFunctionRef.current) {
      addDebugLog("Cleaning up EventSource before clearing history");
      cleanupFunctionRef.current();
      cleanupFunctionRef.current = null;
    }
    
    localStorage.removeItem(CHAT_HISTORY_KEY);
    localStorage.removeItem(SESSION_DATA_KEY);
    setMessages([]);
    setSessionId(null);
    setSystemPrompt(null);
    setCollectedData([]);
    setAnalysisResults("");
    setStreamingMessage("");
    setIsCollectingData(false);
    setIsAnalyzing(false);
    setDebugLog([]);
    
    addDebugLog("Chat history and data cleared");
  }, [addDebugLog]);
  
  return (
    <div className="flex flex-col h-screen">
      {/* Header area */}
      <div className="flex-none bg-gray-50 p-4 shadow-sm">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-700">Multi-Agent Research Assistant</h1>
          <div className="flex items-center gap-3">
            <Button 
              type="text"
              icon={<BugOutlined />}
              onClick={() => setShowDebug(!showDebug)}
              className={showDebug ? "text-blue-500" : "text-gray-500"}
            >
              Debug
            </Button>
            <button
              onClick={clearHistory}
              className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-150"
            >
              <DeleteOutlined className="text-sm" />
              <span>Clear All</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Debug panel */}
      {showDebug && (
        <div className="border-b border-gray-200 bg-gray-50 p-2 text-xs font-mono max-h-40 overflow-y-auto">
          <div className="font-bold mb-1">Debug Log:</div>
          {debugLog.map((log, idx) => (
            <div key={idx} className="text-gray-700">{log}</div>
          ))}
        </div>
      )}
      
      {/* Main content area with columns */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat column - always visible */}
        <div className="w-1/2 flex flex-col border-r border-gray-200">
          <div className="p-3 bg-gray-50 border-b border-gray-200">
            <h2 className="text-md font-semibold text-gray-700 flex items-center">
              <RobotOutlined className="mr-2" /> Chat
            </h2>
          </div>
          
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
            
            {/* Streaming message */}
            {streamingMessage && (
              <div className="flex justify-center">
                <div className="py-4 w-full rounded-2xl bg-gray-100">
                  <div className="max-w-3xl mx-auto flex gap-4 px-4">
                    <Avatar
                      icon={<RobotOutlined />}
                      className="bg-blue-500 text-white"
                      size={32}
                    />
                    <div className="flex-1 text-gray-800 text-sm leading-relaxed">
                      <div className="w-full">
                        <ReactMarkdown>{streamingMessage.replace(/\n/g, "  \n")}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Loading indicator */}
            {loading && !streamingMessage && (
              <div className="flex justify-center my-6">
                <div className="flex items-center space-x-3 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-blue-100">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 animate-pulse" />
                  <div className="text-gray-600 font-medium">
                    Processing your request
                  </div>
                  <div className="flex space-x-1">
                    {[0, 1, 2].map((dot) => (
                      <div
                        key={dot}
                        className="h-2 w-2 bg-blue-600 rounded-full animate-bounce"
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
          
          {/* Input area */}
          <div className="p-4 border-t border-gray-200">
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
            <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm border border-gray-200 p-2">
              <TextArea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask a research question..."
                autoSize={{ minRows: 1, maxRows: 4 }}
                className="flex-1 resize-none"
                disabled={loading}
                style={{
                  borderRadius: "8px",
                  padding: "10px 14px",
                  fontSize: "14px",
                  backgroundColor: "#ffffff",
                  border: "none",
                  boxShadow: "none",
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className={`rounded-lg h-10 w-10 flex items-center justify-center transition-all duration-150 ${
                  !input.trim() || loading
                    ? "bg-gray-200 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                }`}
              >
                <SendOutlined className="text-white text-lg" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Right column - Information and results */}
        <div className="w-1/2 flex flex-col">
          <Tabs defaultActiveKey="data" className="flex-1 overflow-hidden flex flex-col">
            <TabPane 
              tab={
                <span>
                  <DatabaseOutlined /> Collected Data
                  {isCollectingData && <Spin size="small" className="ml-2" />}
                </span>
              } 
              key="data"
              className="flex-1 overflow-hidden flex flex-col"
            >
              <div className="p-4 flex-1 overflow-y-auto">
                {collectedData.length > 0 ? (
                  <Collapse defaultActiveKey={['0']} className="bg-white">
                    {collectedData.map((item, index) => (
                      <Panel header={item.source} key={index}>
                        <div className="whitespace-pre-line">{item.content}</div>
                      </Panel>
                    ))}
                  </Collapse>
                ) : isCollectingData ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <Spin size="large" />
                    <p className="mt-4 text-gray-600">Collecting relevant data...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <DatabaseOutlined style={{ fontSize: '48px' }} />
                    <p className="mt-2">No data collected yet</p>
                  </div>
                )}
              </div>
            </TabPane>
            
            <TabPane 
              tab={
                <span>
                  <BulbOutlined /> Analysis
                  {isAnalyzing && <Spin size="small" className="ml-2" />}
                </span>
              } 
              key="analysis"
              className="flex-1 overflow-hidden flex flex-col"
            >
              <div className="p-4 flex-1 overflow-y-auto">
                {analysisResults ? (
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <ReactMarkdown>{analysisResults}</ReactMarkdown>
                  </div>
                ) : isAnalyzing ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <Spin size="large" />
                    <p className="mt-4 text-gray-600">Analyzing collected data...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <BulbOutlined style={{ fontSize: '48px' }} />
                    <p className="mt-2">No analysis results yet</p>
                  </div>
                )}
              </div>
            </TabPane>
            
            <TabPane 
              tab={
                <span>
                  <CodeOutlined /> System Prompt
                </span>
              } 
              key="prompt"
              className="flex-1 overflow-hidden flex flex-col"
            >
              <div className="p-4 flex-1 overflow-y-auto">
                {systemPrompt ? (
                  <div className="bg-gray-50 p-6 rounded-lg shadow-sm font-mono text-sm">
                    <pre className="whitespace-pre-wrap">{systemPrompt}</pre>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <CodeOutlined style={{ fontSize: '48px' }} />
                    <p className="mt-2">No system prompt defined yet</p>
                  </div>
                )}
              </div>
            </TabPane>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default MultiAgentChatContainer; 