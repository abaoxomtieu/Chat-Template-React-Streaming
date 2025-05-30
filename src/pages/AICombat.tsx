import React, { useEffect, useState } from "react";
import { Chatbot, fetchChatbots } from "../services/chatbotService";
import { useAICombat } from "../hooks/useAICombat";
import { arenaStyles } from "../styles/combatStyles";
import CombatSelection from "../components/combat/CombatSelection";
import CombatArena from "../components/combat/CombatArena";

const AICombat: React.FC = () => {
  // Inject custom styles
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.textContent = arenaStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [leftChatbot, setLeftChatbot] = useState<string | null>(null);
  const [rightChatbot, setRightChatbot] = useState<string | null>(null);
  const [isConversationStarted, setIsConversationStarted] = useState(false);
  const [agent_ask, setAgentAsk] = useState<"left" | "right">("left");
  const [leftModelName, setLeftModelName] = useState<string>(
    "gemini-2.5-flash-preview-05-20"
  );
  const [rightModelName, setRightModelName] = useState<string>(
    "gemini-2.5-flash-preview-05-20"
  );

  // Use the AI Combat hook
  const {
    messages,
    isConversationActive,
    streamingMessage,
    startConversation,
    stopConversation,
    resetConversation,
  } = useAICombat({
    leftChatbot,
    rightChatbot,
    leftModelName,
    rightModelName,
    agent_ask,
  });

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

  const handleStartConversation = async () => {
    setIsConversationStarted(true);
    await startConversation();
  };

  const handleStopConversation = () => {
    stopConversation();
  };

  const handleBackToSelection = () => {
    setIsConversationStarted(false);
    resetConversation();
  };

  if (isConversationStarted) {
    const leftBot = chatbots.find((bot) => bot.id === leftChatbot);
    const rightBot = chatbots.find((bot) => bot.id === rightChatbot);

    return (
      <CombatArena
        leftBot={leftBot}
        rightBot={rightBot}
        leftModelName={leftModelName}
        setLeftModelName={setLeftModelName}
        rightModelName={rightModelName}
        setRightModelName={setRightModelName}
        messages={messages}
        streamingMessage={streamingMessage}
        isConversationActive={isConversationActive}
        agent_ask={agent_ask}
        onBackToSelection={handleBackToSelection}
        onStopConversation={handleStopConversation}
      />
    );
  }

  return (
    <CombatSelection
      chatbots={chatbots}
      leftChatbot={leftChatbot}
      setLeftChatbot={setLeftChatbot}
      rightChatbot={rightChatbot}
      setRightChatbot={setRightChatbot}
      leftModelName={leftModelName}
      setLeftModelName={setLeftModelName}
      rightModelName={rightModelName}
      setRightModelName={setRightModelName}
      agent_ask={agent_ask}
      setAgentAsk={setAgentAsk}
      onStartConversation={handleStartConversation}
    />
  );
};

export default AICombat;
