import React from "react";
import ChatContainer from "../components/ChatContainer";
import "../styles/chat.css";

const Chat: React.FC = () => {
  return (
      <div className="h-screen">
        <ChatContainer />
      </div>
  );
};

export default Chat;
