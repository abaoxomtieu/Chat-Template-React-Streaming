import React, { useRef } from "react";
import { Button, Tag } from "antd";
import { LeftOutlined, StopOutlined } from "@ant-design/icons";
import { Chatbot } from "../../services/chatbotService";
import CombatSelect from "./CombatSelect";
import CombatChatMessages from "./CombatChatMessages";
import { StructuredMessage } from "./CombatMessage";
import { combatBackgrounds } from "../../styles/combatStyles";
import { modelOptions } from "./CombatSelection";

interface CombatArenaProps {
  leftBot: Chatbot | undefined;
  rightBot: Chatbot | undefined;
  leftModelName: string;
  setLeftModelName: (model: string) => void;
  rightModelName: string;
  setRightModelName: (model: string) => void;
  messages: StructuredMessage[];
  streamingMessage: string;
  isConversationActive: boolean;
  agent_ask: "left" | "right";
  onBackToSelection: () => void;
  onStopConversation: () => void;
}

const CombatArena: React.FC<CombatArenaProps> = ({
  leftBot,
  rightBot,
  leftModelName,
  setLeftModelName,
  rightModelName,
  setRightModelName,
  messages,
  streamingMessage,
  isConversationActive,
  agent_ask,
  onBackToSelection,
  onStopConversation,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className="h-screen flex flex-col relative"
      style={{
        background: combatBackgrounds.arena,
      }}
    >
      {/* Arena Background Effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full">
          {/* Lightning effects */}
          <div className="absolute top-10 left-10 w-8 h-8 animate-pulse">
            ⚡
          </div>
          <div className="absolute top-20 right-20 w-8 h-8 animate-pulse delay-300">
            ⚡
          </div>
          <div className="absolute bottom-20 left-1/4 w-8 h-8 animate-pulse delay-700">
            ⚡
          </div>
          <div className="absolute bottom-10 right-1/3 w-8 h-8 animate-pulse delay-1000">
            ⚡
          </div>

          {/* Swords */}
          <div className="absolute top-1/4 left-5 text-4xl animate-bounce delay-500">
            ⚔️
          </div>
          <div className="absolute top-1/3 right-5 text-4xl animate-bounce delay-1500 transform rotate-45">
            ⚔️
          </div>

          {/* Fire effects */}
          <div className="absolute bottom-1/4 left-10 text-2xl animate-pulse delay-200">
            🔥
          </div>
          <div className="absolute bottom-1/3 right-10 text-2xl animate-pulse delay-800">
            🔥
          </div>
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
              onClick={onBackToSelection}
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
                  <div className="m-0 text-cyan-300 font-bold shadow-lg">
                    {leftBot?.name}
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="px-4 py-1 text-sm font-bold border-2 border-cyan-400 bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg">
                    Left AI
                  </Tag>
                  <CombatSelect
                    value={leftModelName}
                    onChange={setLeftModelName}
                    options={modelOptions}
                    placeholder="Select a model"
                    side="left"
                  />
                </div>
              </div>
              <div className="text-6xl font-bold text-yellow-400 animate-pulse shadow-2xl relative">
                <div className="absolute inset-0 text-red-500 animate-ping opacity-50">
                  ⚔️
                </div>
                VS
              </div>
              <div className="text-center transform hover:scale-105 transition-transform duration-200 relative">
                {/* Right fighter glow */}
                <div className="absolute inset-0 bg-red-500/20 rounded-lg blur-lg animate-pulse delay-500"></div>
                <div className="flex items-center justify-center mb-2">
                  <div className="text-3xl mr-2 animate-bounce delay-300">
                    🤖
                  </div>
                  <div className="m-0 text-red-300 font-bold shadow-lg">
                    {rightBot?.name}
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="px-4 py-1 text-sm font-bold border-2 border-red-400 bg-gradient-to-r from-red-600 to-pink-500 text-white shadow-lg">
                    Right AI
                  </Tag>
                  <CombatSelect
                    value={rightModelName}
                    onChange={setRightModelName}
                    options={modelOptions}
                    placeholder="Select a model"
                    side="right"
                  />
                </div>
              </div>
            </div>
            <Button
              type="primary"
              danger
              icon={<StopOutlined />}
              onClick={onStopConversation}
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

        <CombatChatMessages
          messages={messages}
          streamingMessage={streamingMessage}
          messagesEndRef={messagesEndRef}
          agent_ask={agent_ask}
        />
      </div>
    </div>
  );
};

export default CombatArena; 