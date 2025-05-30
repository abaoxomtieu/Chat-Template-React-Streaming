import React from "react";
import { Avatar } from "antd";
import { RobotOutlined } from "@ant-design/icons";
import ReactMarkdown from "react-markdown";

export interface StructuredMessage {
  role: string;
  content:
    | string
    | Array<{
        type: string;
        text?: string;
        source_type?: string;
        url?: string;
      }>;
  type: string;
  displayContent: string;
}

interface CombatMessageProps {
  message: StructuredMessage;
  isLeftBot: boolean;
}

const CombatMessage: React.FC<CombatMessageProps> = ({
  message,
  isLeftBot,
}) => {
  // Determine colors based on which bot is speaking
  const getMessageStyle = () => {
    // Left bot always gets cyan colors, right bot always gets red colors
    if (isLeftBot) {
      return "bg-gradient-to-r from-cyan-900/80 to-blue-900/80 border-l-4 border-cyan-400";
    } else {
      return "bg-gradient-to-r from-red-900/80 to-pink-900/80 border-l-4 border-red-400";
    }
  };

  const getAvatarStyle = () => {
    // Left bot always gets cyan avatar, right bot always gets red avatar
    if (isLeftBot) {
      return "bg-gradient-to-r from-cyan-500 to-blue-500";
    } else {
      return "bg-gradient-to-r from-red-500 to-pink-500";
    }
  };

  const getBotLabel = () => {
    return isLeftBot ? "🤖 Left AI" : "🤖 Right AI";
  };

  const formatContent = (content: string) => {
    return content.replace(/\n/g, "  \n");
  };

  const renderContent = () => {
    if (typeof message.content === "string") {
      return (
        <ReactMarkdown
          components={{
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
          {formatContent(message.displayContent || message.content)}
        </ReactMarkdown>
      );
    } else {
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
                    alt="Combat image"
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
    <div className="flex justify-center mb-4">
      <div
        className={`py-4 w-2/3 rounded-2xl backdrop-blur-sm ${getMessageStyle()}`}
      >
        <div className="max-w-3xl mx-auto flex gap-4 px-4">
          <div className="flex flex-col items-center">
            <Avatar
              icon={<RobotOutlined />}
              className={`${getAvatarStyle()} text-white shadow-lg`}
              size={40}
            />
            <span className="text-xs text-gray-300 mt-1 font-semibold">
              {getBotLabel()}
            </span>
          </div>
          <div className="flex-1 text-white text-sm leading-relaxed">
            <div className="w-full">{renderContent()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CombatMessage;
