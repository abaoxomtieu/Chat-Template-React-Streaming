import React from "react";
import AdaptiveChatContainer from "../components/AdaptiveChatContainer";
import "../styles/chat.css";

const AdaptiveChat: React.FC = () => {
  return (
    <div className="h-screen">
      <AdaptiveChatContainer />
    </div>
  );
};

export default AdaptiveChat; 