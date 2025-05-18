import React from "react";
import MultiAgentChatContainer from "../components/MultiAgentChatContainer";
import "../styles/chat.css";

const MultiAgentChat: React.FC = () => {
  return (
    <div className="h-screen">
      <MultiAgentChatContainer />
    </div>
  );
};

export default MultiAgentChat; 