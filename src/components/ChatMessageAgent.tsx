import React from "react";
import { Avatar } from "antd";
import { UserOutlined, RobotOutlined } from "@ant-design/icons";
import ReactMarkdown from "react-markdown";

interface MessageContent {
  type: string;
  text?: string;
  source_type?: string;
  url?: string;
}

interface AgentMessage {
  role: string;
  content: string | MessageContent[];
}

const ChatMessageAgent: React.FC<{ message: AgentMessage }> = ({ message }) => {
  const isAI = message.role === "assistant";

  // Convert newlines to <br/> for ReactMarkdown
  const formatContent = (content: string) => {
    return content.replace(/\n/g, "  \n");
  };

  // Process the message content based on its type
  const renderContent = () => {
    if (typeof message.content === "string") {
      // Simple text content
      return (
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
      );
    } else {
      // Complex content with text and images
      return (
        <div>
          {message.content.map((item, index) => {
            if (item.type === "text" && item.text) {
              return (
                <ReactMarkdown key={`text-${index}`}>
                  {formatContent(item.text)}
                </ReactMarkdown>
              );
            } else if (item.type === "image" && item.url) {
              return (
                <div key={`image-${index}`} className="my-2">
                  <img
                    src={item.url}
                    alt="Chat image"
                    className="max-w-full rounded-md"
                  />
                </div>
              );
            }
            return null;
          })}
        </div>
      );
    }
  };

  return (
    <div className="flex justify-center">
      <div
        className={`py-4 w-2/3 rounded-2xl ${isAI ? "bg-gray-100" : "bg-white"}`}
      >
        <div className="max-w-3xl mx-auto flex gap-4 px-4">
          <Avatar
            icon={isAI ? <RobotOutlined /> : <UserOutlined />}
            className={`${isAI ? "bg-blue-500" : "bg-green-500"} text-white`}
            size={32}
          />
          <div className="flex-1 text-gray-800 text-sm leading-relaxed">
            <div className="w-full">{renderContent()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessageAgent;
