import React from "react";
import { Card, Button, Typography, Switch, Space } from "antd";
import { Chatbot } from "../../services/chatbotService";
import CombatSelect from "./CombatSelect";
import { combatBackgrounds } from "../../styles/combatStyles";

const { Text: AntText } = Typography;

export const modelOptions = [
  { label: "Gemini 2.5 Flash", value: "gemini-2.5-flash-preview-05-20" },
  { label: "Gemini 2.0 Flash", value: "gemini-2.0-flash" },
];

interface CombatSelectionProps {
  chatbots: Chatbot[];
  leftChatbot: string | null;
  setLeftChatbot: (id: string | null) => void;
  rightChatbot: string | null;
  setRightChatbot: (id: string | null) => void;
  leftModelName: string;
  setLeftModelName: (model: string) => void;
  rightModelName: string;
  setRightModelName: (model: string) => void;
  agent_ask: "left" | "right";
  setAgentAsk: (side: "left" | "right") => void;
  onStartConversation: () => void;
}

const CombatSelection: React.FC<CombatSelectionProps> = ({
  chatbots,
  leftChatbot,
  setLeftChatbot,
  rightChatbot,
  setRightChatbot,
  leftModelName,
  setLeftModelName,
  rightModelName,
  setRightModelName,
  agent_ask,
  setAgentAsk,
  onStartConversation,
}) => {
  return (
    <div
      className="min-h-screen p-8 relative overflow-hidden"
      style={{
        background: combatBackgrounds.main,
      }}
    >
      {/* Floating combat elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 text-6xl animate-spin-slow">
          ⚔️
        </div>
        <div className="absolute top-20 right-20 text-4xl animate-pulse">
          🛡️
        </div>
        <div className="absolute bottom-20 left-20 text-5xl animate-bounce">
          ⚡
        </div>
        <div className="absolute bottom-10 right-10 text-6xl animate-spin-slow">
          🏆
        </div>
        <div className="absolute top-1/2 left-5 text-3xl animate-pulse delay-500">
          🔥
        </div>
        <div className="absolute top-1/3 right-5 text-3xl animate-pulse delay-1000">
          💥
        </div>
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
                  <span className="text-cyan-300 font-bold text-xl">
                    Left Fighter
                  </span>
                  <div className="text-2xl ml-2 animate-shake">⚔️</div>
                </div>
              }
              className="shadow-2xl hover:shadow-cyan-500/50 transition-shadow duration-200 bg-gradient-to-br from-blue-900/80 to-cyan-800/80 border-2 border-cyan-400/50 backdrop-blur-sm combat-glow"
              bodyStyle={{ background: "rgba(0, 0, 0, 0.3)" }}
            >
              <div className="space-y-4">
                <CombatSelect
                  value={leftChatbot || ""}
                  onChange={setLeftChatbot}
                  options={chatbots.map((bot) => ({
                    label: bot.name,
                    value: bot.id,
                  }))}
                  placeholder="Select a chatbot"
                  side="left"
                />
                <CombatSelect
                  value={leftModelName}
                  onChange={setLeftModelName}
                  options={modelOptions}
                  placeholder="Select a model"
                  side="left"
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
                  <div className="text-2xl mr-2 animate-float delay-300">
                    🤖
                  </div>
                  <span className="text-red-300 font-bold text-xl">
                    Right Fighter
                  </span>
                  <div className="text-2xl ml-2 animate-shake delay-500">
                    ⚔️
                  </div>
                </div>
              }
              className="shadow-2xl hover:shadow-red-500/50 transition-shadow duration-200 bg-gradient-to-br from-red-900/80 to-pink-800/80 border-2 border-red-400/50 backdrop-blur-sm combat-glow"
              bodyStyle={{ background: "rgba(0, 0, 0, 0.3)" }}
            >
              <div className="space-y-4">
                <CombatSelect
                  value={rightChatbot || ""}
                  onChange={setRightChatbot}
                  options={chatbots.map((bot) => ({
                    label: bot.name,
                    value: bot.id,
                  }))}
                  placeholder="Select a chatbot"
                  side="right"
                />
                <CombatSelect
                  value={rightModelName}
                  onChange={setRightModelName}
                  options={modelOptions}
                  placeholder="Select a model"
                  side="right"
                />
              </div>
            </Card>
          </div>
        </div>

        {/* First Ask Switch */}
        <Card
          className="mb-8 shadow-2xl hover:shadow-yellow-500/30 transition-shadow duration-200 bg-gradient-to-r from-purple-900/80 to-indigo-900/80 border-2 border-yellow-400/50 backdrop-blur-sm combat-glow"
          bodyStyle={{ background: "rgba(0, 0, 0, 0.3)" }}
        >
          <div className="flex items-center justify-center gap-4">
            <AntText strong className="text-xl text-yellow-300 font-bold">
              ⚔️
            </AntText>
            <AntText strong className="text-xl text-yellow-300 font-bold">
              First Asking Agent:
            </AntText>
            <Space className="bg-black/50 p-4 rounded-lg border border-yellow-400/30">
              <AntText
                className={`text-lg font-bold ${
                  agent_ask === "left" ? "text-cyan-400" : "text-gray-400"
                }`}
              >
                🤖 Left AI
              </AntText>
              <Switch
                checked={agent_ask === "right"}
                onChange={(checked) => setAgentAsk(checked ? "right" : "left")}
                className="scale-125 bg-yellow-600"
              />
              <AntText
                className={`text-lg font-bold ${
                  agent_ask === "right" ? "text-red-400" : "text-gray-400"
                }`}
              >
                Right AI 🤖
              </AntText>
            </Space>
            <AntText strong className="text-xl text-yellow-300 font-bold">
              ⚔️
            </AntText>
          </div>
        </Card>

        <div className="text-center">
          <Button
            type="primary"
            size="large"
            disabled={!leftChatbot || !rightChatbot}
            className="bg-gradient-to-r from-yellow-500 via-red-500 to-purple-600 hover:from-yellow-600 hover:via-red-600 hover:to-purple-700 text-white text-xl font-bold px-12 py-6 h-auto shadow-2xl hover:shadow-yellow-500/50 transition-all duration-200 border-2 border-yellow-400 animate-glow combat-glow"
            onClick={onStartConversation}
          >
            ⚔️ Start Conversation 🏟️
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CombatSelection; 