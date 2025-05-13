import React from "react";
import { Avatar } from "antd";
import { UserOutlined, RobotOutlined } from "@ant-design/icons";
import { ChatMessage as ChatMessageType } from "../services/chatService";
import ReactMarkdown from "react-markdown";

const ChatMessage: React.FC<{ message: ChatMessageType }> = ({ message }) => {
  const isAI = message.type === "ai";

  // Convert newlines to <br/> for ReactMarkdown
  const formatContent = (content: string) => {
    return content.replace(/\n/g, "  \n");
  };

  return (
    <div className="flex justify-center">
      <div
        className={`py-4 w-2/3 rounded-2xl ${
          isAI ? "bg-gray-100" : "bg-white"
        }`}
      >
        <div className="max-w-3xl mx-auto flex gap-4 px-4">
          <Avatar
            icon={isAI ? <RobotOutlined /> : <UserOutlined />}
            className={`${isAI ? "bg-blue-500" : "bg-green-500"} text-white`}
            size={32}
          />
          <div className="flex-1 text-gray-800 text-sm leading-relaxed">
            <div className="w-full">
              <ReactMarkdown
                components={{
                  // This custom renderer ensures images are displayed properly
                  img: ({ node, src, alt, ...props }) => (
                    <img
                      src={src}
                      alt={alt || "Image"}
                      className="my-2 max-w-full rounded-md"
                      {...props}
                    />
                  ),
                }}
              >
                {formatContent(message.content)}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
